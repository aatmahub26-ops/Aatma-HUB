
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings2, RefreshCw, Key, ShieldCheck, Database, Globe, Power, Zap, Activity, CheckCircle as CheckCircle2, XCircle, AlertTriangle, ArrowUpRight, BarChart3, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, setDoc, updateDoc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { logAdminAction } from "@/lib/admin-audit";
import { useAuth } from "@/context/AuthContext";

export default function AdminProviders() {
  const { profile: adminProfile } = useAuth();
  const [providers, setProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [routingMode, setRoutingEngine] = useState("auto"); // auto | manual
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "providers"), orderBy("priority", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const pData = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setProviders(pData);
      setLoading(false);
    });

    const unsubSettings = onSnapshot(doc(db, "system_settings", "routing"), (doc) => {
      if (doc.exists()) {
        setRoutingEngine(doc.data().mode || "auto");
      }
    });

    return () => {
      unsub();
      unsubSettings();
    };
  }, []);

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await updateDoc(doc(db, "providers", id), { isEnabled: !current });
      
      logAdminAction({
        adminId: adminProfile?.uid,
        adminEmail: adminProfile?.email,
        action: 'PROVIDER_TOGGLE',
        targetId: id,
        details: `Provider ${id} status set to ${!current ? 'Enabled' : 'Disabled'}`
      });

      toast({ title: "Node Updated", description: `${id} visibility changed.` });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleUpdatePriority = async (id: string, newPriority: string) => {
    const p = parseInt(newPriority);
    if (isNaN(p)) return;
    try {
      await updateDoc(doc(db, "providers", id), { priority: p });
    } catch (e: any) {
      toast({ title: "Priority Update Failed", variant: "destructive" });
    }
  };

  const syncBalances = async () => {
    setIsSyncing(true);
    try {
      // Logic: Iterate through active nodes and simulate API balance check
      for (const p of providers) {
        if (!p.isEnabled) continue;
        const mockNewBalance = p.balance + (Math.random() * 1000 - 500);
        await updateDoc(doc(db, "providers", p.id), { 
          balance: Math.max(0, mockNewBalance),
          lastSync: new Date().toISOString()
        });
      }
      toast({ title: "Global Sync Complete", description: "All provider balances updated." });
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleRouting = async () => {
    const newMode = routingMode === 'auto' ? 'manual' : 'auto';
    try {
      await setDoc(doc(db, "system_settings", "routing"), { mode: newMode, updatedAt: new Date().toISOString() });
      toast({ title: "Routing Protocol Updated", description: `Engine switched to ${newMode.toUpperCase()} mode.` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  const stats = {
    totalBalance: providers.reduce((acc, p) => acc + (p.balance || 0), 0),
    activeNodes: providers.filter(p => p.isEnabled).length,
    avgSuccess: providers.length > 0 ? (providers.reduce((acc, p) => acc + (p.successRate || 0), 0) / providers.length).toFixed(1) : "0"
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">API Command Hub</h2>
          <p className="text-muted-foreground">Manage global digital distribution endpoints and failover routing logic.</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-primary/20 bg-primary/5 font-bold h-12" onClick={toggleRouting}>
             <Settings2 className="mr-2 h-4 w-4" />
             Engine: {routingMode.toUpperCase()}
          </Button>
          <Button size="lg" className="h-12 font-bold neon-glow" onClick={syncBalances} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4 fill-current" />}
            Sync All Nodes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard label="Operational Nodes" value={stats.activeNodes.toString()} icon={Globe} color="text-primary" />
         <StatCard label="Multi-Provider Liquidity" value={`₹${stats.totalBalance.toLocaleString()}`} icon={Database} color="text-green-500" />
         <StatCard label="Aggregate Success Rate" value={`${stats.avgSuccess}%`} icon={Activity} color="text-blue-400" />
      </div>

      <Tabs defaultValue="management" className="space-y-8">
        <TabsList className="bg-card border border-white/5 h-14 p-1 rounded-2xl">
           <TabsTrigger value="management" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">Provider Management</TabsTrigger>
           <TabsTrigger value="routing" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">Failover Analytics</TabsTrigger>
           <TabsTrigger value="logs" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest">Execution Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="management" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="bg-card border-white/5 overflow-hidden group hover:border-primary/20 transition-all flex flex-col">
              <CardHeader className="pb-4 bg-white/5 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${provider.isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Database className={`h-5 w-5 ${provider.isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-headline uppercase">{provider.name}</CardTitle>
                        <Badge variant="outline" className="text-[7px] h-3 uppercase border-white/20">P{provider.priority}</Badge>
                      </div>
                      <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">{provider.serviceId}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <Badge className={`text-[8px] border-none px-2 h-4 uppercase ${provider.health === 'Online' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                       {provider.health}
                     </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 flex-1">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Vault Balance</p>
                    <p className="text-2xl font-bold font-headline text-green-500 tracking-tighter">₹{provider.balance?.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 w-20">
                     <Label className="text-[8px] uppercase font-bold text-muted-foreground">Priority</Label>
                     <Input 
                        type="number" 
                        value={provider.priority} 
                        onChange={(e) => handleUpdatePriority(provider.id, e.target.value)}
                        className="h-7 text-xs bg-black/40 border-white/5" 
                      />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                   <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                      <span className="text-muted-foreground">API Success Rate</span>
                      <span className="text-white">{provider.successRate}%</span>
                   </div>
                   <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${provider.successRate}%` }} />
                   </div>
                </div>

                <div className="space-y-2">
                   <Label className="text-[8px] uppercase font-bold text-muted-foreground">Endpoint Cluster</Label>
                   <p className="text-[9px] font-mono truncate text-white border border-white/5 p-2 rounded bg-black/40">{provider.endpoint}</p>
                </div>
              </CardContent>
              <CardFooter className="bg-white/5 p-4 border-t border-white/5 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 text-[9px] font-bold uppercase border-white/10 hover:bg-destructive/10 h-9" onClick={() => handleToggle(provider.id, provider.isEnabled)}>
                  <Power className={`mr-1.5 h-3 w-3 ${provider.isEnabled ? 'text-destructive' : 'text-green-500'}`} />
                  {provider.isEnabled ? 'Deactivate' : 'Enable'}
                </Button>
                <Button size="sm" variant="outline" className="flex-1 text-[9px] font-bold uppercase border-white/10 h-9">
                  <Settings2 className="mr-1.5 h-3 w-3" /> Config
                </Button>
              </CardFooter>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="routing" className="space-y-6">
           <Card className="bg-card border-white/5 p-8">
              <div className="flex items-center gap-6 mb-8">
                 <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Zap className="h-8 w-8 text-primary" />
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-bold uppercase tracking-tight">Active Failover logic</h3>
                    <p className="text-muted-foreground">Engine automatically shifts loads to healthy nodes in real-time.</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                 <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
                 
                 {providers.map((p, i) => (
                   <div key={p.id} className="relative z-10 flex flex-col items-center">
                      <div className={`h-24 w-24 rounded-full border-4 flex flex-col items-center justify-center transition-all ${p.isEnabled ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(158,102,255,0.3)]' : 'border-white/5 bg-muted'}`}>
                         <span className="text-xs font-bold uppercase">Tier {i + 1}</span>
                         <span className="text-[10px] font-bold text-muted-foreground">{p.name}</span>
                      </div>
                      {i < providers.length - 1 && (
                        <div className="mt-4 flex flex-col items-center">
                           <Badge variant="outline" className="text-[8px] uppercase border-white/10 text-muted-foreground">Failover to Tier {i+2}</Badge>
                        </div>
                      )}
                   </div>
                 ))}
              </div>

              <div className="mt-12 p-6 bg-black/40 rounded-2xl border border-white/5 space-y-4">
                 <div className="flex items-center gap-2 text-primary">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Protocol Intelligence</span>
                 </div>
                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[11px] text-muted-foreground font-medium uppercase tracking-tight">
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Auto-disable node on 3 consecutive timeouts</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Switch to Priority 2 if Priority 1 balance < ₹500</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Instant notification on node status change</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="h-3 w-3 text-green-500" /> Manual override bypasses priority logic</li>
                 </ul>
              </div>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <Card className="bg-card border-white/5 overflow-hidden group hover:border-primary/30 transition-all">
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className={`text-2xl font-headline font-bold text-white`}>{value}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
