
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Search, Loader2, DollarSign, UserCheck, ShieldCheck, History } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, runTransaction, serverTimestamp, getDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { getUserRank } from "@/lib/ranks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { logAdminAction } from "@/lib/admin-audit";

export default function AdminRecharges() {
  const { profile: adminProfile } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "deposit_requests"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRequests(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleApprove = async (request: any) => {
    if (!confirm(`Approve payload dispatch of ₹${request.amount} for ${request.userEmail}?`)) return;

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", request.userId);
        const userSnap = await transaction.get(userRef);

        if (!userSnap.exists()) {
          throw new Error("Target player node not detected in ecosystem.");
        }

        const userData = userSnap.data();
        const currentBalance = userData.walletBalance || 0;
        const currentDeposits = userData.totalDeposits || 0;
        const currentLifetime = userData.lifetimeRechargeAmount || 0;
        
        const newBalance = currentBalance + request.amount;
        const newDeposits = currentDeposits + request.amount;
        const newLifetime = currentLifetime + request.amount;
        const newRank = getUserRank(newLifetime).tier;

        transaction.update(userRef, { 
          walletBalance: newBalance,
          totalDeposits: newDeposits,
          lifetimeRechargeAmount: newLifetime,
          currentRank: newRank
        });

        const txnRef = doc(collection(db, "transactions"));
        transaction.set(txnRef, {
          userId: request.userId,
          amount: request.amount,
          type: "deposit",
          description: `Approved (UTR: ${request.utr || request.transactionId})`,
          status: "success",
          createdAt: new Date().toISOString(),
          processedBy: adminProfile?.email || "Admin Node"
        });

        const requestRef = doc(db, "deposit_requests", request.id);
        transaction.update(requestRef, {
          status: "approved",
          updatedAt: serverTimestamp(),
          processedBy: adminProfile?.email || "Admin Node"
        });

        // Audit Logging
        logAdminAction({
          adminId: adminProfile?.uid || 'unknown',
          adminEmail: adminProfile?.email || 'unknown',
          action: 'DEPOSIT_AUDIT',
          targetId: request.id,
          details: `Approved deposit of ₹${request.amount} for ${request.userEmail}. UTR: ${request.utr}`
        });
      });

      toast({ title: "Intelligence Synced", description: "Player liquidity updated." });
    } catch (error: any) {
      toast({ title: "Sync Failed", description: error.message, variant: "destructive" });
    }
  };

  const handleReject = async (request: any) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;

    try {
      const requestRef = doc(db, "deposit_requests", request.id);
      await updateDoc(requestRef, {
        status: "rejected",
        rejectionReason: reason,
        updatedAt: serverTimestamp(),
        processedBy: adminProfile?.email || "Admin Node"
      });

      logAdminAction({
        adminId: adminProfile?.uid || 'unknown',
        adminEmail: adminProfile?.email || 'unknown',
        action: 'DEPOSIT_AUDIT',
        targetId: request.id,
        details: `Rejected deposit of ₹${request.amount} for ${request.userEmail}. Reason: ${reason}`
      });

      toast({ title: "Proof Rejected", description: "Verification node closed." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const filtered = requests.filter(r => 
    (r.utr || r.transactionId)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.userEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Recharge Intelligence</h2>
          <p className="text-muted-foreground">Verify manual payment proofs and synchronize player liquidity nodes.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by Email or UTR Payload..." 
          className="pl-10 bg-card/50 border-white/5 h-12" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
         <TabsList className="bg-card border border-white/5 h-12 p-1 rounded-xl">
            <TabsTrigger value="pending" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Pending Verification</TabsTrigger>
            <TabsTrigger value="history" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Approval History</TabsTrigger>
         </TabsList>

         <TabsContent value="pending">
            <RechargeTable requests={filtered.filter(r => r.status === 'pending' || r.status === 'Pending')} onApprove={handleApprove} onReject={handleReject} loading={isLoading} />
         </TabsContent>

         <TabsContent value="history">
            <RechargeTable requests={filtered.filter(r => r.status !== 'pending' && r.status !== 'Pending')} onApprove={handleApprove} onReject={handleReject} loading={isLoading} />
         </TabsContent>
      </Tabs>
    </div>
  );
}

function RechargeTable({ requests, onApprove, onReject, loading }: any) {
   return (
    <Card className="bg-card border-white/5 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-8 py-5">Player Node</th>
                  <th className="px-8 py-5">UTR Payload</th>
                  <th className="px-8 py-5">Liquidity</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No signals in this sector.</td></tr>
                ) : (
                  requests.map((req: any) => (
                    <tr key={req.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div>
                           <p className="font-bold text-white uppercase tracking-tight text-xs">{req.userEmail}</p>
                           <p className="text-[8px] text-muted-foreground font-mono mt-1">REF: {req.id.substring(0, 12)}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6 font-mono text-[10px] font-bold text-primary">{req.utr || req.transactionId}</td>
                      <td className="px-8 py-6 font-headline font-bold text-lg text-green-500">₹{req.amount}</td>
                      <td className="px-8 py-6">
                        <Badge className={`text-[8px] uppercase font-bold tracking-widest border-none px-3 ${
                          req.status === 'approved' || req.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                          req.status === 'rejected' || req.status === 'Rejected' ? 'bg-destructive/10 text-destructive' :
                          'bg-orange-500/10 text-orange-500'
                        }`}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="px-8 py-6 text-right">
                        {(req.status === 'pending' || req.status === 'Pending') ? (
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-green-500" onClick={() => onApprove(req)}><CheckCircle className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onReject(req)}><XCircle className="h-4 w-4" /></Button>
                          </div>
                        ) : (
                           <div className="text-[8px] text-muted-foreground font-bold uppercase">
                              By: {req.processedBy?.split('@')[0] || 'System'}
                           </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
   );
}
