
"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2, Trash2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { aatmaAiAssistant } from "@/ai/flows/aatma-ai-assistant";
import { useAuth } from "@/context/AuthContext";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, deleteDoc, getDocs, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useTranslation } from "@/hooks/use-translation";

type Message = {
  id?: string;
  role: "bot" | "user";
  text: string;
  createdAt: any;
};

export function SupportChat() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const { lang, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Load history from Firestore if logged in
  useEffect(() => {
    if (!user || !isOpen) {
      if (!user && messages.length === 0) {
         setMessages([{ role: "bot", text: "Hello! I'm Aatma AI. How can I help you today?", createdAt: new Date() }]);
      }
      return;
    }

    const q = query(
      collection(db, "chats", user.uid, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const history = snap.docs.map(d => ({ id: d.id, ...d.data() } as Message));
      if (history.length === 0 && messages.length <= 1) {
        setMessages([{ role: "bot", text: `Welcome back, ${profile?.firstName || 'Player'}! How can I assist your squad today?`, createdAt: new Date() }]);
      } else if (history.length > 0) {
        setMessages(history);
      }
    });

    return () => unsubscribe();
  }, [user, isOpen, profile]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput("");
    
    const userMsg: Message = { 
      role: "user", 
      text: userText, 
      createdAt: serverTimestamp() 
    };

    if (user) {
      await addDoc(collection(db, "chats", user.uid, "messages"), userMsg);
    } else {
      setMessages(prev => [...prev, { ...userMsg, createdAt: new Date() }]);
    }

    setIsLoading(true);

    try {
      const result = await aatmaAiAssistant({ 
        query: userText,
        language: lang,
        userContext: {
          isLoggedIn: !!user,
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
        await addDoc(collection(db, "chats", user.uid, "messages"), botMsg);
      } else {
        setMessages(prev => [...prev, { ...botMsg, createdAt: new Date() }]);
      }
    } catch (error) {
      const errMsg: Message = { role: "bot", text: "Communication node unstable. Please try again.", createdAt: new Date() };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    if (!user) {
      setMessages([]);
      return;
    }
    const snap = await getDocs(collection(db, "chats", user.uid, "messages"));
    snap.docs.forEach(async (d) => {
      await deleteDoc(doc(db, "chats", user.uid, "messages", d.id));
    });
    toast({ title: "Memory Purged" });
  };

  return (
    <div className="fixed bottom-2 right-3 z-[60]">
      {!isOpen ? (
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-2xl neon-glow transition-transform hover:scale-110"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      ) : (
        <Card className="w-[calc(100vw-24px)] sm:w-[380px] h-[550px] max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200 bg-card/95 backdrop-blur-xl border-white/10 rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-white/5 bg-primary/10">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center neon-glow">
                <Bot className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-headline uppercase tracking-tighter">Aatma Intelligence</h3>
                <div className="flex items-center gap-1.5">
                   <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                   <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">{t("ai_status")}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" asChild>
                <Link href="/ai-assistant"><Maximize2 className="h-4 w-4" /></Link>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-0 overflow-hidden relative">
            <ScrollArea className="h-full p-4" viewportRef={scrollRef}>
              <div className="space-y-4 pb-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-1`}>
                    <div className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      m.role === "user" 
                        ? "bg-primary text-primary-foreground font-bold rounded-tr-none" 
                        : "bg-muted/80 border border-white/5 rounded-tl-none text-white"
                    }`}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted/40 border border-white/5 rounded-2xl px-4 py-2 flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Syncing Meta...</span>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>

          <CardFooter className="p-4 border-t border-white/5 flex flex-col gap-3 bg-black/20">
            <div className="flex w-full space-x-2">
              <Input
                placeholder={t("ai_ask_placeholder")}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 h-11 bg-black/40 border-white/10 text-xs"
                disabled={isLoading}
              />
              <Button size="icon" className="h-11 w-11 rounded-xl neon-glow" onClick={handleSend} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex justify-between items-center px-1">
               <button onClick={clearHistory} className="text-[9px] font-bold uppercase text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Purge Memory
               </button>
               <p className="text-[8px] font-bold text-muted-foreground/30 uppercase tracking-widest">Aatma V2.5 Node</p>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
