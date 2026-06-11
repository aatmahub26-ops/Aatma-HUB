"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, History, Clock, Loader2, RefreshCw, Smartphone, TrendingUp, PiggyBank, CreditCard, Gift, AlertCircle, Star, Coins,Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, runTransaction, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const { user, profile, loading } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [recharges, setRecharges] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLoadingData(true);
      setError(null);

      const qTxns = query(
        collection(db, "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      
      const qRecharges = query(
        collection(db, "deposit_requests"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );

      const unsubTxns = onSnapshot(qTxns, 
        (sn) => {
          setTransactions(sn.docs.map(d => ({ id: d.id, ...d.data() })));
        },
        (err) => {
          console.error("Wallet: Transaction sync failed.", err);
          setError("Failed to sync transaction ledger.");
        }
      );

      const unsubRecs = onSnapshot(qRecharges, 
        (sn) => {
          setRecharges(sn.docs.map(d => ({ id: d.id, ...d.data() })));
          setLoadingData(false);
        },
        (err) => {
          console.error("Wallet: Deposit sync failed.", err);
          setLoadingData(false);
        }
      );

      return () => { unsubTxns(); unsubRecs(); };
    }
  }, [user]);


  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;


  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase leading-none">Wallet</h1>
                <p className="text-muted-foreground mt-1 text-sm uppercase font-bold tracking-widest opacity-60">Manage capital for high-speed digital dispatches</p>
              </div>
              <div className="flex gap-4">
                 <Button variant="outline" asChild className="h-12 border-white/5 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                 </Button>
                 <Button asChild className="h-12 px-10 font-bold neon-glow-hover transition-all rounded-2xl">
                    <Link href="/wallet/add">
                      <Plus className="mr-2 h-4 w-4" />
                      Load Funds
                    </Link>
                 </Button>
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex items-center gap-3 text-destructive text-sm font-bold uppercase tracking-tight">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <StatCard 
                 label="Current Balance" 
                 value={`₹${profile?.walletBalance?.toFixed(2) || "0.00"}`} 
                 icon={Wallet} 
                 color="text-primary" 
               />
               <StatCard 
                 label="Total Deposits" 
                 value={`₹${profile?.totalDeposits?.toLocaleString() || "0"}`} 
                 icon={PiggyBank} 
                 color="text-green-500" 
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <Tabs defaultValue="txns" className="space-y-6">
                  <TabsList className="bg-card border border-white/5 w-full justify-start p-1.5 h-14 rounded-2xl">
                    <TabsTrigger value="txns" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-8 font-bold uppercase text-[10px] tracking-widest">
                      <History className="w-4 h-4 mr-2" />
                      Transaction Micro-Logs
                    </TabsTrigger>
                    <TabsTrigger value="recharges" className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-primary-foreground h-full px-8 font-bold uppercase text-[10px] tracking-widest">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Verification Queue
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="txns">
                    <Card className="bg-card/50 border-white/5 min-h-[500px] rounded-[2rem] overflow-hidden">
                      <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                          {loadingData ? (
                            <div className="p-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>
                          ) : transactions.length === 0 ? (
                            <div className="p-20 text-center py-32 opacity-20">
                              <History className="h-16 w-16 mx-auto mb-4" />
                              <p className="text-xs uppercase font-bold tracking-widest">No financial events captured</p>
                            </div>
                          ) : (
                            transactions.map((txn) => (
                              <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                <div className="flex items-center space-x-5">
                                  <div className={`p-4 rounded-2xl ${txn.type === 'deposit' || txn.type === 'referral' || txn.type === 'Credit' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                                    {txn.type === 'deposit' || txn.type === 'referral' || txn.type === 'Credit' ? <ArrowDownLeft className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-white uppercase tracking-tight">{txn.description || txn.type}</p>
                                    <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-1.5 font-bold uppercase tracking-widest">
                                      <Clock className="h-3 w-3" />
                                      <span>{txn.createdAt ? new Date(txn.createdAt).toLocaleString() : 'Processing'}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className={`font-bold text-xl font-headline ${txn.type === 'deposit' || txn.type === 'referral' || txn.type === 'Credit' ? 'text-green-500' : 'text-white'}`}>
                                    {txn.type === 'deposit' || txn.type === 'referral' || txn.type === 'Credit' ? '+' : '-'}₹{txn.amount}
                                  </p>
                                  <Badge className="text-[8px] h-4 uppercase border-none bg-green-500/10 text-green-500 font-bold tracking-widest mt-1">Confirmed</Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="recharges">
                    <Card className="bg-card/50 border-white/5 min-h-[500px] rounded-[2rem] overflow-hidden">
                      <CardContent className="p-0">
                        <div className="divide-y divide-white/5">
                          {recharges.length === 0 && !loadingData ? (
                            <div className="p-20 text-center py-32 opacity-20">
                              <Smartphone className="h-16 w-16 mx-auto mb-4" />
                              <p className="text-xs uppercase font-bold tracking-widest">Verification queue is empty</p>
                            </div>
                          ) : (
                            recharges.map((req) => (
                              <div key={req.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                                <div>
                                  <p className="font-bold text-sm text-white">₹{req.amount} Payload Deployment</p>
                                  <div className="flex items-center gap-3 mt-1.5">
                                    <div className="px-2 py-0.5 bg-black/40 rounded border border-white/5">
                                      <p className="text-[10px] text-primary font-mono font-bold uppercase">UTR: {req.utr || req.transactionId}</p>
                                    </div>
                                    <span className="text-[10px] opacity-20">•</span>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                                      {new Date(req.createdAt).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge className={`text-[10px] font-bold uppercase tracking-widest border-none px-3 ${
                                    req.status === 'approved' || req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                                    req.status === 'rejected' || req.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'
                                  }`}>
                                    {req.status}
                                  </Badge>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="lg:col-span-4 space-y-6">
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <Card className="bg-card/50 border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
      <CardContent className="p-6 items-center justify-between flex">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className={`text-2xl font-headline font-bold mt-1.5 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
