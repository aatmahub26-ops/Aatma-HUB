"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MessageCircle, Clock, CheckCircle2, User, Send, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, addDoc, serverTimestamp, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function AdminTickets() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "tickets"), orderBy("updatedAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      const q = query(
        collection(db, "tickets", selectedTicket.id, "messages"),
        orderBy("createdAt", "asc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [selectedTicket]);

  const handleSendReply = async () => {
    if (!reply.trim() || !selectedTicket) return;
    setIsSending(true);
    try {
      await addDoc(collection(db, "tickets", selectedTicket.id, "messages"), {
        text: reply,
        senderId: "admin",
        senderName: "Aatma HQ",
        createdAt: new Date().toISOString()
      });
      
      await updateDoc(doc(db, "tickets", selectedTicket.id), {
        status: "Pending",
        updatedAt: new Date().toISOString()
      });

      setReply("");
    } catch (e: any) {
      toast({ title: "Send Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    if (!selectedTicket) return;
    try {
      await updateDoc(doc(db, "tickets", selectedTicket.id), { status });
      toast({ title: "System Updated", description: `Ticket marked as ${status}.` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-140px)]">
      
      {/* Ticket List Ledger */}
      <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
         <div className="flex items-center justify-between">
            <h2 className="text-xl font-headline font-bold uppercase tracking-widest">Support Ledger</h2>
            <Badge variant="outline" className="border-primary/20 text-primary">{tickets.length} Items</Badge>
         </div>
         <Card className="bg-card border-white/5 flex-1 overflow-hidden flex flex-col">
            <CardHeader className="p-4 border-b border-white/5 bg-white/5">
               <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Filter tickets..." className="pl-10 bg-black/40 border-white/10 h-10" />
               </div>
            </CardHeader>
            <ScrollArea className="flex-1">
               <div className="divide-y divide-white/5">
                  {loading ? (
                    <div className="p-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
                  ) : tickets.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground uppercase font-bold text-[10px]">No active signals</div>
                  ) : (
                    tickets.map((t) => (
                      <button 
                        key={t.id} 
                        onClick={() => setSelectedTicket(t)}
                        className={`w-full text-left p-6 hover:bg-white/5 transition-all group ${selectedTicket?.id === t.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}
                      >
                         <div className="flex justify-between items-start mb-2">
                            <Badge className={`text-[8px] uppercase font-bold border-none ${
                               t.status === 'Open' ? 'bg-green-500/10 text-green-500' : 
                               t.status === 'Resolved' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                            }`}>{t.status}</Badge>
                            <span className="text-[8px] font-mono text-muted-foreground uppercase">{t.id.substring(0, 8)}</span>
                         </div>
                         <h4 className="font-bold text-sm text-white uppercase truncate mb-1">{t.subject}</h4>
                         <p className="text-[10px] text-muted-foreground font-medium truncate uppercase">{t.userEmail}</p>
                      </button>
                    ))
                  )}
               </div>
            </ScrollArea>
         </Card>
      </div>

      {/* Message Interface */}
      <div className="lg:col-span-8 flex flex-col overflow-hidden">
         {selectedTicket ? (
           <Card className="bg-card border-white/5 flex-1 flex flex-col overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5 bg-primary/10 flex flex-row items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                       <MessageCircle className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                       <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">{selectedTicket.subject}</CardTitle>
                       <p className="text-[10px] text-muted-foreground uppercase font-bold">Initiated by {selectedTicket.userEmail}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="h-8 text-[9px] uppercase font-bold border-white/10" onClick={() => updateStatus('Resolved')}>
                       <CheckCircle2 className="mr-2 h-3 w-3 text-green-500" /> Resolve
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 text-[9px] uppercase font-bold text-destructive hover:bg-destructive/10" onClick={() => updateStatus('Closed')}>
                       <Trash2 className="mr-2 h-3 w-3" /> Terminate
                    </Button>
                 </div>
              </CardHeader>
              <ScrollArea className="flex-1 p-8">
                 <div className="space-y-8">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.senderId === 'admin' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[70%] space-y-2`}>
                            <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed ${
                              m.senderId === 'admin' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted/50 border border-white/5 rounded-tl-none'
                            }`}>
                               {m.text}
                            </div>
                            <p className={`text-[8px] font-bold text-muted-foreground uppercase tracking-widest ${m.senderId === 'admin' ? 'text-right' : 'text-left'}`}>
                               {m.senderName} • {new Date(m.createdAt).toLocaleTimeString()}
                            </p>
                         </div>
                      </div>
                    ))}
                 </div>
              </ScrollArea>
              <CardFooter className="p-6 border-t border-white/5 bg-black/40 gap-4">
                 <Input 
                   placeholder="Enter response protocol..." 
                   className="h-12 bg-black/40 border-white/10" 
                   value={reply}
                   onChange={(e) => setReply(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
                 />
                 <Button className="h-12 px-8 font-bold uppercase tracking-widest" onClick={handleSendReply} disabled={isSending}>
                    {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                 </Button>
              </CardFooter>
           </Card>
         ) : (
           <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-[2rem] text-muted-foreground space-y-4">
              <AlertCircle className="h-16 w-16 opacity-10" />
              <p className="text-xs uppercase font-bold tracking-widest">Select a ticket node to begin resolution</p>
           </div>
         )}
      </div>

    </div>
  );
}
