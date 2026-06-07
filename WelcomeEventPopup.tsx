
"use client";

import { useState, useEffect } from "react";
import { 
  X, Zap, Gift, Trophy, Star, 
  CheckCircle2, Flame, Loader2, 
  ArrowRight, Sparkles, MessageSquare,
  Smartphone, ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export function WelcomeEventPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. Fetch Admin Settings
    const unsub = onSnapshot(doc(db, "system_settings", "marketing_popup"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data());
      }
    });

    // 2. Display Logic Protocol
    const checkVisibility = () => {
      const isLoginTriggered = sessionStorage.getItem("show_welcome_popup") === "true";
      const isSnoozed = localStorage.getItem("welcome_popup_24h");
      
      if (isLoginTriggered) {
        if (isSnoozed) {
          const snoozeDate = new Date(isSnoozed);
          const now = new Date();
          const diffHours = (now.getTime() - snoozeDate.getTime()) / (1000 * 60 * 60);
          if (diffHours < 24) return;
        }
        
        // Show after a small delay for animation smoothness
        setTimeout(() => setIsOpen(true), 1500);
        sessionStorage.removeItem("show_welcome_popup");
      }
    };

    if (user) checkVisibility();

    return () => unsub();
  }, [user]);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem("welcome_popup_24h", new Date().toISOString());
    }
    setIsOpen(false);
  };

  const handleExplore = () => {
    handleClose();
    router.push("/catalog");
  };

  if (!settings || !settings.isEnabled) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl bg-[#080808] border-primary/20 rounded-[2.5rem] p-0 overflow-hidden shadow-[0_0_50px_rgba(158,107,255,0.2)]">
        <button 
          onClick={handleClose}
          className="absolute right-6 top-6 z-50 p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="h-5 w-5 text-white" />
        </button>

        <div className="relative">
          {/* Header Banner */}
          <div className="bg-gradient-to-br from-[#9E6BFF]/20 to-transparent p-10 pt-12 text-center space-y-3 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 rotate-12">
                <Sparkles className="h-40 w-40 text-primary" />
             </div>
             <Badge className="bg-primary/20 text-primary border-none px-4 py-1 uppercase font-bold tracking-widest animate-pulse">EVENT LIVE</Badge>
             <DialogTitle className="text-3xl md:text-4xl font-headline font-bold text-white uppercase tracking-tighter leading-none">
                🎉 Welcome to <span className="text-primary">Aatma HUB</span>
             </DialogTitle>
             <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest opacity-60">
                India's Gaming & Digital Services Marketplace
             </p>
          </div>

          <ScrollArea className="h-[60vh] px-8 pb-8">
             <div className="space-y-8 py-2">
                
                {/* Section 1: Flash Deals */}
                <div className="space-y-4">
                   <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                      <Zap className="h-4 w-4 fill-current" />
                      Flash Dispatch Deals
                   </h3>
                   <div className="grid grid-cols-2 gap-3">
                      {settings.flashDeals?.map((deal: any, i: number) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-2xl group hover:border-primary/30 transition-all">
                           <p className="text-[10px] font-bold text-white uppercase truncate">{deal.title}</p>
                           <p className="text-[12px] font-headline font-bold text-primary mt-1">{deal.price}</p>
                           <div className="flex items-center gap-1 mt-2">
                              <span className="h-1 w-1 rounded-full bg-destructive animate-pulse" />
                              <span className="text-[8px] font-bold text-destructive uppercase tracking-tighter">Ends Soon</span>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Section 2: Special Offers */}
                <div className="space-y-4">
                   <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-secondary flex items-center gap-2">
                      <Gift className="h-4 w-4" />
                      Special Intelligence
                   </h3>
                   <div className="space-y-3">
                      {settings.offers?.map((offer: any, i: number) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
                           <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center text-secondary">
                              <Star className="h-5 w-5" />
                           </div>
                           <div>
                              <p className="text-xs font-bold text-white uppercase">{offer.title}</p>
                              <p className="text-[9px] text-muted-foreground uppercase font-medium">{offer.desc}</p>
                           </div>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Section 3: Live Events */}
                <div className="space-y-4">
                   <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-orange-500 flex items-center gap-2">
                      <Flame className="h-4 w-4" />
                      Live Ecosystem Events
                   </h3>
                   <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4">
                      {settings.events?.map((ev: any, i: number) => (
                        <div key={i} className="flex items-center justify-between group cursor-pointer">
                           <div className="flex items-center gap-3">
                              <div className="h-1.5 w-1.5 rounded-full bg-orange-500 group-hover:scale-150 transition-transform" />
                              <p className="text-[11px] font-bold text-white uppercase tracking-tight">{ev.name}</p>
                           </div>
                           <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      ))}
                   </div>
                </div>

                {/* Section 4: Recharge Tasks */}
                <div className="space-y-4">
                   <h3 className="text-xs font-headline font-bold uppercase tracking-widest text-green-500 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Player Onboarding Tasks
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                      {settings.tasks?.map((t: any, i: number) => (
                        <div key={i} className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-1">
                           <p className="text-[9px] font-bold text-primary uppercase">{t.status || 'Pending'}</p>
                           <p className="text-[10px] font-bold text-white uppercase leading-tight">{t.label}</p>
                        </div>
                      ))}
                   </div>
                </div>

                {/* Section 5: Daily Rewards Preview */}
                <div className="p-6 rounded-3xl bg-gradient-to-r from-primary/10 to-transparent border border-primary/20 flex items-center justify-between">
                   <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center neon-glow">
                         <Zap className="h-6 w-6 text-white fill-current" />
                      </div>
                      <div>
                         <p className="text-xs font-bold text-white uppercase">Daily Login Reward</p>
                         <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Protocol Reset in 8h</p>
                      </div>
                   </div>
                   <Badge className="bg-primary text-white font-bold uppercase text-[9px] px-3">READY</Badge>
                </div>

             </div>
          </ScrollArea>

          {/* Action Layer */}
          <div className="p-8 bg-black/80 border-t border-white/5 space-y-6">
             <div className="flex flex-col md:flex-row gap-3">
                <Button 
                  className="flex-1 h-14 text-lg font-bold neon-glow uppercase tracking-tighter rounded-2xl"
                  onClick={handleExplore}
                >
                   🚀 Explore Now
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-14 font-bold uppercase tracking-widest text-[10px] text-muted-foreground hover:text-white"
                  onClick={handleClose}
                >
                   Maybe Later
                </Button>
             </div>
             
             <div className="flex items-center justify-center space-x-2">
                <Checkbox 
                  id="dont-show" 
                  checked={dontShowAgain} 
                  onCheckedChange={(v: boolean) => setDontShowAgain(v)}
                  className="border-white/20"
                />
                <label 
                  htmlFor="dont-show" 
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest cursor-pointer hover:text-white transition-colors"
                >
                   Don't show again for 24 hours
                </label>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
