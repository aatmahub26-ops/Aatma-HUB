"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShieldCheck, Zap, Users, Headphones, Gift, Smartphone, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AboutPage() {
  const values = [
    { icon: Zap, title: "Fast Top-Up Delivery", desc: "Our automated system ensures your game currency is delivered within seconds." },
    { icon: ShieldCheck, title: "Secure Transactions", desc: "Industry-standard encryption for 100% safe payments via UPI and major cards." },
    { icon: Users, title: "Trusted Gaming Platform", desc: "A growing community of thousands of elite players across India." },
    { icon: Headphones, title: "Dedicated Support", desc: "24/7 assistance through WhatsApp, Phone, and Email." },
    { icon: Gift, title: "Affiliate Rewards", desc: "Earn recurring commissions by inviting your squad to the HUB." },
    { icon: BookOpen, title: "Pro Gaming Intel", desc: "Latest news, guides, and meta updates from the esports scene." },
    { icon: Smartphone, title: "Mobile Friendly", desc: "Seamless experience optimized for gamers on the go." },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-primary/5 blur-[120px] rounded-full -z-10" />
          <div className="container mx-auto px-4 text-center space-y-6">
            <Badge className="bg-primary/20 text-primary border-none font-bold uppercase tracking-widest px-4 py-1">The Aatma Mission</Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-none">About <span className="text-gradient">Aatma HUB</span></h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Welcome to Aatma HUB, your trusted destination for fast, secure, and affordable gaming top-ups.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white/5 border-y border-white/5">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="prose prose-invert max-w-none space-y-8 text-lg text-muted-foreground leading-relaxed">
              <p>
                Aatma HUB was created for gamers who want a simple and reliable way to recharge their favorite games. We provide top-ups, gaming services, rewards, affiliate programs, and a growing gaming community for players across India.
              </p>
              <p>
                Our mission is to deliver instant gaming credits, secure transactions, excellent customer support, and the best value for gamers. We bridge the gap between players and their ultimate gaming potential.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-headline font-bold uppercase text-center mb-16">Why Choose <span className="text-primary">Aatma</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((v, i) => (
                <div key={i} className="glass-card p-8 rounded-3xl hover:bg-card transition-all group">
                  <v.icon className="h-8 w-8 text-primary mb-6 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 bg-primary/5">
           <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl font-headline font-bold uppercase mb-8">Supported <span className="text-primary">Titles</span></h2>
              <div className="flex flex-wrap justify-center gap-4 text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">
                 <span>MLBB</span> • <span>BGMI</span> • <span>Free Fire</span> • <span>Free Fire MAX</span> • <span>PUBG Mobile</span> • <span>COD Mobile</span> • <span>FC Mobile</span> • <span>Genshin Impact</span>
              </div>
           </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
