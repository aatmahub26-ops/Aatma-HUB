
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, ArrowUpCircle, ArrowDownCircle, History, Clock, Loader2, Plus, QrCode, Copy, CheckCircle2, Landmark, Send, XCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ResellerWallet() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [utr, setUtr] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [withdrawForm, setWithdrawForm] = useState({
     amount: "",
     bankName: "",
     accountNo: "",
     ifsc: ""
  });

  useEffect(() => {
    if (user) {
      // 1. Listen for wallet transactions
      const qTxn = query(collection(db, "wallet_transactions"), where("userId", "==", user.uid), orderBy("date", "desc"));
      const unsubTxn = onSnapshot(qTxn, (snap) => {
        setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      // 2. Listen for payout requests
      const qPayouts = query(collection(db, "reseller_payouts"), where("resellerId", "==", user.uid), orderBy("createdAt", "desc"));
      const unsubPayouts = onSnapshot(qPayouts, (snap) => {
        setPayouts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      });

      return () => {
        unsubTxn();
        unsubPayouts();
      };
    }
  }, [user]);

  const handleRechargeRequest = async () => {
    if (!amount || !utr) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "recharge_requests"), {
        userId: user?.uid,
        userEmail: user?.email,
        amount: parseFloat(amount),
        transactionId: utr,
        status: "Pending",
        createdAt: serverTimestamp(),
        method: "B2B Manual"
      });
      toast({ title: "Request Sent", description: "B2B recharge queued for admin verification." });
      setRechargeOpen(false);
      setAmount("");
      setUtr("");
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdrawRequest = async () => {
     const amt = parseFloat(withdrawForm.amount);
     if (!amt || amt < 500) {
        toast({ title: "Invalid Amount", description: "Minimum yield withdrawal is ₹500.", variant: "destructive" });
        return;
     }
     if ((profile?.walletBalance || 0) < amt) {
        toast({ title: "Insufficient Liquidity", description: "Request amount exceeds available B2B funds.", variant: "destructive" });
        return;
     }

     setIsSubmitting(true);
     try {
        await runTransaction(db, async (transaction) => {
           const userRef = doc(db, "users", user!.uid);
           const userSnap = await transaction.get(userRef);
           if (!userSnap.exists()) throw "User not found";

           const currentBalance = userSnap.data().walletBalance || 0;
           if (currentBalance < amt) throw "Insufficient balance";

           // 1. Create payout node
           const payoutRef = doc(collection(db, "reseller_payouts"));
           transaction.set(payoutRef, {
              resellerId: user?.uid,
              businessName: profile?.businessName || profile?.firstName,
              ...withdrawForm,
              amount: amt,
              status: "Pending",
              createdAt: new Date().toISOString()
           });

           // 2. Deduct from wallet immediately (fund lock)
           transaction.update(userRef, {
              walletBalance: currentBalance - amt
           });

           // 3. Create transaction record
           const txnRef = doc(collection(db, "wallet_transactions"));
           transaction.set(txnRef, {
              userId: user?.uid,
              amount: amt,
              type: "Debit",
              description: `Withdrawal Requested: ${withdrawForm.bankName}`,
              date: new Date().toISOString(),
              status: "Pending",
              reference: payoutRef.id
           });
        });

        toast({ title: "Withdrawal Initiated", description: "Funds locked and queued for HQ audit." });
        setWithdrawOpen(false);
        setWithdrawForm({ amount: "", bankName: "", accountNo: "", ifsc: "" });
     } catch (e: any) {
        toast({ title: "Request Failed", description: e.toString(), variant: "destructive" });
     } finally {
        setIsSubmitting(false);
     }
  };

  const upiId = "aatmahub@upi";

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Corporate Wallet</h2>
          <p className="text-muted-foreground">Manage your B2B distribution funds and yield payouts.</p>
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-12 px-8 font-bold border-primary/20 text-primary" onClick={() => setWithdrawOpen(true)}>
             <Send className="mr-2 h-5 w-5" /> Withdraw Yield
           </Button>
           <Button className="h-12 px-8 font-bold neon-glow" onClick={() => setRechargeOpen(!rechargeOpen)}>
             <Plus className="mr-2 h-5 w-5" /> Load B2B Funds
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-gradient-to-br from-primary/20 to-secondary/20 border-white/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Wallet className="h-32 w-32 text-primary" />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-primary">B2B Funds Available</p>
                  <h2 className="text-5xl font-headline font-bold text-white">₹{profile?.walletBalance?.toFixed(2) || "0.00"}</h2>
                </div>
                <div className="pt-4 border-t border-white/5">
                   <Badge className="bg-green-500/10 text-green-500 border-none font-bold uppercase tracking-widest px-4 py-1">Operational</Badge>
                </div>
              </CardContent>
           </Card>

           {rechargeOpen && (
             <Card className="bg-card border-primary/20 animate-in zoom-in-95 duration-200">
                <CardHeader className="bg-primary/5 border-b border-white/5">
                   <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">Manual Load Node</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                   <div className="space-y-4">
                      <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground">Recharge Amount (₹)</Label>
                         <Input type="number" placeholder="5000" className="h-12 bg-black/40 border-white/10" value={amount} onChange={(e) => setAmount(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                         <Label className="text-[10px] uppercase font-bold text-muted-foreground">UTR / Transaction ID</Label>
                         <Input placeholder="Enter 12 digit Ref No." className="h-12 bg-black/40 border-white/10" value={utr} onChange={(e) => setUtr(e.target.value)} />
                      </div>
                   </div>
                   <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground uppercase font-bold">Admin UPI Node</span>
                      <span className="font-mono text-primary font-bold">{upiId}</span>
                   </div>
                   <Button className="w-full h-12 font-bold uppercase" onClick={handleRechargeRequest} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Deploy Recharge Proof"}
                   </Button>
                </CardContent>
             </Card>
           )}
        </div>

        <div className="lg:col-span-8">
           <Tabs defaultValue="txns" className="space-y-6">
              <TabsList className="bg-card border border-white/5 h-12 p-1 rounded-xl">
                 <TabsTrigger value="txns" className="px-6 rounded-lg font-bold uppercase text-[9px] tracking-widest">Financial Ledger</TabsTrigger>
                 <TabsTrigger value="payouts" className="px-6 rounded-lg font-bold uppercase text-[9px] tracking-widest">Withdrawal History</TabsTrigger>
              </TabsList>

              <TabsContent value="txns">
                 <Card className="bg-card border-white/5 overflow-hidden min-h-[500px]">
                    <CardHeader className="bg-black/40 border-b border-white/5">
                       <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                          <History className="h-4 w-4 text-primary" />
                          B2B Ledger Logs
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-white/5">
                          {transactions.length === 0 ? (
                             <div className="py-32 text-center space-y-4 opacity-20">
                                <History className="h-12 w-12 mx-auto" />
                                <p className="text-xs uppercase font-bold tracking-widest">No wallet activity detected</p>
                             </div>
                          ) : (
                             transactions.map(txn => (
                                <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                                   <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-2xl ${txn.type === 'Credit' ? 'bg-green-500/10' : 'bg-primary/10'}`}>
                                         {txn.type === 'Credit' ? <ArrowUpCircle className="h-5 w-5 text-green-500" /> : <ArrowDownCircle className="h-5 w-5 text-primary" />}
                                      </div>
                                      <div>
                                         <p className="font-bold text-sm uppercase">{txn.description}</p>
                                         <p className="text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                            {new Date(txn.date).toLocaleDateString()} • {new Date(txn.date).toLocaleTimeString()}
                                         </p>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <p className={`text-lg font-headline font-bold ${txn.type === 'Credit' ? 'text-green-500' : 'text-white'}`}>
                                         {txn.type === 'Credit' ? '+' : '-'}₹{txn.amount}
                                      </p>
                                      <Badge variant="outline" className={`text-[8px] h-4 uppercase border-white/10 ${txn.status === 'Success' ? 'text-green-500' : 'text-muted-foreground'}`}>{txn.status || 'SUCCESS'}</Badge>
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                    </CardContent>
                 </Card>
              </TabsContent>

              <TabsContent value="payouts">
                 <Card className="bg-card border-white/5 overflow-hidden min-h-[500px]">
                    <CardHeader className="bg-black/40 border-b border-white/5">
                       <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                          <Send className="h-4 w-4 text-primary" />
                          Payout Archive
                       </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                       <div className="divide-y divide-white/5">
                          {payouts.length === 0 ? (
                             <div className="py-32 text-center space-y-4 opacity-20">
                                <History className="h-12 w-12 mx-auto" />
                                <p className="text-xs uppercase font-bold tracking-widest">No yield withdrawals requested</p>
                             </div>
                          ) : (
                             payouts.map(p => (
                                <div key={p.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all">
                                   <div className="flex items-center gap-4">
                                      <div className={`p-3 rounded-2xl ${p.status === 'Approved' ? 'bg-green-500/10' : p.status === 'Rejected' ? 'bg-destructive/10' : 'bg-orange-500/10'}`}>
                                         {p.status === 'Approved' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : p.status === 'Rejected' ? <XCircle className="h-5 w-5 text-destructive" /> : <Clock className="h-5 w-5 text-orange-500" />}
                                      </div>
                                      <div>
                                         <p className="font-bold text-sm uppercase">₹{p.amount} Withdrawal</p>
                                         <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase mt-1">
                                            <Landmark className="h-3 w-3 text-primary" />
                                            <span>{p.bankName}</span>
                                         </div>
                                      </div>
                                   </div>
                                   <div className="text-right">
                                      <Badge className={`text-[9px] uppercase font-bold border-none px-3 ${
                                         p.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                                         p.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'
                                      }`}>
                                         {p.status}
                                      </Badge>
                                      <p className="text-[8px] text-muted-foreground uppercase font-bold mt-1.5">{new Date(p.createdAt).toLocaleDateString()}</p>
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
      </div>

      <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
         <DialogContent className="bg-card border-white/10 max-w-md rounded-[2.5rem] p-10">
            <DialogHeader>
               <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-tight">Withdraw Yield</DialogTitle>
               <DialogDescription className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">Transfer B2B commissions to bank node.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-6">
               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Amount (₹)</Label>
                  <Input type="number" placeholder="Min. 500" className="h-12 bg-black/40 border-white/10" value={withdrawForm.amount} onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})} />
               </div>
               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest">Bank / Institution Name</Label>
                  <Input placeholder="e.g. HDFC Bank" className="h-12 bg-black/40 border-white/10" value={withdrawForm.bankName} onChange={(e) => setWithdrawForm({...withdrawForm, bankName: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase font-bold tracking-widest">Account Node</Label>
                     <Input placeholder="Account No" className="h-12 bg-black/40 border-white/10" value={withdrawForm.accountNo} onChange={(e) => setWithdrawForm({...withdrawForm, accountNo: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase font-bold tracking-widest">IFSC / Code</Label>
                     <Input placeholder="IFSC" className="h-12 bg-black/40 border-white/10 font-mono uppercase" value={withdrawForm.ifsc} onChange={(e) => setWithdrawForm({...withdrawForm, ifsc: e.target.value})} />
                  </div>
               </div>
               <Button className="w-full h-14 font-bold uppercase tracking-widest neon-glow mt-4" onClick={handleWithdrawRequest} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Deploy Payout Request"}
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
