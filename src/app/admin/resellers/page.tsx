
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, TrendingUp, DollarSign, ArrowUpRight, Search, Loader2, Settings2, History, Zap, CheckCircle2, FlaskConical, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, getDocs, addDoc, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ResellerHub() {
  const [stats, setStats] = useState({
    totalResellers: 0,
    activeResellers: 0,
    totalVolume: 0,
    totalEarnings: 0
  });
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simUser, setSimUser] = useState("");
  const [simAmount, setSimAmount] = useState("1000");
  
  const { toast } = useToast();

  useEffect(() => {
    const unsubResellers = onSnapshot(query(collection(db, "users"), where("role", "==", "reseller")), (snap) => {
      const resellersData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setResellers(resellersData);
      setStats(prev => ({
        ...prev,
        totalResellers: snap.size,
        activeResellers: snap.docs.filter(d => d.data().resellerStatus === 'Approved').length,
        totalVolume: resellersData.reduce((sum, r: any) => sum + (r.lifetimeVolume || 0), 0)
      }));
    });

    const unsubComm = onSnapshot(collection(db, "reseller_commissions"), (snap) => {
      const comms = snap.docs.map(d => d.data());
      setStats(prev => ({ ...prev, totalEarnings: comms.reduce((sum, c) => sum + (c.amount || 0), 0) }));
      setLoading(false);
    });

    return () => {
      unsubResellers();
      unsubComm();
    };
  }, []);

  const handleSimulateOrder = async () => {
    if (!simUser || !simAmount) return;
    setIsSimulating(true);
    try {
      const orderRef = await addDoc(collection(db, "orders"), {
        userId: simUser,
        productName: "TEST SIMULATION",
        packageName: "SIMULATED PAYLOAD",
        price: parseFloat(simAmount),
        status: "Pending",
        createdAt: new Date().toISOString(),
        paymentMethod: "simulator"
      });
      
      toast({ title: "Order Simulated", description: `Item #${orderRef.id.substring(0, 8)} created. Navigate to Manage Orders to complete it.` });
    } catch (e: any) {
      toast({ title: "Sim Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSimulating(false);
    }
  };

  const navCards = [
    { title: "B2B Partner List", count: stats.totalResellers, url: "/admin/resellers/users", icon: Users, color: "text-primary" },
    { title: "Active Partners", count: stats.activeResellers, url: "/admin/resellers/users", icon: CheckCircle2, color: "text-green-500" },
    { title: "Total Earnings Paid", count: stats.totalEarnings, url: "/admin/resellers/earnings", icon: DollarSign, color: "text-yellow-500", isCurrency: true },
    { title: "B2B Logic Setup", url: "/admin/resellers/settings", icon: Settings2, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">B2B Admin Hub</h2>
          <p className="text-muted-foreground">Manage corporate distribution layers and monitor partner yield nodes.</p>
        </div>
        <Button className="h-10 font-bold bg-primary text-primary-foreground" asChild>
           <Link href="/admin/users">
              <Plus className="mr-2 h-4 w-4" /> Enroll New Partner
           </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {navCards.map((card, i) => (
           <Link key={i} href={card.url || "#"}>
             <Card className="bg-card border-white/5 hover:border-primary/40 transition-all group h-full">
                <CardContent className="p-6 space-y-4">
                   <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl bg-white/5 ${card.color}`}>
                         <card.icon className="h-6 w-6" />
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{card.title}</p>
                      {card.count !== undefined && (
                        <h3 className="text-2xl font-headline font-bold mt-1 text-white">
                          {card.isCurrency ? `₹${card.count.toLocaleString()}` : card.count}
                        </h3>
                      )}
                   </div>
                </CardContent>
             </Card>
           </Link>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 space-y-6">
            <Card className="bg-card border-white/5">
               <CardHeader className="border-b border-white/5 bg-white/5">
                  <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                     <FlaskConical className="h-4 w-4 text-primary" />
                     B2B Earnings Simulator (Testing Mode)
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Partner Item</label>
                        <Select value={simUser} onValueChange={setSimUser}>
                           <SelectTrigger className="bg-black/40 border-white/10">
                              <SelectValue placeholder="Select Reseller" />
                           </SelectTrigger>
                           <SelectContent>
                              {resellers.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.businessName || r.firstName} ({r.resellerLevel})</SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payload Price (₹)</label>
                        <Input type="number" value={simAmount} onChange={(e) => setSimAmount(e.target.value)} className="bg-black/40 border-white/10" />
                     </div>
                     <Button className="font-bold uppercase tracking-widest bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30" onClick={handleSimulateOrder} disabled={isSimulating}>
                        {isSimulating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simulate Order"}
                     </Button>
                  </div>
                  <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                     <p className="text-[10px] text-muted-foreground uppercase font-bold leading-relaxed">
                        Note: Simulation creates a "Pending" order. Once you mark it as "Completed" in Manage Orders, the commission logic will trigger based on the partner's tier.
                     </p>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-card border-white/5">
               <CardHeader className="border-b border-white/5 bg-white/5">
                  <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                     <History className="h-4 w-4 text-primary" />
                     Global B2B Earnings Analytics
                  </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="py-20 text-center space-y-4 opacity-20">
                     <TrendingUp className="h-16 w-16 mx-auto" />
                     <p className="text-xs uppercase font-bold tracking-widest">Aggregate Performance Visuals Syncing...</p>
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-4 space-y-6">
            <Card className="bg-primary/5 border-primary/20 rounded-[2rem] p-8 text-center space-y-4">
               <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Zap className="h-8 w-8 text-primary" />
               </div>
               <h3 className="text-xl font-headline font-bold uppercase">B2B Performance</h3>
               <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-tight">Total ecosystem volume processed via distribution layer.</p>
               <div className="pt-4">
                  <p className="text-3xl font-headline font-bold text-white">₹{stats.totalVolume.toLocaleString()}</p>
                  <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1">Gross Corporate Volume</p>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
