"use client";

import { Award, ShieldCheck, TrendingUp, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { getUserRank, getRankProgress, RANKS } from "@/lib/ranks";
import Link from "next/link";

export function VIPPreview() {
  const { profile } = useAuth();
  
  const lifetime = profile?.lifetimeRechargeAmount || 0;
  const currentRank = getUserRank(lifetime);
  const progress = getRankProgress(lifetime);
  const nextRank = RANKS[RANKS.findIndex(r => r.tier === currentRank.tier) + 1];

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-card/80 to-secondary/10 border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl group">
       <CardHeader className="p-6 md:p-8 bg-white/5 border-b border-white/5">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground neon-glow">
                   <Award className="h-6 w-6" />
                </div>
                <div>
                   <CardTitle className="text-lg font-headline font-bold uppercase tracking-widest">VIP League</CardTitle>
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Elite Tier Program</p>
                </div>
             </div>
             <Link href="/profile" className="text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">Benefits HUB</Link>
          </div>
       </CardHeader>
       <CardContent className="p-6 md:p-8 space-y-8 flex-1">
          <div className="flex items-center justify-between">
             <div className="space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Node Status</p>
                <h4 className={`text-2xl md:text-3xl font-headline font-bold uppercase tracking-tight ${currentRank.color}`}>{currentRank.tier}</h4>
             </div>
             <div className="text-right space-y-1">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Global Vol.</p>
                <p className="text-xl font-headline font-bold text-white uppercase tracking-tighter">₹{lifetime.toLocaleString()}</p>
             </div>
          </div>

          <div className="space-y-3">
             <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                   <TrendingUp className="h-3 w-3 text-primary" />
                   <span className="text-[10px] font-bold uppercase text-white tracking-widest">Progress to {nextRank?.tier || 'MAX'}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{progress.toFixed(0)}%</span>
             </div>
             <Progress value={progress} className="h-2 bg-white/5 shadow-inner" />
             <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter text-center">
                Spend ₹{(nextRank?.threshold || lifetime) - lifetime} more to escalate status
             </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-1">
                   <Zap className="h-3 w-3 text-primary" />
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Discount</p>
                </div>
                <p className="text-lg font-headline font-bold text-white">0.5% - 2.0%</p>
             </div>
             <div className="p-4 rounded-2xl bg-black/40 border border-white/5 group-hover:border-primary/20 transition-all">
                <div className="flex items-center gap-2 mb-1">
                   <ShieldCheck className="h-3 w-3 text-green-500" />
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Support</p>
                </div>
                <p className="text-lg font-headline font-bold text-white">PRIORITY</p>
             </div>
          </div>
       </CardContent>
    </Card>
  );
}