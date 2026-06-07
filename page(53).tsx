
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, ShoppingBag, Wallet, Users, Award, Zap, Package, BarChart3, ArrowUpRight, DollarSign, Loader2, History } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getResellerLevel } from "@/lib/reseller-levels";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

export default function ResellerDashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState({
    todayOrders: 0,
    monthVolume: 0,
    totalProfit: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Listen for orders
      const qOrders = query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(5));
      const unsubOrders = onSnapshot(qOrders, (snap) => {
        const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentOrders(orders);
        
        // Calculate Today's Stats (Rough estimate from snap)
        const today = new Date().toDateString();
        const todayOrders = orders.filter((o: any) => new Date(o.createdAt).toDateString() === today);
        
        setStats(prev => ({
          ...prev,
          todayOrders: todayOrders.length,
          totalProfit: (profile as any)?.totalCommissionEarnings || 0,
          monthVolume: (profile as any)?.lifetimeVolume || 0
        }));
        setLoading(false);
      });

      return () => unsubOrders();
    }
  }, [user, profile]);

  const level = getResellerLevel(profile?.lifetimeVolume || 0);
  const nextLevel = getResellerLevel((profile?.lifetimeVolume || 0) + 1); // Get next threshold

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Orders Protocol", value: stats.todayOrders, sub: "Today's Intake", icon: ShoppingBag, color: "text-primary" },
            { label: "Gross Volume", value: `₹${stats.monthVolume.toLocaleString()}`, sub: "Lifetime Flow", icon: BarChart3, color: "text-blue-500" },
            { label: "B2B Yield", value: `₹${stats.totalProfit.toLocaleString()}`, sub: "Total Earnings", icon: DollarSign, color: "text-green-500" },
            { label: "Active Tier", value: level.level, sub: `${level.discount}% Yield Rate`, icon: Award, color: level.color },
          ].map((s, i) => (
            <Card key={i} className="bg-card border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
               <CardContent className="p-6 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</p>
                    <p className={`text-2xl font-headline font-bold mt-1 ${s.color}`}>{s.value}</p>
                    <p className="text-[8px] font-bold uppercase text-muted-foreground mt-1">{s.sub}</p>
                  </div>
                  <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${s.color} group-hover:scale-110 transition-transform`}>
                     <s.icon className="h-6 w-6" />
                  </div>
               </CardContent>
            </Card>
          ))}
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <Card className="bg-card border-white/5 rounded-[2rem] overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center justify-between">
                   <CardTitle className="font-headline font-bold text-xl uppercase tracking-tight">Recent B2B Dispatches</CardTitle>
                   <Button variant="ghost" size="sm" asChild className="text-[10px] font-bold uppercase tracking-widest text-primary">
                      <Link href="/reseller/catalog">New Dispatch</Link>
                   </Button>
                </CardHeader>
                <CardContent className="p-0">
                   <div className="divide-y divide-white/5">
                      {recentOrders.length === 0 ? (
                        <div className="py-20 text-center text-muted-foreground uppercase tracking-widest text-xs opacity-20">
                           <Package className="h-12 w-12 mx-auto mb-4" />
                           No recent dispatches
                        </div>
                      ) : (
                        recentOrders.map(order => (
                          <div key={order.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                             <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                                   <Package className="h-6 w-6 text-primary opacity-50" />
                                </div>
                                <div>
                                   <p className="font-bold text-sm uppercase text-white">{order.packageName || order.productName}</p>
                                   <p className="text-[10px] text-muted-foreground font-mono mt-1">ID: {order.id.substring(0, 10)}</p>
                                </div>
                             </div>
                             <div className="text-right">
                                <p className="font-bold text-lg text-white">₹{order.price}</p>
                                <Badge className={`text-[8px] uppercase font-bold border-none h-4 px-2 mt-1 ${
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

          <div className="space-y-8">
             <Card className="bg-primary/5 border-primary/20 relative overflow-hidden rounded-[2rem]">
                <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                   <Award className="h-40 w-40 text-primary" />
                </div>
                <CardContent className="p-8 space-y-6 relative z-10">
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Intelligence Level</p>
                      <h3 className="text-3xl font-headline font-bold uppercase">{level.level} Partner</h3>
                   </div>
                   <div className="space-y-3">
                      <div className="flex justify-between items-end">
                         <span className="text-[10px] font-bold uppercase text-muted-foreground">Volume Sync</span>
                         <span className="text-[10px] font-bold text-white uppercase">{((profile?.lifetimeVolume || 0) / (RESELLER_LEVELS[RESELLER_LEVELS.indexOf(level) + 1]?.threshold || profile?.lifetimeVolume || 1) * 100).toFixed(0)}% Progress</span>
                      </div>
                      <Progress value={((profile?.lifetimeVolume || 0) / (RESELLER_LEVELS[RESELLER_LEVELS.indexOf(level) + 1]?.threshold || profile?.lifetimeVolume || 1) * 100)} className="h-2 bg-white/5" />
                   </div>
                   <div className="grid grid-cols-2 gap-4 pt-4">
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                         <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Yield Rate</p>
                         <p className="text-xl font-headline font-bold text-white">{level.discount}%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/40 border border-white/5">
                         <p className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Squad Comm.</p>
                         <p className="text-xl font-headline font-bold text-white">{level.commission}%</p>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-card border-white/5 rounded-[2rem]">
                <CardHeader>
                   <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                      <Zap className="h-4 w-4 text-primary" />
                      Protocol Shortcuts
                   </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                   <Button className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs neon-glow" asChild>
                      <Link href="/reseller/catalog">Initialize Dispatch</Link>
                   </Button>
                   <Button variant="outline" className="w-full h-12 rounded-xl font-bold uppercase tracking-widest text-xs border-white/10" asChild>
                      <Link href="/reseller/wallet">Sync B2B Funds</Link>
                   </Button>
                </CardContent>
             </Card>
          </div>
       </div>
    </div>
  );
}
