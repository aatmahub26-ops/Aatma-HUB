
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, CheckCircle2, Clock, Package, AlertCircle, ArrowLeft, XCircle, ImageIcon, ShieldCheck, Zap, ExternalLink } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || "";
  const [orderId, setOrderId] = useState(initialId);
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<any>(null);

  const fetchOrder = async (id: string) => {
    if (!id.trim()) return;
    setIsSearching(true);
    setResult(null);

    try {
      const docRef = doc(db, "orders", id.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setResult({ id: docSnap.id, ...docSnap.data() });
      } else {
        setResult("not_found");
      }
    } catch (error) {
      console.error("Search error:", error);
      setResult("error");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      fetchOrder(initialId);
    }
  }, [initialId]);

  const handleSearch = () => {
    fetchOrder(orderId);
  };

  const getStatusIcon = (stepStatus: string) => {
    if (stepStatus === 'completed') return CheckCircle2;
    if (stepStatus === 'failed') return XCircle;
    if (stepStatus === 'current') return Package;
    return Clock;
  };

  const steps = [
    { label: "Dispatch Placed", status: result?.id ? "completed" : "pending" },
    { label: "Liquidity Verified", status: result?.id ? "completed" : "pending" },
    { 
      label: result?.status === 'Failed' ? "Protocol Failed" : result?.status === 'Completed' ? "Dispatched" : "Fulfillment Logic Active", 
      status: result?.status === 'Completed' ? 'completed' : result?.status === 'Failed' ? 'failed' : result?.status === 'Processing' ? 'current' : 'pending' 
    },
    { label: "Execution Successful", status: result?.status === 'Completed' ? 'completed' : 'pending' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase">Protocol Tracking</h1>
          <p className="text-muted-foreground mt-1 text-sm uppercase font-bold tracking-widest opacity-60">Real-time status of your digital asset distribution</p>
        </div>
        <Button variant="ghost" asChild className="text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded-xl px-6">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <Card className="bg-card/50 border-white/5 p-1.5 rounded-[2.5rem] overflow-hidden group hover:border-primary/20 transition-all">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Input Dispatch ID (e.g. 5qWz...)" 
              className="h-16 pl-14 bg-transparent border-none text-lg font-headline font-bold focus-visible:ring-0 placeholder:text-muted-foreground/40"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button className="h-16 px-12 font-bold neon-glow text-lg uppercase tracking-tighter rounded-[2.3rem]" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? <Loader2 className="h-6 w-6 animate-spin" /> : "Track Now"}
          </Button>
        </div>
      </Card>

      {result === "not_found" && (
        <Card className="bg-destructive/5 border-destructive/20 p-12 text-center animate-in zoom-in-95 rounded-[2.5rem]">
           <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
           <h3 className="text-2xl font-bold font-headline uppercase">Node Not Detected</h3>
           <p className="text-muted-foreground max-w-sm mx-auto uppercase text-[10px] font-bold tracking-widest leading-relaxed">Intelligence node <span className="text-white font-mono">{orderId}</span> was not found in the platform ledger. Verify the ID and re-attempt.</p>
        </Card>
      )}

      {result && result !== "not_found" && result !== "error" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in slide-in-from-bottom-4 duration-700">
           
           <div className="lg:col-span-4 space-y-6">
              <Card className="bg-card border-white/5 rounded-[2.5rem] overflow-hidden">
                 <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                    <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                       <ShieldCheck className="h-4 w-4" />
                       Intelligence Node Summary
                    </CardTitle>
                 </CardHeader>
                 <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Protocol ID</span>
                          <span className="text-[10px] font-mono font-bold text-white bg-white/5 px-2 py-1 rounded truncate max-w-[140px]">{result.id}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Target Title</span>
                          <span className="text-sm font-bold text-white uppercase">{result.productName}</span>
                       </div>
                       <div className="flex justify-between items-center">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Dispatch Layer</span>
                          <span className="text-sm font-bold text-primary uppercase">{result.packageName}</span>
                       </div>
                       <div className="flex justify-between items-center pt-4 border-t border-white/5">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Status</span>
                          <Badge className={
                            result.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-none px-4 h-6 font-bold uppercase tracking-widest' : 
                            result.status === 'Failed' ? 'bg-destructive/10 text-destructive border-none px-4 h-6 font-bold uppercase tracking-widest' :
                            'bg-blue-500/10 text-blue-500 border-none px-4 h-6 font-bold uppercase tracking-widest'
                          }>
                            {result.status}
                          </Badge>
                       </div>
                    </div>

                    <div className="p-6 rounded-[1.5rem] bg-muted/20 border border-white/5 space-y-2">
                       <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Player Target</p>
                       <p className="text-2xl font-headline font-bold text-white tracking-tighter truncate">{result.playerGameId}</p>
                    </div>
                 </CardContent>
              </Card>

              {result.proofUrl && (
                <Card className="bg-card border-white/5 rounded-[2.5rem] overflow-hidden">
                   <CardHeader className="bg-white/5 p-6 border-b border-white/5">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                         <ImageIcon className="h-4 w-4 text-green-500" />
                         Fulfillment Proof captured
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-6">
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-white/5 group">
                         <img src={result.proofUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Proof" />
                         <a href={result.proofUrl} target="_blank" className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <ExternalLink className="h-6 w-6 text-white" />
                         </a>
                      </div>
                   </CardContent>
                </Card>
              )}
           </div>

           <div className="lg:col-span-8">
              <Card className="bg-card border-white/5 rounded-[2.5rem] p-10 md:p-20 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12">
                    <Zap className="h-64 w-64 text-primary" />
                 </div>
                 
                 <div className="relative">
                    <div className="absolute left-[19px] top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-white/5 to-transparent rounded-full" />
                    
                    <div className="space-y-16 relative">
                       {steps.map((step, i) => {
                         const Icon = getStatusIcon(step.status);
                         return (
                           <div key={i} className="flex items-center space-x-10 animate-in fade-in slide-in-from-left-4" style={{ animationDelay: `${i * 150}ms` }}>
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center relative z-10 shadow-2xl transition-all duration-500 ${
                                step.status === 'completed' ? 'bg-primary text-primary-foreground scale-110' : 
                                step.status === 'failed' ? 'bg-destructive text-destructive-foreground scale-110' : 
                                step.status === 'current' ? 'bg-blue-500 text-white animate-pulse scale-125' :
                                'bg-muted text-muted-foreground border-2 border-white/5'
                              }`}>
                                 <Icon className="h-5 w-5" />
                              </div>
                              <div className="space-y-1">
                                 <p className={`font-headline font-bold text-xl uppercase tracking-tighter ${step.status === 'completed' ? 'text-white' : 'text-muted-foreground'}`}>{step.label}</p>
                                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
                                   {step.status === 'completed' ? 'Confirmed by Aatma Core' : step.status === 'failed' ? 'Protocol Termination Detected' : 'Awaiting confirmation from node clusters...'}
                                 </p>
                              </div>
                           </div>
                         );
                       })}
                    </div>
                 </div>
              </Card>

              <div className="mt-8 flex items-center gap-6 p-8 rounded-[2rem] bg-primary/5 border border-primary/20">
                 <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <ShieldCheck className="h-7 w-7 text-primary" />
                 </div>
                 <p className="text-xs text-muted-foreground leading-relaxed uppercase font-bold tracking-tight">
                    Every dispatch protocol is audited by the Aatma HQ squad. If status is <span className="text-white">Completed</span> but assets haven't arrived, contact support with your Proof Screenshot immediately.
                 </p>
              </div>
           </div>

        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <Suspense fallback={<div className="flex items-center justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>}>
            <OrderTrackingContent />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
