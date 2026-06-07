"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Copy, Share2, Users, Wallet, TrendingUp, Loader2, Award, Zap, ShieldAlert, ShieldCheck, UserPlus, DollarSign, History, Send, MessageSquare, Star, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export default function ReferralPage() {
  const { profile, user, loading } = useAuth();
  const { toast } = useToast();
  const [referrals, setReferrals] = useState<any[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "referrals"),
        where("referrerId", "==", user.uid),
        orderBy("date", "desc")
      );
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setReferrals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingRefs(false);
      }, (err) => {
        const permissionError = new FirestorePermissionError({
          path: `referrals?referrerId=${user.uid}`,
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoadingRefs(false);
      });
      return () => unsubscribe();
    }
  }, [user]);

  const referralCode = profile?.referralCode || "---";
  const kycVerified = (profile as any)?.kycVerified || false;

  const copyToClipboard = () => {
    if (!profile) return;
    navigator.clipboard.writeText(referralCode);
    toast({
      title: "Protocol Copied",
      description: "Referral code stored in local buffer.",
    });
  };

  const shareToWhatsApp = () => {
    const text = `Join Aatma HUB for instant game top-ups and rewards! Use my referral code: ${referralCode} \nRegister here: ${window.location.origin}/signup`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareToTelegram = () => {
    const text = `Join Aatma HUB for instant game top-ups! Code: ${referralCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.origin + '/signup')}&text=${encodeURIComponent(text)}`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;

  const totalEarnings = (profile as any)?.totalReferralEarnings || 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            
            {/* Header Section */}
            <div className="glass-card p-12 md:p-20 rounded-[3rem] border-primary/20 text-center space-y-8 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10 rotate-12">
                 <Gift className="h-80 w-80 text-primary" />
               </div>
               <div className="relative z-10 space-y-4">
                 <div className="inline-flex items-center space-x-2 bg-primary/20 border border-primary/30 px-5 py-1.5 rounded-full text-primary text-xs font-bold mb-4 uppercase tracking-widest">
                   <Award className="h-4 w-4" />
                   <span>Squad Master Program</span>
                 </div>
                 <h1 className="text-5xl md:text-8xl font-headline font-bold tracking-tighter uppercase leading-none">
                   Recruit Your <span className="text-gradient">Squad</span>
                 </h1>
                 <p className="text-muted-foreground text-lg md:text-xl max-w-3xl mx-auto font-medium uppercase tracking-tight opacity-70">
                   Earn lifetime recurring commissions on every high-tier dispatch initiated by your squad recruits.
                 </p>
               </div>
               
               <div className="flex flex-col md:flex-row items-center justify-center gap-6 pt-8 max-w-xl mx-auto relative z-10">
                  <div className="relative w-full group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-3xl blur opacity-25 group-hover:opacity-40 transition-all" />
                    <Input 
                      value={referralCode} 
                      readOnly 
                      className="h-20 bg-card border-white/10 pl-8 pr-44 font-mono font-bold text-primary text-3xl tracking-[0.3em] text-center rounded-[1.5rem] relative z-10 uppercase"
                    />
                    <Button 
                      className="absolute right-2 top-2 h-16 px-10 font-bold text-lg rounded-[1.2rem] z-20 neon-glow" 
                      onClick={copyToClipboard}
                      disabled={!profile}
                    >
                      <Copy className="h-5 w-5 mr-3" />
                      Capture
                    </Button>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <StatCard 
                 label="Squad Members" 
                 value={referrals.length.toString()} 
                 subValue="Verified Recruits" 
                 icon={Users} 
                 color="text-blue-500" 
               />
               <StatCard 
                 label="Squad Master Yield" 
                 value={`₹${totalEarnings.toFixed(2)}`} 
                 subValue="Lifetime recurring" 
                 icon={DollarSign} 
                 color="text-green-500" 
               />
               <StatCard 
                 label="Squad Achievements" 
                 value={`${Math.floor(totalEarnings / 100)}`} 
                 subValue="Unlocks achieved" 
                 icon={Trophy} 
                 color="text-yellow-500" 
               />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               <div className="lg:col-span-8">
                  <Card className="bg-card/50 border-white/5 rounded-[2.5rem] overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 p-8 bg-white/5">
                      <CardTitle className="font-headline font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                        <UserPlus className="h-6 w-6 text-primary" />
                        Intelligence Recruitment Log
                      </CardTitle>
                      <Badge variant="outline" className="h-6 uppercase font-bold border-white/10 px-4 opacity-50">Live Sector Sync</Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-muted-foreground font-bold bg-black/20">
                              <th className="px-8 py-5">Recruit</th>
                              <th className="px-8 py-5">Deployment Date</th>
                              <th className="px-8 py-5">Status</th>
                              <th className="px-8 py-5 text-right">Yield</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {loadingRefs ? (
                              <tr><td colSpan={4} className="p-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></td></tr>
                            ) : referrals.length === 0 ? (
                              <tr><td colSpan={4} className="p-20 text-center py-32 opacity-20">
                                 <Users className="h-16 w-16 mx-auto mb-4" />
                                 <p className="text-[10px] font-bold uppercase tracking-widest">No squad signals detected</p>
                              </td></tr>
                            ) : (
                              referrals.map((ref) => (
                                <tr key={ref.id} className="hover:bg-white/5 transition-colors group">
                                  <td className="px-8 py-6">
                                    <div className="flex items-center space-x-4">
                                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 uppercase">
                                        {ref.username?.charAt(0) || 'U'}
                                      </div>
                                      <div>
                                        <p className="font-bold text-sm text-white uppercase tracking-tight">{ref.username || 'Elite Recruit'}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">ID: {ref.userId.substring(0, 8)}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-8 py-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                    {ref.date ? new Date(ref.date).toLocaleDateString() : 'Syncing...'}
                                  </td>
                                  <td className="px-8 py-6">
                                     <Badge className={`text-[9px] uppercase font-bold tracking-widest border-none px-3 ${ref.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'}`}>
                                       {ref.status}
                                     </Badge>
                                  </td>
                                  <td className="px-8 py-6 text-right">
                                     <span className="text-sm font-bold text-green-500 font-headline tracking-tighter">+₹{ref.earnings?.toFixed(2) || '0.00'}</span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <Card className="bg-primary/5 border-primary/20 rounded-[2rem] p-8 space-y-6">
                     <h3 className="font-headline font-bold uppercase text-lg text-primary flex items-center gap-3">
                        <Zap className="h-5 w-5" />
                        Yield Protocol
                     </h3>
                     <div className="space-y-6">
                        {[
                          { step: "01", title: "Deploy Link", desc: "Transmit your unique recruitment protocol to squads." },
                          { step: "02", title: "Recruitment", desc: "Members initialize their nodes using your protocol." },
                          { step: "03", title: "Yield Accumulation", desc: "Receive lifetime commission on all verified dispatches." },
                        ].map((item, i) => (
                          <div key={i} className="flex gap-4">
                             <span className="text-2xl font-headline font-bold text-white/20 italic">{item.step}</span>
                             <div className="space-y-1">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">{item.title}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight leading-relaxed">{item.desc}</p>
                             </div>
                          </div>
                        ))}
                     </div>
                  </Card>

                  <div className="bg-card border border-white/5 p-8 rounded-[2rem] text-center space-y-4">
                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transmit on Social Nodes</p>
                     <div className="flex flex-col gap-3">
                        <Button className="w-full h-14 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold uppercase tracking-widest text-xs" onClick={shareToWhatsApp}>
                          <MessageSquare className="mr-3 h-5 w-5" /> WhatsApp HQ
                        </Button>
                        <Button className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs" onClick={shareToTelegram}>
                          <Send className="mr-3 h-5 w-5" /> Telegram Cluster
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ label, value, subValue, icon: Icon, color }: { label: string, value: string, subValue: string, icon: any, color: string }) {
  return (
    <Card className="bg-card border-white/5 rounded-[2rem] overflow-hidden group hover:border-primary/40 transition-all">
      <CardContent className="p-8 flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className={`text-4xl font-headline font-bold ${color}`}>{value}</p>
          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">{subValue}</p>
        </div>
        <div className={`p-5 rounded-3xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
          <Icon className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );
}
