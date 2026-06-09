"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, History, Clock, CheckCircle as CheckCircle2, XCircle, Search, Loader2, Landmark, Briefcase } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, orderBy, runTransaction, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function ResellerEarnings() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "reseller_payouts"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPayouts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handlePayoutStatus = async (id: string, resellerId: string, amount: number, status: 'Approved' | 'Rejected') => {
    if (!confirm(`Mark payout of ₹${amount} as ${status}?`)) return;
    
    try {
      await runTransaction(db, async (transaction) => {
        const payoutRef = doc(db, "reseller_payouts", id);
        const userRef = doc(db, "users", resellerId);
        
        const payoutSnap = await transaction.get(payoutRef);
        if (!payoutSnap.exists()) throw "Payout node not found";
        if (payoutSnap.data().status !== 'Pending') throw "System already finalized";

        // 1. Update payout status
        transaction.update(payoutRef, {
          status,
          processedAt: new Date().toISOString()
        });

        // 2. Logic based on status
        if (status === 'Rejected') {
           // On rejection, refund the locked funds to reseller wallet
           transaction.update(userRef, {
              walletBalance: increment(amount)
           });
           
           // Log reversal txn
           const txnRef = doc(collection(db, "wallet_transactions"));
           transaction.set(txnRef, {
              userId: resellerId,
              amount,
              type: "Credit",
              description: `Payout System Rejected: Refund to B2B Wallet`,
              date: new Date().toISOString(),
              status: "Success",
              reference: id
           });
        } else {
           // On approval, just log a success transaction (funds were already deducted on request)
           const txnRef = doc(collection(db, "wallet_transactions"));
           transaction.set(txnRef, {
              userId: resellerId,
              amount,
              type: "Debit",
              description: `Payout System Approved & Finalized`,
              date: new Date().toISOString(),
              status: "Success",
              reference: id
           });
        }
      });

      toast({ title: `Payout ${status}`, description: "Partner liquidity synchronized." });
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.toString(), variant: "destructive" });
    }
  };

  const filtered = payouts.filter(p => 
    p.resellerId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Earnings & Payout Items</h2>
          <p className="text-muted-foreground">Audit and authorize B2B withdrawal requests from verified partners.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter by Business or UUID..." className="pl-10 h-12 bg-card/50 border-white/5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Corporate Entity</th>
                    <th className="px-6 py-4">Earnings Request</th>
                    <th className="px-6 py-4">Bank / UPI Intel</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No payout requests in buffer.</td></tr>
                  ) : filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                               <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                               <p className="font-bold text-white uppercase tracking-tight">{p.businessName || "Aatma Reseller"}</p>
                               <p className="text-[10px] text-muted-foreground font-mono uppercase">ID: {p.resellerId?.substring(0, 10)}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-xl font-headline font-bold text-green-500">₹{p.amount}</p>
                         <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Requested: {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-white">
                               <Landmark className="h-3 w-3 text-primary" />
                               {p.bankName}
                            </div>
                            <p className="text-[9px] font-mono text-muted-foreground">{p.accountNo} / {p.ifsc}</p>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge className={`text-[10px] uppercase font-bold border-none px-3 ${
                           p.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                           p.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'
                         }`}>
                           {p.status}
                         </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         {p.status === 'Pending' ? (
                           <div className="flex justify-end gap-2">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500 hover:bg-green-500/10" onClick={() => handlePayoutStatus(p.id, p.resellerId, p.amount, 'Approved')}>
                               <CheckCircle2 className="h-4 w-4" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handlePayoutStatus(p.id, p.resellerId, p.amount, 'Rejected')}>
                               <XCircle className="h-4 w-4" />
                             </Button>
                           </div>
                         ) : (
                           <Badge variant="outline" className="text-[8px] uppercase font-bold border-white/10 opacity-30">Audited</Badge>
                         )}
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}