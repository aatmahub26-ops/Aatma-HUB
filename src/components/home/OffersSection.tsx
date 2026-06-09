"use client";

import { Gift, Zap, Star, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export function OffersSection() {
  const offers = [
    { title: "New User Bonus", desc: "Get ₹50 flat on first deposit.", code: "AATMA50", icon: Gift, color: "text-pink-500", bg: "bg-pink-500/10" },
    { title: "Referral Reward", desc: "Earn ₹20 per verified recruit.", code: "SQUAD", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "Netflix VIP", desc: "Premium screens at ₹199 only.", code: "BINGE", icon: Zap, color: "text-red-500", bg: "bg-red-500/10" },
    { title: "MLBB Double", desc: "100% bonus on 172 Diamonds.", code: "MOON", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-500/10" },
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20">
                <Star className="h-5 w-5" />
             </div>
             <h3 className="font-headline font-bold text-xl md:text-2xl uppercase tracking-tight">Special Intelligence</h3>
          </div>
       </div>

       <div className="flex items-start gap-4 overflow-x-auto pb-6 scrollbar-hide px-0.5">
          {offers.map((offer, i) => (
            <Card key={i} className="flex-shrink-0 w-72 bg-card/40 border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/30 transition-all shadow-xl">
               <CardContent className="p-6 relative">
                  <div className={`absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity`}>
                     <offer.icon className="h-20 w-20" />
                  </div>
                  <div className="space-y-4 relative z-10">
                     <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-2xl ${offer.bg} ${offer.color}`}>
                           <offer.icon className="h-5 w-5" />
                        </div>
                        <Badge variant="outline" className="text-[9px] uppercase font-bold border-white/10">{offer.code}</Badge>
                     </div>
                     <div>
                        <h4 className="font-bold text-white uppercase tracking-tight mb-1">{offer.title}</h4>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">{offer.desc}</p>
                     </div>
                     <Link href="/catalog" className="flex items-center text-[9px] font-bold text-primary uppercase tracking-widest hover:underline">
                        View Offer <ArrowUpRight className="ml-1 h-3 w-3" />
                     </Link>
                  </div>
               </CardContent>
            </Card>
          ))}
       </div>
    </div>
  );
}