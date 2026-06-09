"use client";

import { ShieldCheck, Zap, Headphones, CheckCircle2, Lock, Globe } from "lucide-react";

export function TrustSection() {
  const trustNodes = [
    { icon: Lock, title: "256-BIT ENCRYPTION", desc: "Every transaction node is secured via military-grade protocols." },
    { icon: Zap, title: "INSTANT DISPATCH", desc: "Automated distribution layer ensures 0-5 minute delivery." },
    { icon: Headphones, title: "ELITE SUPPORT", desc: "24/7 customer support and AI-assisted help." },
    { icon: CheckCircle2, title: "VERIFIED PROVIDER", desc: "Official direct-topup integration with Moonton, Garena & Riot." },
  ];

  return (
    <div className="py-12 border-t border-white/5 bg-primary/5 -mx-4 px-4 mt-8">
       <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-2">
             <h3 className="text-xl font-headline font-bold uppercase tracking-widest text-primary">Secure & Trusted</h3>
             <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Trusted by 50K+ Elite Operators</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
             {trustNodes.map((node, i) => (
               <div key={i} className="text-center space-y-4 group">
                  <div className="h-16 w-16 rounded-[2rem] bg-card border border-white/10 flex items-center justify-center mx-auto shadow-xl transition-all group-hover:border-primary group-hover:shadow-[0_0_20px_rgba(158,102,255,0.2)]">
                     <node.icon className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                  </div>
                  <div className="space-y-1">
                     <h4 className="text-xs font-bold text-white uppercase tracking-tight">{node.title}</h4>
                     <p className="text-[10px] text-muted-foreground font-medium leading-relaxed uppercase tracking-tighter opacity-60">{node.desc}</p>
                  </div>
               </div>
             ))}
          </div>
       </div>
    </div>
  );
}