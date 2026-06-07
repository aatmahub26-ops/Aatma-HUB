"use client";

import Link from "next/link";
import { Gamepad2, Twitter, Instagram, Youtube, Mail, ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-background/50 pt-8 pb-6">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded-lg shadow-lg">
                <Gamepad2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-headline text-xl font-bold tracking-tighter text-white uppercase">
                AATMA <span className="text-primary">HUB</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-xs leading-relaxed max-w-sm font-medium opacity-80">
              Premium gaming top-ups and digital asset distribution. Join the elite community of gamers for instant dispatches and exclusive rewards.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Instagram, href: "https://instagram.com/aatma_hub" },
                { icon: Twitter, href: "#" },
                { icon: Youtube, href: "#" },
                { icon: Mail, href: "mailto:aatmahub26@gmail.com" }
              ].map((social, i) => (
                <Link key={i} href={social.href} target="_blank" className="p-2 bg-white/5 rounded-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 border border-white/5 group">
                  <social.icon className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </Link>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-white uppercase tracking-widest text-[10px] opacity-60">Marketplace</h3>
              <ul className="space-y-2">
                <li><Link href="/catalog" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Games Portal</Link></li>
                <li><Link href="/catalog?category=OTT" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Digital OTT</Link></li>
                <li><Link href="/catalog?category=Gift" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Gift Cards</Link></li>
                <li><Link href="/tools/mlbb" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Pro Tools</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="font-headline font-bold text-white uppercase tracking-widest text-[10px] opacity-60">Squad Hub</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">My Dashboard</Link></li>
                <li><Link href="/referral" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Recruit Squad</Link></li>
                <li><Link href="/leaderboard" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Leaderboards</Link></li>
                <li><Link href="/community" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Community</Link></li>
              </ul>
            </div>
            <div className="space-y-4 hidden sm:block">
              <h3 className="font-headline font-bold text-white uppercase tracking-widest text-[10px] opacity-60">Information</h3>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">About Mission</Link></li>
                <li><Link href="/privacy" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Privacy Node</Link></li>
                <li><Link href="/terms" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">Terms Hub</Link></li>
                <li><Link href="/support" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">HQ Support</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest text-center opacity-60">
            © {new Date().getFullYear()} Aatma HUB Ecosystem. All dispatches secured via AES-256 Protocol.
          </p>
          <div className="flex items-center space-x-6 opacity-30 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
            <span className="text-[9px] font-bold font-headline tracking-widest uppercase">UPI</span>
            <span className="text-[9px] font-bold font-headline tracking-widest uppercase">Razorpay</span>
            <span className="text-[9px] font-bold font-headline tracking-widest uppercase">PhonePe</span>
            <div className="flex items-center gap-1">
               <ShieldCheck className="h-3 w-3" />
               <span className="text-[9px] font-bold font-headline tracking-widest uppercase">SSL</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
