"use client";

import { Calendar, CheckCircle2, Gift, Loader2, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function DailyRewards() {
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleClaim = () => {
    setLoading(true);
    setTimeout(() => {
      setClaimed(true);
      setLoading(false);
      toast({ title: "Intelligence Captured", description: "5 Hub Points synced to your wallet." });
    }, 1500);
  };

  const days = [
    { day: 1, reward: 5, active: true, done: true },
    { day: 2, reward: 5, active: true, done: false },
    { day: 3, reward: 10, active: false, done: false },
    { day: 4, reward: 10, active: false, done: false },
    { day: 5, reward: 15, active: false, done: false },
    { day: 6, reward: 20, active: false, done: false },
    { day: 7, reward: 50, active: false, done: false, big: true },
  ];

  return (
    <Card className="bg-card/40 border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
       <div className="absolute top-0 right-0 p-8 opacity-5">
          <Calendar className="h-32 w-32" />
       </div>
       <CardHeader className="p-6 md:p-8 bg-white/5 border-b border-white/5">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 border border-yellow-500/20">
                   <Star className="h-5 w-5 fill-current" />
                </div>
                <div>
                   <CardTitle className="text-lg font-headline font-bold uppercase tracking-widest">Daily Yield</CardTitle>
                   <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Streak: 1 Day Active</p>
                </div>
             </div>
             <Badge className="bg-primary text-primary-foreground border-none font-bold uppercase text-[9px] px-3 h-5 tracking-widest">ACTIVE</Badge>
          </div>
       </CardHeader>
       <CardContent className="p-6 md:p-8 space-y-6 flex-1 relative z-10">
          <div className="grid grid-cols-7 gap-2">
             {days.map((d) => (
               <div key={d.day} className="text-center space-y-2">
                  <div className={`aspect-square rounded-xl md:rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    d.done ? 'bg-primary/20 border-primary/40 text-primary' : 
                    d.active ? 'bg-card border-primary/30 shadow-lg' : 'bg-black/20 border-white/5 opacity-40'
                  } ${d.big ? 'relative overflow-hidden' : ''}`}>
                     {d.done ? <CheckCircle2 className="h-4 w-4" /> : <span className="text-[10px] font-bold">₹{d.reward}</span>}
                     {d.big && <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />}
                  </div>
                  <p className="text-[8px] font-bold text-muted-foreground uppercase">D{d.day}</p>
               </div>
             ))}
          </div>

          <Button 
            className="w-full h-14 font-bold neon-glow text-base uppercase tracking-widest rounded-2xl transition-all" 
            disabled={claimed || loading}
            onClick={handleClaim}
          >
             {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : claimed ? "Protocol Finalized" : "Sync Reward (₹5)"}
          </Button>
       </CardContent>
    </Card>
  );
}