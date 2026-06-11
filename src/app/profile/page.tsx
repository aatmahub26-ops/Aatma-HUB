"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User, Mail, Smartphone, MapPin, Save, LogOut, Loader2, Award, Zap, Gift, ShieldCheck, ArrowRight, Swords, Star, Crown, ShieldAlert, Users, Coins, Trophy } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { doc, updateDoc, serverTimestamp, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { getUserRank, getRankProgress, RANKS } from "@/lib/ranks";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function ProfilePage() {
  const { user, profile, loading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        phone: (profile as any).phone || "",
        location: (profile as any).location || ""
      });
    }
  }, [profile]);

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  const lifetimeAmount = profile?.lifetimeRechargeAmount || 0;
  const currentRank = getUserRank(lifetimeAmount);

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      toast({ title: "Success", description: "Player Credentials synchronized." });
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-8 animate-in fade-in duration-500 pb-20">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Side: Identity & Ranks */}
              <div className="lg:col-span-4 space-y-6">
                 <Card className="bg-card/50 border-white/5 overflow-hidden">
                    <CardContent className="p-8 flex flex-col items-center">
                       <div className="relative group">
                          <Avatar className="h-32 w-32 border-4 border-primary/20 group-hover:border-primary transition-all duration-500">
                             <AvatarImage src={`https://picsum.photos/seed/${user.uid}/128/128`} />
                             <AvatarFallback className="text-4xl font-bold bg-muted">
                                {profile?.firstName?.charAt(0)}
                             </AvatarFallback>
                          </Avatar>
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping opacity-20 pointer-events-none" />
                          <button className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform">
                             <Camera className="h-4 w-4" />
                          </button>
                       </div>
                       <div className="text-center mt-6 space-y-2">
                          <h3 className="text-2xl font-bold font-headline uppercase tracking-tight">{profile?.firstName} {profile?.lastName}</h3>
                          <div className="flex flex-col items-center gap-2">
                             <div className="flex items-center gap-2">
                                <Badge className={`${currentRank.color.replace('text-', 'bg-')}/10 ${currentRank.color} border-none font-bold uppercase text-[10px] tracking-widest px-4 py-1`}>
                                   {currentRank.tier}
                                </Badge>
                                <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 text-[9px] font-black tracking-widest uppercase">
                                   VIP {currentRank.vipTier}
                                </Badge>
                             </div>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter mt-4 opacity-50">UUID: {user.uid.substring(0, 16)}</p>
                       </div>
                    </CardContent>
                 </Card>

                 <div className="grid grid-cols-2 gap-4">
                 </div>



                 <Card className="bg-card border-white/5">
                    <CardHeader className="border-b border-white/5 bg-white/5">
                       <CardTitle className="font-headline font-bold text-lg uppercase tracking-widest">Quick Actions</CardTitle>
                       <CardDescription>Synchronize your identity across the global distribution layer.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <Label className="text-[10px] uppercase font-bold tracking-widest">Given Name</Label>
                             <Input 
                                value={formData.firstName}
                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                className="bg-black/40 border-white/10 h-12 font-bold"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] uppercase font-bold tracking-widest">Surname</Label>
                             <Input 
                                value={formData.lastName}
                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                className="bg-black/40 border-white/10 h-12 font-bold"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] uppercase font-bold tracking-widest">Communications Node</Label>
                             <Input 
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                placeholder="+91 XXXXXXXXXX"
                                className="bg-black/40 border-white/10 h-12 font-bold"
                             />
                          </div>
                          <div className="space-y-2">
                             <Label className="text-[10px] uppercase font-bold tracking-widest">Deployment Sector</Label>
                             <Input 
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                placeholder="e.g. New Delhi, IN"
                                className="bg-black/40 border-white/10 h-12 font-bold"
                             />
                          </div>
                       </div>

                       <Button onClick={handleUpdate} disabled={isSaving} className="w-full h-14 font-bold neon-glow-hover text-lg uppercase tracking-tighter">
                          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : "Commit Identity Sync"}
                       </Button>
                    </CardContent>
                 </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatsCard({ label, value, icon: Icon, color }: { label: string, value: any, icon: any, color: string }) {
  return (
    <Card className="bg-white/5 border-white/10 p-4">
       <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-white/5 ${color}`}>
             <Icon className="h-4 w-4" />
          </div>
          <div className="overflow-hidden">
             <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest truncate">{label}</p>
             <p className="text-sm font-headline font-bold text-white uppercase truncate">{value}</p>
            </div>
         </div>
      </Card>
   );
}
