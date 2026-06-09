"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Crown, TrendingUp, Users, Loader2, Sparkles, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function LeaderboardPage() {
  const [topSpenders, setTopSpenders] = useState<any[]>([]);
  const [topReferrers, setTopReferrers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Top Spenders logic
    const qSpenders = query(
      collection(db, "users"),
      orderBy("lifetimeRechargeAmount", "desc"),
      limit(10)
    );

    // Top Referrers sorted by actual yields
    const qReferrers = query(
      collection(db, "users"),
      orderBy("totalReferralEarnings", "desc"),
      limit(10)
    );

    const unsubSpenders = onSnapshot(qSpenders, (snap) => {
      setTopSpenders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubReferrers = onSnapshot(qReferrers, (snap) => {
      setTopReferrers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => {
      unsubSpenders();
      unsubReferrers();
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center space-y-4 mb-12">
             <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                <Trophy className="h-10 w-10 text-primary" />
             </div>
             <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase">Global <span className="text-gradient">Leaderboard</span></h1>
             <p className="text-muted-foreground max-w-md mx-auto">The elite hall of fame. Compete with thousands of players for monthly rewards.</p>
          </div>

          <Tabs defaultValue="spenders" className="space-y-8">
            <div className="flex justify-center">
              <TabsList className="bg-card border border-white/5 h-14 p-1 rounded-2xl">
                <TabsTrigger value="spenders" className="px-8 rounded-xl font-bold uppercase tracking-widest text-xs">
                   <TrendingUp className="mr-2 h-4 w-4" /> Top Spenders
                </TabsTrigger>
                <TabsTrigger value="referrers" className="px-8 rounded-xl font-bold uppercase tracking-widest text-xs">
                   <Users className="mr-2 h-4 w-4" /> Squad Masters
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="spenders" className="animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 gap-4">
                  {loading ? (
                    <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>
                  ) : topSpenders.map((user, i) => (
                    <Card key={user.id} className={`bg-card/50 border-white/5 overflow-hidden group hover:border-primary/30 transition-all ${i < 3 ? 'border-primary/20' : ''}`}>
                       <CardContent className="p-4 md:p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-8 text-xl font-headline font-bold text-muted-foreground italic">
                                #{i + 1}
                             </div>
                             <div className="relative">
                                <Avatar className={`h-12 w-12 md:h-16 md:w-16 border-2 ${i === 0 ? 'border-yellow-500' : i === 1 ? 'border-gray-400' : i === 2 ? 'border-orange-500' : 'border-white/5'}`}>
                                   <AvatarImage src={`https://picsum.photos/seed/${user.id}/64/64`} />
                                   <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {i < 3 && (
                                  <div className="absolute -top-2 -right-2 h-6 w-6 bg-background rounded-full flex items-center justify-center border border-white/10 shadow-lg">
                                     <Crown className={`h-3 w-3 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                                  </div>
                                )}
                             </div>
                             <div>
                                <h3 className="font-bold text-lg md:text-xl">{user.firstName} {user.lastName}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                   <Badge variant="outline" className="text-[9px] uppercase font-bold border-primary/20 text-primary">
                                      {user.currentRank || 'Recruit'}
                                   </Badge>
                                   <span className="text-[10px] text-muted-foreground uppercase font-bold">Aatma Pro</span>
                                </div>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lifetime Spends</p>
                             <p className="text-xl md:text-2xl font-headline font-bold text-white">₹{user.lifetimeRechargeAmount?.toLocaleString() || '0'}</p>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </TabsContent>

            <TabsContent value="referrers" className="animate-in fade-in slide-in-from-bottom-4">
               <div className="grid grid-cols-1 gap-4">
                  {loading ? (
                    <div className="py-20 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" /></div>
                  ) : topReferrers.length === 0 ? (
                    <Card className="bg-primary/5 border-primary/20 p-12 text-center">
                       <Award className="h-16 w-16 text-primary mx-auto mb-4" />
                       <h2 className="text-2xl font-headline font-bold uppercase mb-2">Squad Leaderboard Resetting</h2>
                       <p className="text-muted-foreground">The Squad Master leaderboard is calculated at the end of each month based on verified referral recharges.</p>
                    </Card>
                  ) : topReferrers.map((user, i) => (
                    <Card key={user.id} className={`bg-card/50 border-white/5 overflow-hidden group hover:border-primary/30 transition-all ${i < 3 ? 'border-primary/20' : ''}`}>
                       <CardContent className="p-4 md:p-6 flex items-center justify-between">
                          <div className="flex items-center gap-6">
                             <div className="w-8 text-xl font-headline font-bold text-muted-foreground italic">
                                #{i + 1}
                             </div>
                             <Avatar className={`h-12 w-12 md:h-16 md:w-16 border-2 border-white/5`}>
                                <AvatarImage src={`https://picsum.photos/seed/ref-${user.id}/64/64`} />
                                <AvatarFallback>{user.firstName?.charAt(0)}</AvatarFallback>
                             </Avatar>
                             <div>
                                <h3 className="font-bold text-lg md:text-xl">{user.firstName}</h3>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Top Referrals</p>
                             </div>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Earnings</p>
                             <p className="text-xl md:text-2xl font-headline font-bold text-green-500">₹{user.totalReferralEarnings?.toLocaleString() || '0'}</p>
                          </div>
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </TabsContent>
          </Tabs>

          <div className="mt-20 glass-card p-8 rounded-[2rem] border-dashed border-white/10 text-center">
             <h3 className="text-2xl font-headline font-bold uppercase mb-4 flex items-center justify-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Monthly Rewards
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                {[
                  { prize: "₹10,000", for: "Rank #1 Spender", icon: Crown, color: "text-yellow-500" },
                  { prize: "₹5,000", for: "Top Referrer", icon: Medal, color: "text-primary" },
                  { prize: "Exclusive Badge", for: "Top 10 Global", icon: Trophy, color: "text-secondary" },
                ].map((p, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                     <p className={`text-2xl font-headline font-bold ${p.color}`}>{p.prize}</p>
                     <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{p.for}</p>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
