
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Smartphone, Landmark, CheckCircle as CheckCircle2, AlertCircle, History, TrendingUp, DollarSign, Loader2, Search, Zap, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Listen for standardized transactions collection
    const qTxn = query(collection(db, "transactions"), orderBy("createdAt", "desc"));
    const unsubTxn = onSnapshot(qTxn, (snap) => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Listen for standardized deposit_requests collection
    const qRec = query(collection(db, "deposit_requests"), orderBy("createdAt", "desc"));
    const unsubRec = onSnapshot(qRec, (snap) => {
      setRequests(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });

    return () => {
      unsubTxn();
      unsubRec();
    };
  }, []);

  const handleApproveDeposit = async (req: any) => {
    try {
      const userRef = doc(db, "users", req.userId);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) return;

      if (req.status === "Approved") {
        alert("Deposit already approved");
        return;
      }

      const currentBalance = userSnap.data().walletBalance || 0;

      await updateDoc(userRef, {
        walletBalance: currentBalance + Number(req.amount)
      });

      await updateDoc(doc(db, "deposit_requests", req.id), {
        status: "Approved"
      });

      await addDoc(collection(db, "transactions"), {
        userId: req.userId,
        amount: req.amount,
        type: "deposit",
        description: "Manual UPI Deposit Approved",
        createdAt: new Date().toISOString()
      });

      alert("Deposit Approved Successfully");
    } catch (e) {
      console.error(e);
      alert("Approval Failed");
    }
  };



  const handleRejectDeposit = async (req: any) => {
    try {
      await updateDoc(doc(db, "deposit_requests", req.id), {
        status: "Rejected"
      });

      alert("Deposit Rejected");
    } catch (e) {
      console.error(e);
      alert("Reject Failed");
    }
  };

  const filteredTransactions = transactions.filter(t => 
    t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    totalRevenue: requests.filter(r => r.status === 'approved' || r.status === 'Approved').reduce((acc, r) => acc + (r.amount || 0), 0),
    successCount: requests.filter(r => r.status === 'approved' || r.status === 'Approved').length,
    failedCount: requests.filter(r => r.status === 'rejected' || r.status === 'Rejected').length,
    pendingCount: requests.filter(r => r.status === 'pending' || r.status === 'Pending').length,
  };

  const gateways = [
    { name: "Razorpay", status: "Active", type: "Gateway", color: "bg-blue-500", icon: CreditCard, success: requests.filter(r => r.paymentMethod === 'Razorpay' && (r.status === 'approved' || r.status === 'Approved')).length },
    { name: "PhonePe", status: "Active", type: "Gateway", color: "bg-purple-600", icon: Smartphone, success: requests.filter(r => r.paymentMethod === 'PhonePe' && (r.status === 'approved' || r.status === 'Approved')).length },
    { name: "Manual UPI", status: "Active", type: "Manual", color: "bg-green-600", icon: Landmark, success: requests.filter(r => r.paymentMethod === 'Manual UPI' && (r.status === 'approved' || r.status === 'Approved')).length },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Payment Management</h2>
          <p className="text-muted-foreground">Monitor automated gateway protocols and coordinate manual reconciliations.</p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="h-10 border-primary/20 text-primary uppercase font-bold tracking-widest px-4">
              Gateway Health: 100%
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <StatCard label="Aggregate Deposits" value={`₹${stats.totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-500" />
         <StatCard label="Success Events" value={stats.successCount.toString()} icon={CheckCircle2} color="text-blue-500" />
         <StatCard label="Failed Payments" value={stats.failedCount.toString()} icon={XCircle} color="text-destructive" />
         <StatCard label="Verification Queue" value={stats.pendingCount.toString()} icon={AlertCircle} color="text-orange-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {gateways.map((method, i) => (
          <Card key={i} className="bg-card border-white/5 relative overflow-hidden group">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${method.color}/20`}>
                  <method.icon className={`h-5 w-5 ${method.color.replace('bg-', 'text-')}`} />
                </div>
                <Badge className="bg-green-500/10 text-green-500 border-none text-[8px]">{method.status}</Badge>
              </div>
              <CardTitle className="text-xl font-headline uppercase">{method.name}</CardTitle>
              <CardDescription className="text-[10px] uppercase font-bold tracking-widest">{method.type} • {method.success} Successes</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" size="sm" className="w-full justify-between text-[10px] font-bold border border-white/5 hover:bg-white/5 uppercase tracking-widest">
                Configure Payment
                <TrendingUp className="h-3 w-3" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card border-white/5">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase">Pending Deposit Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.filter(r => r.status === "pending" || r.status === "Pending").map((req) => (
              <div key={req.id} className="border border-white/10 rounded-lg p-4 flex flex-col gap-2">
                <div><b>User:</b> {req.userEmail}</div>
                <div><b>Amount:</b> ₹{req.amount}</div>
                <div><b>UTR:</b> {req.utr}</div>
                <div><b>Sender:</b> {req.senderName || "-"}</div>
                {req.proofUrl && (
                  <a href={req.proofUrl} target="_blank" className="text-primary underline">View Screenshot</a>
                )}
                <Button onClick={() => handleApproveDeposit(req)}>Approve Deposit</Button>
                <Button variant="destructive" onClick={() => handleRejectDeposit(req)}>Reject Deposit</Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-white/5">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4 bg-white/5">
          <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest flex items-center gap-2">
             <History className="h-4 w-4 text-primary" />
             Live Financial Ledger
          </CardTitle>
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search user, ID or description..." 
              className="pl-9 h-9 bg-black/40 border-white/10 text-xs" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-xs">
               <thead className="border-b border-white/5 bg-black/20 font-bold uppercase tracking-widest text-[9px] text-muted-foreground">
                 <tr>
                   <th className="px-6 py-4">Payment ID</th>
                   <th className="px-6 py-4">Player Admin</th>
                   <th className="px-6 py-4">Description</th>
                   <th className="px-6 py-4">Earnings</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 text-right">Timestamp</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {isLoading ? (
                   <tr><td colSpan={6} className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                 ) : filteredTransactions.length === 0 ? (
                   <tr><td colSpan={6} className="p-10 text-center text-muted-foreground uppercase font-bold tracking-widest text-[10px]">No financial signals detected.</td></tr>
                 ) : (
                   filteredTransactions.map((txn) => (
                     <tr key={txn.id} className="hover:bg-white/5 transition-colors group">
                       <td className="px-6 py-4 font-mono font-bold text-primary group-hover:text-white">#{txn.id.substring(0, 10).toUpperCase()}</td>
                       <td className="px-6 py-4 font-mono text-muted-foreground text-[10px] truncate max-w-[150px]">{txn.userId}</td>
                       <td className="px-6 py-4 font-bold uppercase text-[9px]">{txn.description}</td>
                       <td className={`px-6 py-4 font-headline font-bold text-sm ${txn.type === 'deposit' || txn.type === 'referral' || txn.type === 'Credit' ? 'text-green-500' : 'text-primary'}`}>
                         {txn.type === 'deposit' || txn.type === 'referral' || txn.type === 'Credit' ? '+' : '-'}₹{txn.amount}
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5">
                           <CheckCircle2 className="h-3 w-3 text-green-500" />
                           <span className="text-green-500 font-bold uppercase tracking-widest text-[9px]">Verified</span>
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right text-muted-foreground font-bold text-[9px] uppercase tracking-tighter">
                         {txn.createdAt ? new Date(txn.createdAt).toLocaleString() : 'N/A'}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <Card className="bg-card border-white/5 overflow-hidden group hover:border-primary/20 transition-all">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className={`text-2xl font-headline font-bold text-white mt-1`}>{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}
