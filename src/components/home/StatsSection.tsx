"use client";

import { Users, Zap, ShieldCheck, Trophy, Globe, Activity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatsSection() {
  const stats = [
    { label: "Elite Operators", value: "50K+", icon: Users, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Total Orders", value: "1M+", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Fulfillment Rate", value: "99.9%", icon: ShieldCheck, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Support Available", value: "24/7", icon: Activity, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <section className="py-8 bg-card/20 rounded-[3rem] border border-white/5 shadow-inner">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-6">
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center space-y-4 group">
            <div className={cn("h-16 w-16 rounded-[2rem] flex items-center justify-center shrink-0 border border-white/5 transition-all group-hover:scale-110", s.bg)}>
              <s.icon className={cn("h-7 w-7", s.color)} />
            </div>
            <div>
              <p className="text-3xl font-headline font-bold text-white leading-none tracking-tighter">{s.value}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">{s.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}