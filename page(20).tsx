
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle, XCircle, Briefcase, TrendingUp, ShieldCheck, MoreVertical, Edit3, Wallet, Lock, Unlock, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { collection, query, where, onSnapshot, doc, updateDoc, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RESELLER_LEVELS } from "@/lib/reseller-levels";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminResellers() {
  const [resellers, setResellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "users"), where("role", "==", "reseller"));
    const unsubscribe = onSnapshot(q, (snap) => {
      setResellers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "users", id), { resellerStatus: status });
      toast({ title: `Account ${status}`, description: `Reseller access has been updated.` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  const handleWalletAdjustment = async (id: string, current: number, amount: number, type: 'Credit' | 'Debit') => {
    const adjustedAmount = type === 'Credit' ? amount : -amount;
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", id);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "User not found";
        
        const newBalance = (userSnap.data().walletBalance || 0) + adjustedAmount;
        transaction.update(userRef, { walletBalance: newBalance });

        const txnRef = doc(collection(db, "wallet_transactions"));
        transaction.set(txnRef, {
          userId: id,
          amount: Math.abs(amount),
          type,
          description: `Admin Manual B2B ${type}`,
          date: new Date().toISOString(),
          status: "Success"
        });
      });
      toast({ title: "B2B Wallet Updated", description: `${type} successful.` });
    } catch (e: any) {
      toast({ title: "Transaction Failed", description: e.message, variant: "destructive" });
    }
  };

  const filtered = resellers.filter(r => 
    r.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Verified B2B Partners</h2>
          <p className="text-muted-foreground">Manage distribution levels, credit limits, and operational status.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search partners..." className="pl-10 h-12 bg-card/50 border-white/5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Corporate Identity</th>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4">B2B Funds</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                  ) : filtered.map((res) => (
                    <tr key={res.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                               <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                               <p className="font-bold text-white uppercase tracking-tight">{res.businessName}</p>
                               <p className="text-[10px] text-muted-foreground">{res.email}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge variant="outline" className="text-[9px] uppercase border-white/10 font-bold">{res.resellerLevel}</Badge>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-xs font-bold text-green-500">₹{res.walletBalance?.toFixed(2)}</p>
                      </td>
                      <td className="px-6 py-4">
                         <Badge className={`text-[9px] uppercase font-bold border-none ${
                           res.resellerStatus === 'Approved' ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'
                         }`}>
                           {res.resellerStatus}
                         </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <DropdownMenu>
                           <DropdownMenuTrigger asChild>
                             <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                           </DropdownMenuTrigger>
                           <DropdownMenuContent align="end" className="bg-card border-white/10">
                              <DropdownMenuItem onClick={() => {
                                const amt = window.prompt("Enter Credit Amount (₹)");
                                if (amt) handleWalletAdjustment(res.id, res.walletBalance, parseFloat(amt), 'Credit');
                              }}>
                                <ArrowUpCircle className="mr-2 h-4 w-4 text-green-500" /> Manual Credit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive" onClick={() => handleStatusChange(res.id, 'Frozen')}>
                                <Lock className="mr-2 h-4 w-4" /> Freeze Access
                              </DropdownMenuItem>
                           </DropdownMenuContent>
                         </DropdownMenu>
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
