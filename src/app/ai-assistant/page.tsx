"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Trash2, Copy, Sparkles, MessageSquare, ShieldCheck, Zap, Clock, Lock } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { aatmaAiAssistant } from "@/ai/flows/aatma-ai-assistant";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/hooks/use-translation";
import Link from "next/link";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function AiAssistantPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { lang } = useTranslation();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [cooldown, setCooldown] = useState(0);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Access Restriction Logic
  const isLocked = !authLoading && (!profile || (profile.role !== 'admin' && (profile.lifetimeRechargeAmount || 0) <= 0 && (profile.totalOrders || 0) <= 0));

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  useEffect(() => {
    const unsubSettings = onSnapshot(doc(db, "system_settings", "ai_assistant"), (docSnap) => {
      if (docSnap.exists()) {
        setIsAiEnabled(docSnap.data().isEnabled);
      }
    });

    let unsubMessages: any;
    if (user && !isLocked) {
      const q = query(
        collection(db, "ai_chats", user.uid, "messages"),
        orderBy("createdAt", "asc")
      );
      unsubMessages = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      }, async () => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: `ai_chats/${user.uid}/messages`,
          operation: 'list',
        } satisfies SecurityRuleContext));
      });

      // Fetch Quota
      const dateStr = new Date().toISOString().split('T')[0];
      const usageRef = doc(db, "users", user.uid, "ai_usage", dateStr);
      const unsubQuota = onSnapshot(usageRef, (docSnap) => {
        if (docSnap.exists()) {
           const count = docSnap.data().count || 0;
           let limit = 10;
           if ((profile?.lifetimeRechargeAmount || 0) > 500) limit = 999999;
           else if ((profile?.lifetimeRechargeAmount || 0) > 100) limit = 50;
           setRemainingQuota(limit < 999999 ? limit - count : null);
        } else {
           let limit = 10;
           if ((profile?.lifetimeRechargeAmount || 0) > 500) limit = 999999;
           else if ((profile?.lifetimeRechargeAmount || 0) > 100) limit = 50;
           setRemainingQuota(limit === 999999 ? null : limit);
        }
      });
      
      return () => {
        unsubSettings();
        if (unsubMessages) unsubMessages();
        unsubQuota();
      };
    } else {
      setMessages([{
        role: "bot",
        text: "Aatma Intelligence requires an active recharge to initialize. Sign in and load funds to unlock elite meta assistance.",
        createdAt: new Date().toISOString()
      }]);
    }

    return () => unsubSettings();
  }, [user, isLocked, profile]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !isAiEnabled || cooldown > 0 || isLocked) return;

    const userText = input;
    setInput("");
    setIsLoading(true);
    
    const userMsg = { role: "user", text: userText, createdAt: new Date().toISOString() };
    
    try {
      if (user) {
        const chatRef = doc(db, "ai_chats", user.uid);
        setDoc(chatRef, { lastMessage: userText, updatedAt: new Date().toISOString() }, { merge: true })
          .catch(() => {});

        await addDoc(collection(db, "ai_chats", user.uid, "messages"), userMsg);
      } else {
        setMessages(prev => [...prev, userMsg]);
      }

      const result = {
  answer: "AI TEST MODE WORKING"
};
      
      const botMsg = { role: "bot", text: result.answer, createdAt: new Date().toISOString() };

      if (user) {
        await addDoc(collection(db, "ai_chats", user.uid, "messages"), botMsg);
      } else {
        setMessages(prev => [...prev, botMsg]);
      }
    } catch (error: any) {
      console.error("[AiAssistantPage] Communication Error:", error);
      const isQuota = error.message?.includes('429') || error.message?.includes('RESOURCE_EXHAUSTED');
      
      if (isQuota) {
        setCooldown(60);
        const botMsg = { 
          role: "bot", 
          text: "Protocol Error: Intelligence node cooling down. Access will resume in 60s.", 
          createdAt: new Date().toISOString() 
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg = { 
          role: "bot", 
          text: "I'm having trouble syncing with the meta database. Re-attempt protocol shortly.", 
          createdAt: new Date().toISOString() 
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
    if (!confirm("Declassify all chat logs? This cannot be undone.")) return;
    
    const snap = await getDocs(collection(db, "ai_chats", user.uid, "messages"));
    const batch = snap.docs.map(d => deleteDoc(doc(db, "ai_chats", user.uid, "messages", d.id)));
    await Promise.all(batch);
    toast({ title: "Intelligence Purged" });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Response Captured" });
  };

  if (!isAiEnabled) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
           <Card className="max-w-md w-full bg-card border-white/5 text-center p-12 space-y-6">
              <div className="h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                 <Bot className="h-10 w-10 text-destructive" />
              </div>
              <h2 className="text-2xl font-headline font-bold uppercase">AI Assistant Offline</h2>
              <p className="text-muted-foreground">The AI Intelligence Node is currently undergoing maintenance. Please contact support via WhatsApp for urgent help.</p>
              <Button variant="outline" className="w-full border-white/10" asChild>
                 <a href="/contact">Go to Support</a>
              </Button>
           </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-8 relative overflow-hidden flex flex-col">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10" />
        
        <div className="container mx-auto px-4 max-w-5xl flex-1 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center neon-glow">
                   <Bot className="h-7 w-7 text-primary-foreground" />
                </div>
                <div>
                   <h1 className="text-3xl font-headline font-bold uppercase tracking-tighter">Aatma <span className="text-primary">Intelligence</span></h1>
                   <div className="flex items-center gap-2">
                      <span className={`h-1.5 w-1.5 rounded-full ${cooldown > 0 ? 'bg-orange-500' : 'bg-green-500 animate-pulse'}`} />
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {isLocked ? 'Access Restricted' : cooldown > 0 ? `Cooldown: ${cooldown}s` : remainingQuota !== null ? `${remainingQuota} signals remaining today` : 'Elite Protocol Active'}
                      </p>
                   </div>
                </div>
             </div>
             {!isLocked && (
               <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 font-bold uppercase text-[10px] tracking-widest" onClick={clearHistory}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Memory
               </Button>
             )}
          </div>

          <Card className="flex-1 bg-card/40 border-white/5 backdrop-blur-xl flex flex-col overflow-hidden rounded-[2rem]">
             <CardHeader className="bg-white/5 border-b border-white/5 flex flex-row items-center justify-between px-8 py-4">
                <div className="flex gap-2">
                   <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">LLM-PRO</Badge>
                   <Badge variant="outline" className="text-[9px] uppercase border-white/10 text-muted-foreground">GEMINI 2.0</Badge>
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                   <ShieldCheck className="h-3 w-3 text-green-500" />
                   End-to-End Encrypted
                </div>
             </CardHeader>
             
             <CardContent className="flex-1 p-0 overflow-hidden relative">
                {isLocked ? (
                  <div className="h-full flex flex-col items-center justify-center p-20 text-center space-y-8 animate-in fade-in duration-700">
                     <div className="h-32 w-32 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                        <Lock className="h-12 w-12 text-primary opacity-30" />
                     </div>
                     <div className="space-y-4 max-w-sm">
                        <h2 className="text-3xl font-headline font-bold uppercase tracking-tighter">Node Restricted</h2>
                        <p className="text-sm text-muted-foreground font-bold uppercase leading-relaxed tracking-widest opacity-60">
                           Recharge your wallet to unlock Aatma Intelligence.
                        </p>
                     </div>
                     <Button size="lg" className="neon-glow h-16 px-12 font-bold text-xl uppercase tracking-tighter rounded-2xl" asChild>
                        <Link href="/wallet/add">Initialize First Recharge</Link>
                     </Button>
                  </div>
                ) : (
                  <ScrollArea className="h-full p-8" viewportRef={scrollRef}>
                    <div className="space-y-8 pb-4">
                       {messages.map((m, i) => (
                         <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] md:max-w-[70%] space-y-2`}>
                               <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl relative ${
                                 m.role === 'user' 
                                   ? 'bg-primary text-primary-foreground font-bold rounded-tr-none' 
                                   : 'bg-muted/50 border border-white/5 rounded-tl-none'
                               }`}>
                                  {m.text}
                                  {m.role === 'bot' && (
                                    <button 
                                      onClick={() => copyToClipboard(m.text)}
                                      className="absolute -right-10 top-0 p-2 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                       <Copy className="h-4 w-4 hover:text-white" />
                                    </button>
                                  )}
                               </div>
                               <p className={`text-[9px] font-bold uppercase tracking-widest text-muted-foreground ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                                  {m.role === 'user' ? (profile?.firstName || 'YOU') : 'AATMA HUB'} • {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                            </div>
                         </div>
                       ))}
                       {isLoading && (
                         <div className="flex justify-start animate-in fade-in duration-300">
                            <div className="bg-muted/30 border border-white/5 p-4 rounded-[2rem] rounded-tl-none flex items-center gap-3">
                               <Loader2 className="h-4 w-4 animate-spin text-primary" />
                               <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground animate-pulse">Syncing Meta...</span>
                            </div>
                         </div>
                       )}
                    </div>
                  </ScrollArea>
                )}
             </CardContent>

             <CardFooter className="p-6 bg-black/40 border-t border-white/5">
                <div className="flex w-full gap-4 items-center bg-muted/20 p-2 rounded-[2rem] border border-white/5 shadow-inner">
                   <div className="h-10 w-10 shrink-0 bg-primary/10 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                   </div>
                   <Input 
                      placeholder={isLocked ? "Access Protocol Suspended" : cooldown > 0 ? `Cooling down (${cooldown}s)...` : isLoading ? "Cooling down..." : "Ask about orders, top-ups, or game meta..."}
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 text-white placeholder:text-muted-foreground h-12"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isLoading || cooldown > 0 || isLocked}
                   />
                   <Button size="icon" className="h-12 w-12 rounded-full neon-glow shrink-0" onClick={handleSend} disabled={isLoading || !input.trim() || cooldown > 0 || isLocked}>
                      {cooldown > 0 ? <Clock className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                   </Button>
                </div>
             </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
