"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="text-center mb-12 space-y-4">
              <Badge className="bg-primary/20 text-primary border-none px-4 py-1 uppercase font-bold tracking-widest">Platform Protocol</Badge>
              <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-none">Terms of <span className="text-gradient">Service</span></h1>
           </div>

           <div className="glass-card p-8 md:p-12 rounded-[3rem] border-white/5 space-y-12 text-muted-foreground leading-relaxed">
              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">1. Acceptance of Terms</h2>
                 <p>By accessing Aatma HUB (the "Platform"), you agree to abide by these Terms of Service. If you do not agree to any part of these terms, you must terminate your session and cease all dispatch protocols immediately.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">2. Digital Asset Dispatch</h2>
                 <p>Aatma HUB provides digital asset top-up services for various gaming and OTT platforms. All dispatches are finalized once the intelligence node confirms successful transmission. Users are responsible for providing 100% correct Player IDs and Zone IDs.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">3. Wallet & Liquidity</h2>
                 <p>Funds deposited into the Aatma Wallet are for the sole purpose of marketplace transactions. Manual UPI deposits require UTR verification by the Aatma HQ squad, which may take up to 30 minutes during operational hours.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">4. Prohibited Intelligence</h2>
                 <p>Any attempt to manipulate the referral yield system, forge UTR payloads, or exploit AI Assistant vulnerabilities will result in permanent account termination and forfeiture of all digital liquidity.</p>
              </section>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
