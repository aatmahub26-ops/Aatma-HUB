
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Gift, TrendingUp, Search, Loader2, Award, DollarSign, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminReferrals() {
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReferrals: 0,
    totalCommissions: 0,
    topReferrer: "---"
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "referrals"), (snap) => {
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReferrals(data);
      
      const totalComm = data.reduce((sum, r) => sum + (r.earnings || 0), 0);
      setStats({
        totalReferrals: data.length,
        totalCommissions: totalComm,
        topReferrer: "Admin HQ"
      });
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Affiliate Admin</h2>
          <p className="text-muted-foreground">Audit squad recruitment logs and cross-node commissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <StatCard label="Network Size" value={stats.totalReferrals.toString()} icon={Users} color="text-primary" />
         <StatCard label="Admin Payouts" value={`₹${stats.totalCommissions.toFixed(2)}`} icon={DollarSign} color="text-green-500" />
         <StatCard label="Squad Master" value={stats.topReferrer} icon={Award} color="text-yellow-500" />
      </div>

      <Card className="bg-card border-white/5">
        <CardHeader className="border-b border-white/5 bg-white/5">
           <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Global Referral Ledger
           </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
           <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground bg-black/20">
                    <tr>
                       <th className="px-6 py-4">Referrer (Squad Master)</th>
                       <th className="px-6 py-4">Recruit (Member)</th>
                       <th className="px-6 py-4">Commission Earnings</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Timestamp</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                    {loading ? (
                       <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></td></tr>
                    ) : referrals.length === 0 ? (
                       <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase tracking-widest text-xs font-bold">Network empty</td></tr>
                    ) : referrals.map((ref) => (
                       <tr key={ref.id} className="hover:bg-white/5 transition-colors group">
                          <td className="px-6 py-4 font-bold text-white uppercase text-xs">{ref.referrerId.substring(0, 12)}...</td>
                          <td className="px-6 py-4 text-muted-foreground font-mono text-[10px]">{ref.userId.substring(0, 12)}...</td>
                          <td className="px-6 py-4 font-bold text-green-500">₹{ref.earnings || 0}</td>
                          <td className="px-6 py-4">
                             <Badge variant="outline" className="text-[8px] uppercase border-primary/20 text-primary">Active</Badge>
                          </td>
                          <td className="px-6 py-4 text-right text-muted-foreground text-[10px] uppercase font-bold">
                             {new Date(ref.date).toLocaleDateString()}
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

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <Card className="bg-card border-white/5 group hover:border-primary/20 transition-all">
       <CardContent className="p-6 flex items-center justify-between">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
             <p className="text-2xl font-headline font-bold text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-2xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
             <Icon className="h-6 w-6" />
          </div>
       </CardContent>
    </Card>
  );
}
