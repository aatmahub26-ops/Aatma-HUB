"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Wallet, Gamepad2, Gift, TrendingUp, Loader2, Award, Zap, ShieldCheck, Bell, Trophy, Users, Star, Package, History, ArrowUpRight, MessageSquare, Bot, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getUserRank, getRankProgress, RANKS } from "@/lib/ranks";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function DashboardOverview() {
  const { user, profile } = useAuth();
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    if (user) {
      const qOrders = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
      const unsubscribeOrders = onSnapshot(qOrders, (snapshot) => {
        setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingOrders(false);
      }, async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: `orders?userId=${user.uid}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoadingOrders(false);
      });


        return () => {
          unsubscribeOrders();
        };
      }
    
  }, [user]);

  const lifetimeAmount = profile?.lifetimeRechargeAmount || 0;
  const currentRank = getUserRank(lifetimeAmount);
  const progress = getRankProgress(lifetimeAmount);
  const nextRank = RANKS[RANKS.findIndex(r => r.tier === currentRank.tier) + 1];
  const kycStatus = (profile as any)?.kycStatus || "None";

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Ecosystem Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <Link href="/wallet" className="glass-card p-6 rounded-3xl border-primary/20 group hover:bg-primary/5 transition-all">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Wallet Balance</p>
                  <p className="text-3xl font-headline font-bold text-white mt-1">₹{profile?.walletBalance?.toFixed(2) || "0.00"}</p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Wallet className="h-6 w-6" />
               </div>
            </div>
         </Link>
         <Link href="/orders" className="glass-card p-6 rounded-3xl border-white/5 group hover:bg-white/5 transition-all">
            <div className="flex items-center justify-between">
               <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Orders</p>
                  <p className="text-3xl font-headline font-bold text-white mt-1">{profile?.totalOrders || 0}</p>
               </div>
               <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
                  <Package className="h-6 w-6" />
               </div>
            </div>
         </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
           {/* Rank Intelligence */}
           <Card className="bg-gradient-to-r from-primary/10 via-card to-secondary/10 border-white/5 rounded-[2.5rem] relative overflow-hidden">
              <CardContent className="p-8">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="space-y-2">
                       <Badge className={`${currentRank.color.replace('text-', 'bg-')}/10 ${currentRank.color} border-none font-bold uppercase tracking-widest px-4`}>
                         {currentRank.tier} Rank
                       </Badge>
                       <h2 className="text-3xl font-headline font-bold uppercase">Aatma <span className="text-gradient">Elite League</span></h2>
                       <p className="text-sm text-muted-foreground max-w-md">Every successful dispatch earns rank protocol points. Reach higher tiers for exclusive distribution rates.</p>
                    </div>
                    <div className="flex-1 max-w-md space-y-4">
                       <div className="flex justify-between items-end">
                          <p className="text-[10px] font-bold uppercase text-white tracking-widest">{currentRank.tier}</p>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">
                             {nextRank ? `Next: ${nextRank.tier}` : 'Maximum Level'}
                          </p>
                       </div>
                       <Progress value={progress} className="h-2 bg-white/5" />
                       <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                          <span>₹{lifetimeAmount.toLocaleString()} Spend</span>
                          <span>{nextRank ? `Goal: ₹${nextRank.threshold.toLocaleString()}` : 'MAX'}</span>
                       </div>
                    </div>
                 </div>
              </CardContent>
           </Card>

           <Card className="bg-card/50 border-white/5 rounded-[2rem] overflow-hidden">
             <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4 bg-white/5">
               <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                  <History className="h-4 w-4 text-primary" />
                  Recent Activity
               </CardTitle>
               <Button variant="ghost" size="sm" asChild className="text-[10px] uppercase font-bold text-primary">
                 <Link href="/orders">View Ledger</Link>
               </Button>
             </CardHeader>
             <CardContent className="pt-6">
               <div className="space-y-4">
                 {loadingOrders ? (
                   <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                 ) : recentOrders.length === 0 ? (
                   <div className="text-center py-10 opacity-30">
                     <Package className="h-12 w-12 mx-auto mb-4" />
                     <p className="text-xs uppercase font-bold tracking-widest">Awaiting First Order</p>
                   </div>
                 ) : (
                   recentOrders.map((order) => (
                     <div key={order.id} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                       <div className="flex items-center space-x-4">
                         <div className="h-10 w-10 rounded-xl bg-black/40 flex items-center justify-center font-bold text-[10px] uppercase border border-white/5">
                           {order.productName?.substring(0, 3)}
                         </div>
                         <div>
                           <p className="font-bold text-sm uppercase leading-none">{order.packageName}</p>
                           <p className="text-[9px] text-muted-foreground font-mono mt-1">ID: {order.id.substring(0, 10)}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <p className="font-bold text-sm">₹{order.price}</p>
                         <Badge className={`text-[8px] uppercase font-bold tracking-widest border-none h-4 px-2 mt-1 ${
                           order.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                         }`}>{order.status}</Badge>
                       </div>
                     </div>
                   ))
                 )}
               </div>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">

           <LiveActivityFeed />
           
        </div>
      </div>
    </div>
  );
}
