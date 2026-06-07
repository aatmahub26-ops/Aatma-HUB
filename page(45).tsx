
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, Phone, Mail, HelpCircle, Package, Wallet, ShieldCheck, Zap, Send, Loader2, History, Plus, MessageCircle, AlertCircle, Headphones } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SupportPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("faq");
  const [tickets, setTickets] = useState<any[]>([]);
  
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "tickets"),
        where("userId", "==", user.uid),
        orderBy("updatedAt", "desc")
      );
      const unsub = onSnapshot(q, (snap) => {
        setTickets(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsub();
    }
  }, [user]);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Authentication Required", description: "Sign in to create support tickets.", variant: "destructive" });
      return;
    }
    if (!subject || !message) return;

    setIsSubmitting(true);
    try {
      const ticketRef = await addDoc(collection(db, "tickets"), {
        userId: user.uid,
        userEmail: user.email,
        subject,
        status: "Open",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await addDoc(collection(db, "tickets", ticketRef.id, "messages"), {
        text: message,
        senderId: user.uid,
        senderName: profile?.firstName || "User",
        createdAt: new Date().toISOString()
      });

      toast({ title: "Ticket Initialized", description: "The Aatma HQ squad has been notified." });
      setSubject("");
      setMessage("");
      setActiveTab("history");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const faqs = [
    { q: "How long does delivery take?", a: "Most top-ups are instant. In rare cases, it may take up to 5-15 minutes. track status in your Order History." },
    { q: "My payment was successful but balance didn't update?", a: "For manual UPI recharges, ensure you've submitted the correct UTR ID. Admin verification takes 5-30 minutes." },
    { q: "Can I get a refund?", a: "Refunds are processed only if the digital currency hasn't been delivered yet. Contact support immediately." },
    { q: "How do I build my referral squad?", a: "Share your unique referral code. You earn lifetime commission on every successful top-up they make." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 space-y-4">
             <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary mx-auto">
                <Headphones className="h-8 w-8" />
             </div>
             <h1 className="text-4xl md:text-5xl font-headline font-bold uppercase tracking-tighter leading-none">Intelligence <span className="text-primary">Support</span></h1>
             <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest">24/7 Response Node for the Aatma Elite</p>
          </div>

          <div className="flex items-center justify-center gap-2 mb-12 overflow-x-auto scrollbar-hide py-2">
             <Button variant={activeTab === 'faq' ? 'default' : 'outline'} className="rounded-xl h-11 px-8 font-bold uppercase text-[9px] tracking-widest shrink-0" onClick={() => setActiveTab('faq')}>
                <HelpCircle className="mr-2 h-3.5 w-3.5" /> FAQ Intel
             </Button>
             <Button variant={activeTab === 'ticket' ? 'default' : 'outline'} className="rounded-xl h-11 px-8 font-bold uppercase text-[9px] tracking-widest shrink-0" onClick={() => setActiveTab('ticket')}>
                <Plus className="mr-2 h-3.5 w-3.5" /> New Signal
             </Button>
             <Button variant={activeTab === 'history' ? 'default' : 'outline'} className="rounded-xl h-11 px-8 font-bold uppercase text-[9px] tracking-widest shrink-0" onClick={() => setActiveTab('history')}>
                <History className="mr-2 h-3.5 w-3.5" /> Archive
             </Button>
          </div>

          {activeTab === 'faq' && (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
                <div className="lg:col-span-8 space-y-4">
                   <Accordion type="single" collapsible className="space-y-3">
                      {faqs.map((faq, i) => (
                        <AccordionItem key={i} value={`item-${i}`} className="bg-card border border-white/5 rounded-2xl px-6">
                           <AccordionTrigger className="hover:no-underline font-bold text-sm text-left uppercase tracking-tight py-6">{faq.q}</AccordionTrigger>
                           <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-6 font-medium">
                              {faq.a}
                           </AccordionContent>
                        </AccordionItem>
                      ))}
                   </Accordion>
                </div>
                <div className="lg:col-span-4 space-y-6">
                   <Card className="bg-primary/5 border-primary/20 p-8 text-center space-y-6 rounded-[2rem] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5"><Zap className="h-20 w-20" /></div>
                      <h3 className="font-headline font-bold uppercase text-lg relative z-10">Direct Comms</h3>
                      <div className="space-y-3 relative z-10">
                         <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-14 rounded-2xl shadow-lg" asChild>
                            <a href="https://wa.me/918566936666" target="_blank"><MessageSquare className="mr-2 h-5 w-5" /> WhatsApp HQ</a>
                         </Button>
                         <Button variant="outline" className="w-full h-14 font-bold border-white/10 bg-white/5 rounded-2xl" asChild>
                            <a href="tel:+918566936666"><Phone className="mr-2 h-5 w-5 text-primary" /> Voice Link</a>
                         </Button>
                      </div>
                   </Card>
                </div>
             </div>
          )}

          {activeTab === 'ticket' && (
             <Card className="max-w-2xl mx-auto bg-card border-white/5 animate-in fade-in slide-in-from-bottom-4 duration-500 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="bg-primary/10 border-b border-white/5 p-8 text-center">
                   <CardTitle className="text-xl font-headline font-bold uppercase tracking-widest text-primary flex items-center justify-center gap-3">
                      <Plus className="h-5 w-5" />
                      Protocol Initialization
                   </CardTitle>
                   <CardDescription className="text-[10px] font-bold uppercase tracking-widest opacity-60">Log your support mission for Aatma Core review.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                   <form onSubmit={handleSubmitTicket} className="space-y-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] uppercase font-bold tracking-widest px-2">Subject Header</Label>
                         <Input placeholder="e.g. Wallet Recharge Error" className="bg-black/40 border-white/10 h-14 rounded-xl font-bold" value={subject} onChange={(e) => setSubject(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] uppercase font-bold tracking-widest px-2">Mission Intelligence</Label>
                         <Textarea placeholder="Explain your query in detail..." className="bg-black/40 border-white/10 min-h-[180px] rounded-xl p-4 font-medium" value={message} onChange={(e) => setMessage(e.target.value)} required />
                      </div>
                      <Button type="submit" className="w-full h-16 font-bold neon-glow text-lg uppercase tracking-tighter rounded-2xl" disabled={isSubmitting}>
                         {isSubmitting ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Send className="mr-3 h-6 w-6" />}
                         Deploy Signal
                      </Button>
                   </form>
                </CardContent>
             </Card>
          )}

          {activeTab === 'history' && (
             <div className="space-y-4 animate-in fade-in duration-500">
                {tickets.length === 0 ? (
                  <div className="p-20 text-center glass-card rounded-[2.5rem] border-dashed border-white/10 space-y-4">
                     <History className="h-16 w-16 mx-auto text-muted-foreground opacity-10" />
                     <p className="font-bold text-muted-foreground uppercase tracking-widest text-lg opacity-40">No Logged Signals</p>
                  </div>
                ) : (
                  tickets.map((t) => (
                    <Card key={t.id} className="bg-card border-white/5 hover:border-primary/30 transition-all overflow-hidden group rounded-2xl">
                       <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${t.status === 'Resolved' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                                <MessageCircle className="h-6 w-6" />
                             </div>
                             <div>
                                <h4 className="font-bold text-lg text-white uppercase group-hover:text-primary transition-colors tracking-tight">{t.subject}</h4>
                                <div className="flex items-center gap-3 mt-1.5">
                                   <Badge className={`text-[8px] uppercase font-bold border-none px-3 h-4 ${
                                      t.status === 'Open' ? 'bg-green-500/10 text-green-500' : 
                                      t.status === 'Resolved' ? 'bg-blue-500/10 text-blue-500' : 'bg-muted text-muted-foreground'
                                   }`}>{t.status}</Badge>
                                   <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-tighter">SIG::{t.id.substring(0, 12)}</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-right hidden sm:block">
                             <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Updated</p>
                             <p className="text-sm font-bold text-white uppercase">{new Date(t.updatedAt).toLocaleDateString()}</p>
                          </div>
                       </CardContent>
                    </Card>
                  ))
                )}
             </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
