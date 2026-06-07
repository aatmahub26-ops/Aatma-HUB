
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Building2, Mail, Smartphone, Globe, Save, Loader2, ShieldCheck, BadgeCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function ResellerProfile() {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    website: "",
    gstNumber: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        businessName: profile.businessName || "",
        website: (profile as any).website || "",
        gstNumber: (profile as any).gstNumber || "",
        phone: (profile as any).phone || "",
        address: (profile as any).address || ""
      });
    }
  }, [profile]);

  const handleUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "users", user.uid), formData);
      toast({ title: "B2B Profile Updated", description: "Business credentials synchronized." });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Merchant Intelligence</h2>
        <p className="text-muted-foreground">Manage your corporate identity and tax registration data.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-card border-white/5">
              <CardContent className="p-8 flex flex-col items-center text-center">
                 <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 mb-6">
                    <Briefcase className="h-10 w-10 text-primary" />
                 </div>
                 <h3 className="text-2xl font-bold font-headline uppercase">{profile?.businessName}</h3>
                 <div className="flex items-center gap-2 mt-2">
                    <BadgeCheck className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{profile?.resellerLevel} Reseller</span>
                 </div>
                 <p className="text-[10px] text-muted-foreground font-mono mt-4 uppercase">ID: {user?.uid.substring(0, 16)}</p>
              </CardContent>
           </Card>

           <Card className="bg-primary/5 border-primary/20 border-dashed">
              <CardContent className="p-6">
                 <div className="flex items-center gap-2 text-primary mb-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Compliance Status</span>
                 </div>
                 <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold">
                    Your account is currently in {profile?.resellerStatus} status. Ensure GST and Address match your KYC documents to avoid service suspension.
                 </p>
              </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-8">
           <Card className="bg-card border-white/5">
              <CardHeader className="bg-white/5 border-b border-white/5">
                 <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">B2B Profile Node</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Entity Name</Label>
                       <Input value={formData.businessName} onChange={(e) => setFormData({...formData, businessName: e.target.value})} className="h-12 bg-black/40 border-white/10" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">GST Registration Number</Label>
                       <Input value={formData.gstNumber} onChange={(e) => setFormData({...formData, gstNumber: e.target.value})} placeholder="e.g. 07AAAAA0000A1Z5" className="h-12 bg-black/40 border-white/10 font-mono uppercase" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Official Website</Label>
                       <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://yourbusiness.com" className="h-12 bg-black/40 border-white/10" />
                    </div>
                    <div className="space-y-2">
                       <Label className="text-[10px] uppercase font-bold text-muted-foreground">Support Hotline</Label>
                       <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 XXXXXXXXXX" className="h-12 bg-black/40 border-white/10" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold text-muted-foreground">Registered Business Address</Label>
                    <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="h-12 bg-black/40 border-white/10" />
                 </div>
                 <Button className="w-full h-14 font-bold neon-glow text-lg uppercase tracking-tighter" onClick={handleUpdate} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                    Synchronize Business Identity
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
