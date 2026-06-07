
"use client";

import { Zap, ShieldCheck, Headphones, Gift, Wallet, Users, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";

export function WhyChooseUs() {
  const features = [
    {
      icon: Zap,
      title: "Instant",
      description: "Automated fulfillment protocol: 0-5 minute guarantee."
    },
    {
      icon: ShieldCheck,
      title: "Secure",
      description: "256-bit encrypted gateway via UPI & Razorpay."
    },
    {
      icon: Headphones,
      title: "24/7 Live",
      description: "Elite support squad and Aatma AI on standby."
    },
    {
      icon: Gift,
      title: "Rewards",
      description: "Earn points on every top-up for discounts."
    },
    {
      icon: Wallet,
      title: "Wallet",
      description: "One-tap checkout with corporate liquidity."
    },
    {
      icon: Users,
      title: "Affiliate",
      description: "Lifetime recurring commissions on squad dispatches."
    }
  ];

  return (
    <section className="py-2.5 border-y border-white/5 bg-black/40 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <TooltipProvider delayDuration={0}>
          <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-hide py-0.5">
            {features.map((feature, i) => (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 p-1 transition-all cursor-pointer active:scale-95 group shrink-0">
                    <div className="h-5 w-5 rounded-md bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:bg-primary/20 transition-all">
                      <feature.icon className="h-2.5 w-2.5 text-primary" />
                    </div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors leading-none">
                      {feature.title}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-primary/30 p-3 rounded-2xl max-w-[200px] z-[70] shadow-2xl">
                  <p className="text-xs font-bold uppercase tracking-tight text-white mb-1">{feature.title}</p>
                  <p className="text-[10px] font-medium leading-relaxed text-muted-foreground">{feature.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}
