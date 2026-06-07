
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings2, Save, Loader2, ShieldCheck, Zap, Percent, Wallet, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";

export default function ResellerSettings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    minWithdrawal: 1000,
    baseCommission: 1,
    autoApprove: false,
    registrationFee: 0,
    resellerManualMarkup: 2
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system_settings", "reseller_program"), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as any);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "system_settings", "reseller_program"), {
        ...settings,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Protocol Synchronized", description: "B2B Program settings updated globally." });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">B2B Program Governance</h2>
        <p className="text-muted-foreground">Manage corporate distribution logic, commission rates, and compliance nodes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <Card className="bg-card border-white/5">
            <CardHeader className="bg-white/5 border-b border-white/5">
               <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                  <Percent className="h-4 w-4 text-primary" />
                  Yield Architecture
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase font-bold tracking-widest">Base Reseller Commission (%)</Label>
                     <Input type="number" className="h-12 bg-black/40 border-white/10" value={settings.baseCommission} onChange={(e) => setSettings({...settings, baseCommission: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase font-bold tracking-widest">Minimum Withdrawal Threshold (₹)</Label>
                     <Input type="number" className="h-12 bg-black/40 border-white/10" value={settings.minWithdrawal} onChange={(e) => setSettings({...settings, minWithdrawal: parseFloat(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] uppercase font-bold tracking-widest">Enrollment Node Fee (₹)</Label>
                     <Input type="number" className="h-12 bg-black/40 border-white/10" value={settings.registrationFee} onChange={(e) => setSettings({...settings, registrationFee: parseFloat(e.target.value)})} />
                  </div>
               </div>
            </CardContent>
         </Card>

         <Card className="bg-card border-white/5">
            <CardHeader className="bg-white/5 border-b border-white/5">
               <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  Compliance & Automation
               </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
               <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="space-y-1">
                     <p className="text-xs font-bold uppercase text-white">Auto-Authorize Partners</p>
                     <p className="text-[10px] text-muted-foreground uppercase font-bold">Skip manual application review</p>
                  </div>
                  <Switch checked={settings.autoApprove} onCheckedChange={(v) => setSettings({...settings, autoApprove: v})} />
               </div>

               <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                  <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="text-[10px] font-bold text-white uppercase tracking-widest">Protocol Intelligence</p>
                     <p className="text-[9px] text-muted-foreground leading-relaxed uppercase font-bold">
                        Changes to commission rates apply to all new dispatches instantly. Lifetime volumes are recalculated at the start of every sync cycle.
                     </p>
                  </div>
               </div>
            </CardContent>
         </Card>
      </div>

      <Button className="w-full h-16 font-bold neon-glow text-xl uppercase tracking-tighter" onClick={handleSave} disabled={isSaving}>
         {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : <Save className="h-6 w-6 mr-3" />}
         Commit Program Configuration
      </Button>
    </div>
  );
}
