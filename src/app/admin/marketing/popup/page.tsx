
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, Save, Loader2, Plus, 
  Trash2, Megaphone, Sparkles, 
  Flame, Gift, ListChecks 
} from "lucide-react";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function PopupManager() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const [config, setConfig] = useState({
    isEnabled: true,
    flashDeals: [] as any[],
    offers: [] as any[],
    events: [] as any[],
    tasks: [] as any[],
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system_settings", "marketing_popup"), (docSnap) => {
      if (docSnap.exists()) {
        setConfig(docSnap.data() as any);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await setDoc(doc(db, "system_settings", "marketing_popup"), {
        ...config,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Settings Saved", description: "Welcome popup configuration updated globally." });
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const addItem = (key: keyof typeof config, template: any) => {
    setConfig({ ...config, [key]: [...config[key] as any[], template] });
  };

  const removeItem = (key: keyof typeof config, index: number) => {
    const items = [...config[key] as any[]];
    items.splice(index, 1);
    setConfig({ ...config, [key]: items });
  };

  const updateItem = (key: keyof typeof config, index: number, field: string, value: any) => {
    const items = [...config[key] as any[]];
    items[index] = { ...items[index], [field]: value };
    setConfig({ ...config, [key]: items });
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Popup Management</h2>
          <p className="text-muted-foreground">Manage the Welcome Event sequence for the Aatma HUB ecosystem.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
           <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Master Toggle</Label>
           <Switch checked={config.isEnabled} onCheckedChange={(v) => setConfig({...config, isEnabled: v})} />
        </div>
      </div>

      <Tabs defaultValue="deals" className="space-y-8">
        <TabsList className="bg-card border border-white/5 h-14 p-1 rounded-2xl overflow-x-auto scrollbar-hide">
           <TabsTrigger value="deals" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
             <Zap className="h-3 w-3" /> Flash Deals
           </TabsTrigger>
           <TabsTrigger value="offers" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
             <Gift className="h-3 w-3" /> Special Offers
           </TabsTrigger>
           <TabsTrigger value="events" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
             <Flame className="h-3 w-3" /> Live Events
           </TabsTrigger>
           <TabsTrigger value="tasks" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
             <ListChecks className="h-3 w-3" /> Player Tasks
           </TabsTrigger>
        </TabsList>

        <TabsContent value="deals" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {config.flashDeals?.map((deal, idx) => (
                <Card key={idx} className="bg-card border-white/5 p-6 space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Deal Title</Label>
                      <Input value={deal.title} onChange={(e) => updateItem('flashDeals', idx, 'title', e.target.value)} className="h-10" />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Offer Price</Label>
                      <Input value={deal.price} onChange={(e) => updateItem('flashDeals', idx, 'price', e.target.value)} className="h-10" />
                   </div>
                   <Button variant="destructive" size="sm" className="w-full h-9 uppercase font-bold text-[9px]" onClick={() => removeItem('flashDeals', idx)}>
                      <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Offer
                   </Button>
                </Card>
              ))}
              <Button 
                variant="outline" 
                className="h-full min-h-[160px] border-dashed border-white/10 bg-white/5 flex flex-col gap-3 rounded-2xl"
                onClick={() => addItem('flashDeals', { title: "New Deal", price: "₹00.00" })}
              >
                <Plus className="h-8 w-8 text-muted-foreground" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Add Flash Deal</span>
              </Button>
           </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
           <div className="space-y-4">
              {config.offers?.map((off, idx) => (
                <div key={idx} className="flex gap-4 items-end bg-card p-6 rounded-2xl border border-white/5">
                   <div className="flex-1 space-y-2">
                      <Label className="text-[10px] uppercase font-bold">Offer Headline</Label>
                      <Input value={off.title} onChange={(e) => updateItem('offers', idx, 'title', e.target.value)} />
                   </div>
                   <div className="flex-[2] space-y-2">
                      <Label className="text-[10px] uppercase font-bold">Reward Description</Label>
                      <Input value={off.desc} onChange={(e) => updateItem('offers', idx, 'desc', e.target.value)} />
                   </div>
                   <Button variant="destructive" size="icon" className="h-10 w-10 shrink-0" onClick={() => removeItem('offers', idx)}>
                      <Trash2 className="h-4 w-4" />
                   </Button>
                </div>
              ))}
              <Button onClick={() => addItem('offers', { title: "Bonus Title", desc: "Description here" })} className="w-full h-12 bg-white/5 border border-white/10 font-bold uppercase text-xs">
                 <Plus className="mr-2 h-4 w-4" /> Add Special Offer
              </Button>
           </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {config.events?.map((ev, idx) => (
                 <div key={idx} className="flex gap-4 items-center bg-card p-4 rounded-2xl border border-white/5">
                    <Flame className="h-5 w-5 text-orange-500" />
                    <Input value={ev.name} onChange={(e) => updateItem('events', idx, 'name', e.target.value)} className="h-10 flex-1" />
                    <Button variant="ghost" size="icon" onClick={() => removeItem('events', idx)} className="text-destructive"><X className="h-4 w-4" /></Button>
                 </div>
              ))}
              <Button variant="outline" onClick={() => addItem('events', { name: "New Gaming Event" })} className="h-12 border-dashed font-bold uppercase text-[10px]">
                 <Plus className="mr-2 h-3 w-3" /> Add Event Line
              </Button>
           </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {config.tasks?.map((t, idx) => (
                <div key={idx} className="bg-card p-6 rounded-2xl border border-white/5 space-y-4">
                   <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold">Task Label</Label>
                      <Input value={t.label} onChange={(e) => updateItem('tasks', idx, 'label', e.target.value)} />
                   </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold">Initial Status</Label>
                      <Input value={t.status} onChange={(e) => updateItem('tasks', idx, 'status', e.target.value)} placeholder="Pending / Active" />
                   </div>
                   <Button variant="ghost" onClick={() => removeItem('tasks', idx)} className="w-full text-destructive text-[10px] uppercase font-bold">Remove Task</Button>
                </div>
              ))}
              <Button variant="outline" onClick={() => addItem('tasks', { label: "Verification Task", status: "Pending" })} className="h-full min-h-[100px] border-dashed uppercase font-bold text-[10px]">
                 <Plus className="mr-2 h-4 w-4" /> Add Task
              </Button>
           </div>
        </TabsContent>
      </Tabs>

      <Button className="w-full h-16 font-bold neon-glow text-xl uppercase tracking-tighter" onClick={handleSave} disabled={isSaving}>
         {isSaving ? <Loader2 className="h-6 w-6 animate-spin mr-3" /> : <Save className="h-6 w-6 mr-3" />}
         Save Changes
      </Button>
    </div>
  );
}
