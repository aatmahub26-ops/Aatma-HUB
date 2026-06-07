"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2, Maximize2, Zap, ShieldCheck, Sparkles, Clock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aatmaAiAssistant } from "@/ai/flows/aatma-ai-assistant";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

type Message = {
  id?: string;
  role: "bot" | "user";
  text: string;
  createdAt: any;
};

export function AatmaAiAssistant() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { lang, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Determine Access Protocol
  const isLocked = !authLoading && (!profile || (profile.role !== 'admin' && (profile.lifetimeRechargeAmount || 0) <= 0 && (profile.totalOrders || 0) <= 0));

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // 2. Fetch Usage Protocol
  useEffect(() => {
    if (user && isOpen && !isLocked) {
      const dateStr = new Date().toISOString().split('T')[0];
      const usageRef = doc(db, "users", user.uid, "ai_usage", dateStr);
      const unsub = onSnapshot(usageRef, (docSnap) => {
        if (docSnap.exists()) {
           const count = docSnap.data().count || 0;
           let limit = 10;
           if ((profile?.lifetimeRechargeAmount || 0) > 500) limit = 999999;
           else if ((profile?.lifetimeRechargeAmount || 0) > 100) limit = 50;
           
           if (limit < 999999) setRemainingQuota(limit - count);
           else setRemainingQuota(null);
        } else {
           let limit = 10;
           if ((profile?.lifetimeRechargeAmount || 0) > 500) limit = 999999;
           else if ((profile?.lifetimeRechargeAmount || 0) > 100) limit = 50;
           setRemainingQuota(limit === 999999 ? null : limit);
        }
      });
      return () => unsub();
    }
  }, [user, isOpen, profile, isLocked]);

  useEffect(() => {
    if (!user || !isOpen || isLocked) {
      if (!user && messages.length === 0) {
         setMessages([{ role: "bot", text: "Hello! I'm Aatma AI. Sign in and recharge to unlock my assistance!", createdAt: new Date() }]);
      }
      return;
    }

    const q = query(
      collection(db, "ai_chats", user.uid, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const history = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      if (history.length === 0 && messages.length <= 1) {
        setMessages([{ role: "bot", text: `Protocol Synchronized, ${profile?.firstName || 'Operator'}. How can I assist your gaming dispatch today?`, createdAt: new Date() }]);
      } else if (history.length > 0) {
        setMessages(history);
      }
    }, async (serverError) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `ai_chats/${user.uid}/messages`,
        operation: 'list',
      } satisfies SecurityRuleContext));
    });

    return () => unsubscribe();
  }, [user, isOpen, profile, isLocked]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || cooldown > 0 || isLocked) return;

    const userText = input;
    setInput("");
    setIsLoading(true);
    
    const userMsg: Message = { 
      role: "user", 
      text: userText, 
      createdAt: serverTimestamp() 
    };

    try {
      if (user) {
        const chatRef = doc(db, "ai_chats", user.uid);
        setDoc(chatRef, { lastMessage: userText, updatedAt: serverTimestamp() }, { merge: true })
          .catch(() => {});

        await addDoc(collection(db, "ai_chats", user.uid, "messages"), userMsg);
      } else {
        setMessages(prev => [...prev, { ...userMsg, createdAt: new Date() }]);
      }

      const result = await aatmaAiAssistant({ 
        query: userText,
        language: lang,
        userId: user?.uid,
        userContext: {
          isLoggedIn: !!user,
          role: profile?.role || 'user',
          firstName: profile?.firstName,
          currentRank: profile?.currentRank || 'Recruit'
        }
      });

      const botMsg: Message = { 
        role: "bot", 
        text: result.answer, 
        createdAt: serverTimestamp() 
      };

      if (user) {
        await addDoc(collection(db, "ai_chats", user.uid, "messages"), botMsg);
      } else {
        setMessages(prev => [...prev, { ...botMsg, createdAt: new Date() }]);
      }
    } catch (error: any) {
      console.error("[AatmaAiAssistant] Communication Error:", error);
      const isQuota = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuota) {
        setCooldown(60);
        const botMsg: Message = { 
          role: "bot", 
          text: "AI intelligence node is cooling down. Access will resume in 60 seconds.", 
          createdAt: new Date() 
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg: Message = { 
          role: "bot", 
          text: "I encountered a synchronization error. Please check your network protocol.", 
          createdAt: new Date() 
        };
        setMessages(prev => [...prev, botMsg]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) {
      setMessages([]);
      return;
    }
    if (!confirm("Wipe AI intelligence logs?")) return;
    const snap = await getDocs(collection(db, "ai_chats", user.uid, "messages"));
    const batch = snap.docs.map(d => deleteDoc(doc(db, "ai_chats", user.uid, "messages", d.id)));
    await Promise.all(batch).catch(() => {
      toast({ title: "Clear Failed", variant: "destructive" });
    });
    toast({ title: "Intelligence Purged" });
  };

  return (
    <div className="fixed bottom-3 right-3 z-[100]">
      {!isOpen ? (
        <Button
          size="icon"
          className="h-14 w-14 rounded-2xl shadow-2xl bg-primary hover:bg-primary/90 transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
          onClick={() => setIsOpen(true)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Bot className="h-7 w-7 text-white" />
          {!isLocked && <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />}
          {isLocked && <Lock className="absolute -top-1 -right-1 h-4 w-4 text-white bg-destructive p-0.5 rounded-full border-2 border-background" />}
        </Button>
      ) : (
        <Card className="w-[calc(100vw-24px)] sm:w-[380px] h-[550px] max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(158,102,255,0.4)] animate-in slide-in-from-bottom-5 duration-300 bg-card/95 backdrop-blur-xl border-primary/20 rounded-[2rem] overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-white/5 bg-primary/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center neon-glow">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-headline uppercase tracking-tighter text-white">Aatma Intelligence</h3>
                <div className="flex items-center gap-1.5">
                   <span className={`h-1 w-1 rounded-full ${cooldown > 0 ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`} />
                   <p className="text-[8px] text-muted-foreground uppercase font-bold tracking-widest">
                     {cooldown > 0 ? 'Cooling Down' : remainingQuota !== null ? `${remainingQuota} signals remaining` : 'Elite Protocol Active'}
                   </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" asChild>
                <Link href="/ai-assistant"><Maximize2 className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            {isLocked ? (
              <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
                 <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <ShieldCheck className="h-10 w-10 text-primary opacity-20" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-sm font-headline font-bold uppercase tracking-tight">Intelligence Restricted</h4>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase leading-relaxed tracking-widest opacity-60">
                       Recharge your hub wallet to unlock Aatma Intelligence.
                    </p>
                 </div>
                 <Button className="w-full h-12 font-bold uppercase tracking-widest text-[10px] rounded-xl neon-glow" asChild>
                    <Link href="/wallet/add">Initialize First Recharge</Link>
                 </Button>
              </div>
            ) : (
              <ScrollArea className="h-full p-5" viewportRef={scrollRef}>
                <div className="space-y-5 pb-4">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1`}>
                      <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-xs leading-relaxed shadow-lg ${
                        m.role === "user" 
                          ? "bg-primary text-primary-foreground font-bold rounded-tr-none" 
                          : "bg-muted/80 border border-white/5 rounded-tl-none text-foreground"
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted/40 border border-white/5 rounded-2xl px-4 py-2.5 flex items-center space-x-3">
                        <Loader2 className="h-3 w-3 animate-spin text-primary" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Meta...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </CardContent>

          <CardFooter className="p-4 border-t border-white/5 flex flex-col gap-3 bg-black/40">
            <div className="flex w-full space-x-2">
              <Input
                placeholder={isLocked ? "Access Locked" : cooldown > 0 ? `Cooling down (${cooldown}s)...` : isLoading ? "Syncing..." : "Ask about orders or game meta..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-11 bg-black/40 border-white/10 text-xs rounded-xl focus:ring-primary/50"
                disabled={isLoading || cooldown > 0 || isLocked}
              />
              <Button size="icon" className="h-11 w-11 rounded-xl neon-glow shrink-0" onClick={handleSend} disabled={isLoading || !input.trim() || cooldown > 0 || isLocked}>
                {cooldown > 0 ? <Clock className="h-4 w-4" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            {!isLocked && (
              <div className="flex justify-between items-center px-1">
                 <button onClick={clearHistory} className="text-[8px] font-bold uppercase text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                    <Trash2 className="h-3 w-3" /> Purge Memory
                 </button>
                 <div className="flex items-center gap-2 opacity-30">
                    <Zap className="h-3 w-3 text-primary" />
                    <p className="text-[7px] font-bold text-muted-foreground uppercase tracking-widest">Aatma HQ Node</p>
                 </div>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}