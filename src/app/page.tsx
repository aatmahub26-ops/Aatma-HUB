
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FeaturedGames } from "@/components/home/FeaturedGames";
import { BannerSlider } from "@/components/home/BannerSlider";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { QuickActions } from "@/components/home/QuickActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Search, Zap, Flame, Gamepad2, Tv, CreditCard, ChevronRight, Smartphone, Swords, Trophy, ShieldCheck, Globe, Target } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/catalog?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1">
        
        <BannerSlider />
        <WhyChooseUs />

        <section className="py-1 relative">
           <div className="container mx-auto px-4">
              <div className="max-w-4xl mx-auto space-y-2">
                 <QuickActions />

                 <div className="relative group">
                    <div className="relative flex items-center bg-card/80 backdrop-blur-3xl border border-white/10 focus-within:border-primary/50 transition-all shadow-2xl p-0.5 rounded-xl">
                       <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          <Input 
                            placeholder="Search Games or Services..." 
                            className="h-9 pl-10 bg-transparent border-none text-xs font-bold rounded-lg focus-visible:ring-0 placeholder:text-white/20 text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                          />
                       </div>
                       <Button onClick={handleSearch} className="h-9 px-4 rounded-lg font-bold uppercase tracking-widest neon-glow hidden md:flex bg-primary text-white text-[10px]">
                          Search
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
        </section>

        <div className="container mx-auto px-4 py-1 space-y-6">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
<MarketplaceSection title="All Products" icon={Globe} category="MOBILE GAMES" badge="GAMES" accentColor="text-blue-400" />


              </div>
              
              <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
                 <LiveActivityFeed />
                 <div className="bg-card border border-white/10 p-4 rounded-2xl shadow-2xl space-y-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                       <Zap className="h-24 w-24 text-primary" />
                    </div>
                    <div className="flex items-center gap-2.5 relative z-10">
                       <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20 shadow-lg"><Zap className="h-3.5 w-3.5" /></div>
                       <div>
                          <h4 className="font-headline font-bold text-white uppercase tracking-widest text-[9px] leading-none">Aatma HUB</h4>
                          <p className="text-[7px] font-bold text-green-500 uppercase tracking-widest mt-1 flex items-center gap-1">
                             <span className="h-1 rounded-full w-1 bg-green-500 animate-pulse" />
                             Operational
                          </p>
                       </div>
                    </div>
                    <p className="text-[8px] text-muted-foreground leading-relaxed uppercase font-bold tracking-tight relative z-10 opacity-70">
                       Automated dispatches operating at 99.9% efficiency.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MarketplaceSection({ title, icon: Icon, category, badge, accentColor }: { title: string, icon: any, category: string, badge: string, accentColor: string }) {
  return (
    <div className="space-y-1.5 animate-in fade-in duration-500">
       <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 overflow-hidden">
             <div className={`h-7 w-7 rounded-lg bg-card/60 flex items-center justify-center border border-white/5 group shadow-md shrink-0`}>
                <Icon className={`h-3.5 w-3.5 ${accentColor} transition-transform group-hover:scale-110`} />
             </div>
             <div className="overflow-hidden">
                <div className="flex items-center gap-1.5 overflow-hidden">
                   <h3 className="section-title text-[11px] md:text-lg whitespace-nowrap">{title}</h3>
                   <Badge className={`text-[6px] font-black uppercase border-none ${accentColor} bg-white/5 px-1.5 h-3 tracking-widest whitespace-nowrap overflow-hidden text-ellipsis`}>{badge}</Badge>
                </div>
                <p className="text-[6px] text-muted-foreground uppercase font-black tracking-[0.2em] mt-0.5 opacity-50 whitespace-nowrap overflow-hidden text-ellipsis">SECTOR::{category.replace(/\s+/g, '_')}</p>
             </div>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-[7px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary group bg-white/5 px-2 rounded-lg h-6 border border-white/5 shrink-0">
             <Link href={`/catalog?category=${category}`} className="flex items-center">
                All <ChevronRight className="ml-0.5 h-2 w-2 group-hover:translate-x-0.5 transition-transform" />
             </Link>
          </Button>
       </div>
       <FeaturedGames category={category} />
    </div>
  );
}
