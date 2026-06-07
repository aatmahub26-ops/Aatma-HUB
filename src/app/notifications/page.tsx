
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Package, Wallet, Gift, Star, Clock, Trash2, CheckCircle2, Loader2, Megaphone, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "notifications"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(q, (snap) => {
        setNotifications(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      return () => unsub();
    }
  }, [user]);

  const markAllRead = async () => {
    if (!user || notifications.length === 0) return;
    const batch = writeBatch(db);
    notifications.forEach(n => {
      if (!n.read) batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (id: string) => {
    await deleteDoc(doc(db, "notifications", id));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="h-5 w-5 text-blue-400" />;
      case 'wallet': return <Wallet className="h-5 w-5 text-green-500" />;
      case 'referral': return <Gift className="h-5 w-5 text-primary" />;
      case 'achievement': return <Star className="h-5 w-5 text-yellow-500" />;
      default: return <Megaphone className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Bell className="h-6 w-6" />
                   </div>
                   <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter uppercase leading-none">Hub <span className="text-primary">Alerts</span></h1>
                </div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mt-2">Verified communication logs from Aatma Core</p>
             </div>
             <Button variant="outline" size="sm" className="h-10 border-white/5 bg-white/5 font-bold rounded-xl" onClick={markAllRead}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Finalize Read
             </Button>
          </div>

          <div className="space-y-4">
             {loading ? (
               <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
             ) : notifications.length === 0 ? (
               <div className="p-20 text-center space-y-6 glass-card rounded-[2.5rem] border-dashed border-white/10">
                  <Bell className="h-16 w-16 mx-auto text-muted-foreground opacity-10" />
                  <div className="space-y-2">
                     <p className="font-bold text-muted-foreground uppercase tracking-widest text-lg">Silence Detected</p>
                     <p className="text-xs text-muted-foreground uppercase tracking-tight opacity-60">No dispatch signals or rewards in the current buffer.</p>
                  </div>
                  <Button asChild className="neon-glow font-bold uppercase tracking-widest text-xs h-12 px-10 rounded-2xl">
                     <Link href="/catalog">Explore Marketplace</Link>
                  </Button>
               </div>
             ) : (
               notifications.map((n) => (
                 <Card key={n.id} className={`bg-card border-white/5 transition-all hover:bg-white/5 rounded-[1.5rem] overflow-hidden ${!n.read ? 'border-primary/30 ring-1 ring-primary/10' : ''}`}>
                    <CardContent className="p-6 flex items-start gap-5">
                       <div className="p-4 rounded-2xl bg-white/5 shrink-0 shadow-inner border border-white/5">
                          {getIcon(n.type)}
                       </div>
                       <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                             <h4 className="font-bold text-base uppercase tracking-tight">{n.title}</h4>
                             <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />}
                             </div>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed font-medium">{n.message}</p>
                          <div className="pt-3 flex items-center justify-between border-t border-white/5 mt-4">
                             <Badge variant="secondary" className="text-[8px] h-4 uppercase font-bold bg-primary/10 text-primary border-none tracking-widest px-2">
                                LOG::{n.type}
                             </Badge>
                             <button onClick={() => deleteNotification(n.id)} className="text-[10px] font-bold uppercase text-muted-foreground hover:text-destructive flex items-center gap-1.5 transition-colors">
                                <Trash2 className="h-3.5 w-3.5" /> Purge Log
                             </button>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               ))
             )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
