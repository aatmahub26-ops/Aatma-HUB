"use client";

import { useState, useEffect } from "react";
import { Zap, Clock, TrendingDown, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FlashDeals() {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    // Set fixed target for simulation: End of day
    const calculateTime = () => {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      const diff = tomorrow.getTime() - now.getTime();
      
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ h, m, s });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-card p-4 md:p-6 rounded-[2.5rem] border-primary/20 flex flex-col lg:flex-row items-center justify-between gap-8 overflow-hidden relative group">
       <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12 group-hover:scale-110 transition-transform duration-1000">
          <Zap className="h-32 w-32 md:h-48 md:w-48 text-primary" />
       </div>
       
       <div className="flex items-center gap-4 md:gap-6 relative z-10 w-full lg:w-auto">
          <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl md:rounded-3xl bg-primary flex items-center justify-center neon-glow">
             <Zap className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground fill-current animate-pulse" />
          </div>
          <div>
             <div className="flex items-center gap-3">
                <h3 className="font-headline font-bold text-2xl md:text-3xl uppercase tracking-tighter">Flash Deals</h3>
                <Badge className="bg-destructive text-white border-none text-[10px] animate-pulse px-3 py-1">LIVE NOW</Badge>
             </div>
             <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Exclusive Limited-Time Offers</p>
          </div>
       </div>

       <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full lg:w-auto">
          <div className="flex items-center gap-2">
             <TimeBlock value={timeLeft.h} label="HRS" />
             <span className="font-bold text-primary text-xl">:</span>
             <TimeBlock value={timeLeft.m} label="MIN" />
             <span className="font-bold text-primary text-xl">:</span>
             <TimeBlock value={timeLeft.s} label="SEC" />
          </div>

          <div className="h-10 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Active Deal</p>
                <p className="text-sm font-bold text-white uppercase truncate max-w-[120px]">MLBB 86 Diamonds</p>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-muted-foreground line-through text-xs font-bold">₹165</span>
                <span className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tighter">₹149</span>
             </div>
             <Button size="icon" className="h-12 w-12 rounded-2xl neon-glow-hover" asChild>
                <Link href="/catalog/mlbb-in"><ArrowRight className="h-5 w-5" /></Link>
             </Button>
          </div>
       </div>
    </div>
  );
}

function TimeBlock({ value, label }: { value: number, label: string }) {
  return (
    <div className="text-center">
       <div className="h-12 w-12 md:h-14 md:w-14 bg-black/40 rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
          <span className="text-lg md:text-2xl font-headline font-bold text-primary">{value.toString().padStart(2, '0')}</span>
       </div>
       <p className="text-[8px] font-bold text-muted-foreground uppercase mt-1.5 tracking-widest">{label}</p>
    </div>
  );
}