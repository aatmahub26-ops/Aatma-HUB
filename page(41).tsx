"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="text-center mb-12 space-y-4">
              <Badge className="bg-destructive/20 text-destructive border-none px-4 py-1 uppercase font-bold tracking-widest">Reversal Logic</Badge>
              <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-none">Refund <span className="text-destructive">Policy</span></h1>
           </div>

           <div className="glass-card p-8 md:p-12 rounded-[3rem] border-white/5 space-y-12 text-muted-foreground leading-relaxed">
              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">1. Non-Reversible Dispatches</h2>
                 <p>Due to the nature of digital assets, completed dispatches where the intelligence has been successfully transmitted to the provided ID are non-refundable. Verify your target ID before initializing checkout.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">2. Failed Protocols</h2>
                 <p>If a dispatch fails due to internal node errors or provider timeout, the full yield will be credited back to your Hub Wallet instantly or within 24 hours.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">3. Erroneous Inputs</h2>
                 <p>If a player provides an incorrect Game ID and the dispatch is successful, Aatma HUB is not liable for the lost asset. We cannot retrieve digital currency once it has left our distribution node.</p>
              </section>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
