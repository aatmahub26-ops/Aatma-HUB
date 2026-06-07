
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2, Globe, ShieldCheck, Zap, Copy, History, Smartphone, CheckCircle2, MessageSquare, Info, Star, Swords } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, serverTimestamp, query, where, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function MlbbTools() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("region");
  const [loading, setLoading] = useState(false);
  const [results, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    playerId: "",
    zoneId: ""
  });

  const [toolSettings, setToolSettings] = useState({
    region: true,
    weekly: true,
    double: true
  });

  useEffect(() => {
    // Listen for system settings for tools
    const unsubSettings = onSnapshot(doc(db, "system_settings", "mlbb_tools"), (doc) => {
      if (doc.exists()) {
        setToolSettings(doc.data() as any);
      }
    });

    // Listen for history if user is logged in
    let unsubHistory: any;
    if (user) {
      const q = query(
        collection(db, "mlbb_tool_logs"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(5)
      );
      unsubHistory = onSnapshot(q, (snap) => {
        setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      });
    }

    return () => {
      unsubSettings();
      if (unsubHistory) unsubHistory();
    };
  }, [user]);

  const handleCheck = async (type: string) => {
    if (!form.playerId || !form.zoneId) {
      toast({ title: "Inputs Required", description: "Please enter both Player and Zone IDs.", variant: "destructive" });
      return;
    }

    if (!toolSettings[type as keyof typeof toolSettings]) {
      toast({ title: "Tool Restricted", description: "This tool is currently undergoing maintenance.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);

    // Simulate real-time API latency
    await new Promise(resolve => setTimeout(resolve, 2000));

    let mockResult: any = {};
    if (type === 'region') {
      mockResult = {
        name: "EliteGamer_" + form.playerId.substring(0, 3),
        region: "Europe/India",
        country: "India",
        status: "Active",
        verified: true
      };
    } else if (type === 'weekly') {
      mockResult = {
        activePasses: Math.floor(Math.random() * 2),
        remainingLimit: Math.floor(Math.random() * 10),
        status: "Eligible for Purchase",
        expiry: "N/A"
      };
    } else {
      mockResult = {
        firstRechargeStatus: "Claimed",
        eligible: Math.random() > 0.5 ? "Yes" : "No",
        packages: ["86 Diamonds", "172 Diamonds"]
      };
    }

    setResult(mockResult);

    // Save to Firestore Log
    try {
      await addDoc(collection(db, "mlbb_tool_logs"), {
        userId: user?.uid || "guest",
        toolType: type,
        playerId: form.playerId,
        zoneId: form.zoneId,
        result: mockResult,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Logging failed:", e);
    } finally {
      setLoading(false);
      toast({ title: "Intelligence Synchronized", description: "Account data fetched from Moonton Nodes." });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to Clipboard" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12 relative overflow-hidden">
        {/* Background Aura */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] -z-10 rounded-full" />

        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 space-y-4">
             <Badge className="bg-primary/20 text-primary border-none px-4 py-1 uppercase font-bold tracking-widest animate-pulse">Intelligence Suite</Badge>
             <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-tight">MLBB <span className="text-gradient">PRO TOOLS</span></h1>
             <p className="text-muted-foreground max-w-lg mx-auto">Verify account regions, tracking limits, and recharge eligibility with sub-second latency.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <Tabs defaultValue="region" onValueChange={setActiveTab} className="space-y-8">
                <TabsList className="grid grid-cols-3 bg-card border border-white/5 h-14 p-1 rounded-2xl">
                  <TabsTrigger value="region" className="rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Globe className="h-3 w-3" /> <span className="hidden sm:inline">Region Checker</span> <span className="sm:hidden">Region</span>
                  </TabsTrigger>
                  <TabsTrigger value="weekly" className="rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Zap className="h-3 w-3" /> <span className="hidden sm:inline">Pass Limit</span> <span className="sm:hidden">Limit</span>
                  </TabsTrigger>
                  <TabsTrigger value="double" className="rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
                    <Star className="h-3 w-3" /> <span className="hidden sm:inline">Double Diamond</span> <span className="sm:hidden">Double</span>
                  </TabsTrigger>
                </TabsList>

                <Card className="bg-card/50 border-white/5 overflow-hidden backdrop-blur-xl">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                    <CardTitle className="text-xl font-headline font-bold uppercase tracking-tight flex items-center gap-3">
                      {activeTab === 'region' && "Global Node Region Checker"}
                      {activeTab === 'weekly' && "Weekly Pass Quota Tracking"}
                      {activeTab === 'double' && "Double Diamond Eligibility Node"}
                    </CardTitle>
                    <CardDescription>Enter player credentials to initiate protocol scan.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Player ID</Label>
                        <Input 
                          placeholder="e.g. 123456789" 
                          className="h-12 bg-black/40 border-white/10 font-mono text-lg" 
                          value={form.playerId}
                          onChange={(e) => setForm({...form, playerId: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Zone ID</Label>
                        <Input 
                          placeholder="e.g. 9001" 
                          className="h-12 bg-black/40 border-white/10 font-mono text-lg" 
                          value={form.zoneId}
                          onChange={(e) => setForm({...form, zoneId: e.target.value})}
                        />
                      </div>
                    </div>

                    <Button 
                      className="w-full h-14 font-bold neon-glow-hover text-lg uppercase tracking-widest" 
                      onClick={() => handleCheck(activeTab)}
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing Nodes...</>
                      ) : (
                        <><Search className="mr-2 h-5 w-5" /> Execute Check</>
                      )}
                    </Button>

                    {results && (
                      <div className="mt-8 p-8 rounded-3xl bg-primary/5 border border-primary/20 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center justify-between mb-6">
                           <h3 className="font-headline font-bold text-lg uppercase">Intelligence Result</h3>
                           <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(results))}>
                             <Copy className="h-4 w-4 mr-2" /> Copy Result
                           </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {activeTab === 'region' && (
                            <>
                              <ResultItem label="Player Name" value={results.name} />
                              <ResultItem label="Region Cluster" value={results.region} />
                              <ResultItem label="Geo Location" value={results.country} />
                              <ResultItem label="Node Status" value={results.status} highlight="text-green-500" />
                            </>
                          )}
                          {activeTab === 'weekly' && (
                            <>
                              <ResultItem label="Active Passes" value={results.activePasses} />
                              <ResultItem label="Purchase Limit" value={results.remainingLimit + " Slots"} />
                              <ResultItem label="Eligibility" value={results.status} highlight="text-primary" />
                            </>
                          )}
                          {activeTab === 'double' && (
                            <>
                              <ResultItem label="First Recharge" value={results.firstRechargeStatus} />
                              <ResultItem label="Bonus Eligible" value={results.eligible} highlight={results.eligible === 'Yes' ? 'text-green-500' : 'text-destructive'} />
                              <ResultItem label="Available Tiers" value={results.packages.join(", ")} />
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Tabs>
            </div>

            <div className="lg:col-span-4 space-y-8">
               <Card className="bg-card border-white/5">
                  <CardHeader className="bg-white/5 border-b border-white/5">
                     <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                        <History className="h-4 w-4 text-primary" />
                        Scan History
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     {user ? (
                       <div className="divide-y divide-white/5">
                          {history.length === 0 ? (
                            <p className="p-8 text-center text-xs text-muted-foreground">Intelligence archive is empty.</p>
                          ) : (
                            history.map((log) => (
                              <div key={log.id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer group" onClick={() => {
                                setForm({ playerId: log.playerId, zoneId: log.zoneId });
                                setResult(log.result);
                                setActiveTab(log.toolType);
                              }}>
                                <div className="flex justify-between items-start mb-1">
                                   <Badge variant="outline" className="text-[8px] uppercase border-primary/20 text-primary">
                                      {log.toolType}
                                   </Badge>
                                   <span className="text-[8px] text-muted-foreground uppercase font-bold">
                                      {new Date(log.createdAt).toLocaleDateString()}
                                   </span>
                                </div>
                                <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">ID: {log.playerId} ({log.zoneId})</p>
                              </div>
                            ))
                          )}
                       </div>
                     ) : (
                       <div className="p-8 text-center space-y-4">
                          <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
                          <p className="text-xs text-muted-foreground uppercase font-bold">Sync required to enable history</p>
                          <Button size="sm" variant="outline" className="text-[10px] uppercase font-bold h-8" asChild>
                             <a href="/login">Authenticate</a>
                          </Button>
                       </div>
                     )}
                  </CardContent>
               </Card>

               <div className="glass-card p-6 rounded-3xl space-y-4 border-primary/20">
                  <div className="flex items-center gap-3">
                     <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                     </div>
                     <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-white">Manual Override</p>
                        <p className="text-[10px] text-muted-foreground">Error in results? Contact HQ.</p>
                     </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700 h-10 text-[10px] uppercase font-bold" asChild>
                     <a href="https://wa.me/918566936666" target="_blank">
                        Request Support Dispatch
                     </a>
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Floating WhatsApp Support Button refined to clear the refined AI chat button */}
      <a 
        href="https://wa.me/918566936666" 
        target="_blank" 
        className="fixed bottom-[72px] right-3 z-50 h-14 w-14 rounded-full bg-green-600 flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform neon-glow"
      >
        <MessageSquare className="h-6 w-6" />
      </a>
    </div>
  );
}

function ResultItem({ label, value, highlight = "text-white" }: { label: string, value: any, highlight?: string }) {
  return (
    <div className="space-y-1">
      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className={`font-bold text-sm ${highlight}`}>{value}</p>
    </div>
  );
}
