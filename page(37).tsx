"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Badge } from "@/components/ui/badge";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4 max-w-4xl">
           <div className="text-center mb-12 space-y-4">
              <Badge className="bg-primary/20 text-primary border-none px-4 py-1 uppercase font-bold tracking-widest">Encryption Protocol</Badge>
              <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-none">Privacy <span className="text-gradient">Policy</span></h1>
           </div>

           <div className="glass-card p-8 md:p-12 rounded-[3rem] border-white/5 space-y-12 text-muted-foreground leading-relaxed">
              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Data Collection Node</h2>
                 <p>We collect essential player data (Email, Game IDs) required for fulfillment protocols. All sensitive identity documents submitted via the KYC center are stored in an AES-256 encrypted vault.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Intelligence Usage</h2>
                 <p>Your data is used solely to route dispatches, manage squad rewards, and provide AI-driven customer support. We do not sell player intelligence to third-party data brokers.</p>
              </section>

              <section className="space-y-4">
                 <h2 className="text-2xl font-headline font-bold text-white uppercase tracking-tight">Cookie Protocol</h2>
                 <p>The platform utilizes session cookies to maintain your login matrix and local language preferences. These are stored on your local hardware node and can be purged via browser settings.</p>
              </section>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
