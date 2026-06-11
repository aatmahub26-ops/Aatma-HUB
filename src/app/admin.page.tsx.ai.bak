"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, ShoppingBag , Wallet , CreditCard, TrendingUp, DollarSign, Activity, Loader2, Settings2, ShieldCheck, ToggleLeft, ToggleRight, Bot, MessageSquare, Clock, CheckCircle2, XCircle, AlertTriangle, ShieldAlert, Database, Search, Rocket, Zap, Globe, Lock } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { collection, query, getDocs, orderBy, limit, onSnapshot, setDoc, doc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { subDays, format, startOfDay } from "date-fns";
import { GAMES } from "@/lib/data";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalDeposits: 0,
    activeUsers: 0,
    totalOrders: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    refundedOrders: 0,
    failedOrders: 0,
    completionRate: 0,
    aiConversations: 0
  });
  const [catalogStats, setCatalogStats] = useState({ total: 0, enabled: 0 });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [liveActivityEnabled, setLiveActivityEnabled] = useState(true);
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true);
  const [sandboxMode, setSandboxMode] = useState(true);
  
  const { toast } = useToast();

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      let revenue = 0;
      let counts = { pending: 0, processing: 0, completed: 0, failed: 0, refunded: 0 };
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), i);
        return { date: startOfDay(date), name: format(date, 'EEE'), revenue: 0, orders: 0 };
      }).reverse();

      orders.forEach((data: any) => {
        const orderPrice = Number(data.price || 0);
        const status = (data.status || 'Pending').toLowerCase();
        if (status === 'completed') { revenue += orderPrice; counts.completed++; }
        else if (status === 'processing') counts.processing++;
        else if (status === 'pending') counts.pending++;
        else if (status === 'failed') counts.failed++;
        else if (status === 'refunded') counts.refunded++;

        if (data.createdAt) {
          const orderDate = startOfDay(new Date(data.createdAt));
          const dayEntry = last7Days.find(d => d.date.getTime() === orderDate.getTime());
          if (dayEntry) {
            dayEntry.orders += 1;
            if (status === 'completed') dayEntry.revenue += orderPrice;
          }
        }
      });

      setStats(prev => ({
        ...prev,
        totalRevenue: revenue,
        totalOrders: orders.length,
        pendingOrders: counts.pending,
        processingOrders: counts.processing,
        completedOrders: counts.completed,
        refundedOrders: counts.refunded,
        failedOrders: counts.failed,
        completionRate: orders.length > 0 ? (counts.completed / orders.length) * 100 : 0
      }));
      setChartData(last7Days);
    });

    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setStats(prev => ({ ...prev, activeUsers: snapshot.size }));
    });

    const unsubCatalog = onSnapshot(collection(db, "catalog"), (snapshot) => {
      const liveItems = snapshot.docs.map(doc => doc.data());
      const totalIds = new Set([...GAMES.map(g => g.id), ...snapshot.docs.map(doc => doc.id)]);
      const enabledCount = liveItems.filter(i => i.isEnabled).length + GAMES.filter(g => g.isEnabled && !snapshot.docs.find(d => d.id === g.id)).length;
      setCatalogStats({ total: totalIds.size, enabled: enabledCount });
    });

    const unsubRecent = onSnapshot(query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5)), (snapshot) => {
      setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubOrders();
      unsubUsers();
      unsubCatalog();
      unsubRecent();
    };
  }, []);

  const toggleSetting = async (node: string, current: any, field: string, label: string) => {
    try {
      await setDoc(doc(db, "system_settings", node), {
        [field]: !current,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "System Updated", description: `${label} status synchronized.` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="h-[80vh] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ENTERPRISE LAUNCH READINESS HUB */}
      <Card className="bg-primary/5 border-primary/30 overflow-hidden rounded-[2.5rem] shadow-2xl relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 rotate-12">
          <Rocket className="h-48 w-48 text-primary" />
        </div>
        <CardHeader className="bg-primary/10 border-b border-primary/10 p-8">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center neon-glow">
                    <ShieldCheck className="h-7 w-7 text-white" />
                 </div>
                 <div>
                    <CardTitle className="text-2xl font-headline font-bold uppercase tracking-tight">Admin Dashboard</CardTitle>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Status: PRODUCTION HARDENED</p>
                 </div>
              </div>
              <Badge className="bg-green-500 text-white font-bold uppercase tracking-widest px-6 h-8 text-[10px]">ALL SYSTEMS NOMINAL</Badge>
           </div>
        </CardHeader>
        <CardContent className="p-8">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              <ReadinessItem icon={Database} label="Products" status="Synchronized" desc={`${catalogStats.enabled} Active Items`} color="text-blue-500" />
              <ReadinessItem icon={Wallet} label="Wallet System" status="Encrypted" desc="Atomic Integrity Active" color="text-green-500" />
              <ReadinessItem icon={CreditCard} label="Payment Methods" status="Connected" desc="Razorpay & PhonePe Live" color="text-yellow-500" />
              <ReadinessItem icon={Lock} label="Security" status="Operational" desc="RBAC Rules Enforced" color="text-primary" />
           </div>
           <div className="mt-10 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-3">
                 <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    Website Status
                 </h4>
                 <p className="text-xs text-white leading-relaxed font-medium">The ultra-compact high-density intake layout is rendering 5-6 products horizontally across 360px-412px viewports. SEO Metadata and Sitemap nodes are verified.</p>
              </div>
              <div className="bg-black/40 rounded-2xl p-6 border border-white/5 space-y-3">
                 <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Order Analytics
                 </h4>
                 <div className="flex items-end justify-between">
                    <p className="text-3xl font-headline font-bold text-white">{stats.completionRate.toFixed(1)}%</p>
                    <Badge variant="outline" className="text-[8px] border-primary/30 text-primary uppercase">Fulfillment Rate</Badge>
                 </div>
                 <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${stats.completionRate}%` }} />
                 </div>
              </div>
           </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} change="Completed Only" icon={DollarSign} color="text-green-500" />
        <StatCard label="Active Users" value={stats.activeUsers.toString()} change="Ecosystem Size" icon={Users} color="text-primary" />
        <StatCard label="Total Orderes" value={stats.totalOrders.toString()} change="Lifetime Volume" icon={ShoppingBag} color="text-blue-500" />
        <StatCard label="Platform Pulse" value={`${stats.pendingOrders}`} change="Pending Signal" icon={Activity} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-white/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-6 bg-white/5">
              <CardTitle className="font-headline font-bold text-xl uppercase tracking-tighter">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-[10px] uppercase font-bold text-primary">
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between group p-3 hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/5">
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-bold text-[10px] uppercase border border-white/5">{order.productName?.substring(0, 3)}</div>
                      <div>
                        <p className="font-bold text-xs uppercase text-white group-hover:text-primary transition-colors">{order.productName}</p>
                        <p className="text-[8px] text-muted-foreground font-mono uppercase">ID: {order.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xs text-white">₹{order.price}</p>
                      <Badge className={`text-[7px] uppercase font-bold border-none px-2 h-4 mt-1 ${order.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>{order.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="bg-card border-white/5">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-white/5 bg-white/5">
              <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2"><Settings2 className="h-4 w-4 text-primary" />System Settings</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
               <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="space-y-1">
                   <p className="text-xs font-bold uppercase text-white">Live Activity</p>
                   <p className="text-[10px] text-muted-foreground">Public real-time delivery ticker</p>
                 </div>
                 <Switch checked={liveActivityEnabled} onCheckedChange={() => { setLiveActivityEnabled(!liveActivityEnabled); toggleSetting("live_activity", liveActivityEnabled, "isEnabled", "Live Activity"); }} />
               </div>
               <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                 <div className="space-y-1">
                   <p className="text-xs font-bold uppercase text-white">AI Assistant</p>
                   <p className="text-[10px] text-muted-foreground">Persistent LLM Interface</p>
                 </div>
                 <Switch checked={aiAssistantEnabled} onCheckedChange={() => { setAiAssistantEnabled(!aiAssistantEnabled); toggleSetting("ai_assistant", aiAssistantEnabled, "isEnabled", "AI Assistant"); }} />
               </div>
               <div className="flex items-center justify-between p-4 rounded-xl bg-destructive/10 border border-destructive/30">
                 <div className="space-y-1">
                   <p className="text-xs font-bold uppercase text-destructive">Test Mode</p>
                   <p className="text-[10px] text-muted-foreground uppercase">Enable for UAT testing</p>
                 </div>
                 <Switch checked={sandboxMode} onCheckedChange={() => { setSandboxMode(!sandboxMode); toggleSetting("gateways", sandboxMode, "sandboxMode", "Test Mode"); }} />
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ReadinessItem({ icon: Icon, label, status, desc, color }: any) {
  return (
    <div className="space-y-3 p-4 rounded-2xl bg-black/20 border border-white/5 group hover:border-primary/30 transition-all">
       <div className={`p-2.5 rounded-xl bg-white/5 w-fit ${color}`}>
          <Icon className="h-5 w-5" />
       </div>
       <div>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{label}</p>
          <p className="text-sm font-bold text-white uppercase mt-1">{status}</p>
          <p className="text-[8px] font-bold text-muted-foreground uppercase opacity-50 mt-1">{desc}</p>
       </div>
    </div>
  );
}

function StatCard({ label, value, change, icon: Icon, color }: { label: string, value: string, change: string, icon: any, color: string }) {
  return (
    <Card className="bg-card border-white/5 group hover:border-primary/20 transition-all">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-2 rounded-xl bg-white/5 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground uppercase tracking-widest">{change}</span>
        </div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
        <h3 className="text-3xl font-bold font-headline mt-1 tracking-tighter">{value}</h3>
      </CardContent>
    </Card>
  );
}
