
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Edit3, Loader2, Zap, Calendar, Tag, Percent, DollarSign, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function CouponManager() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [form, setFormData] = useState({
    code: "",
    type: "percentage",
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    expiry: "",
    usageLimit: 0,
    isEnabled: true
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "coupons"), (snapshot) => {
      setCoupons(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!form.code) return;
    setIsSaving(true);
    try {
      const code = form.code.toUpperCase().replace(/\s/g, '');
      await setDoc(doc(db, "coupons", code), {
        ...form,
        code,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Coupon Synced", description: `Coupon created successfully.` });
      setFormData({ code: "", type: "percentage", value: 0, minAmount: 0, maxDiscount: 0, expiry: "", usageLimit: 0, isEnabled: true });
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    await updateDoc(doc(db, "coupons", id), { isEnabled: !current });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await deleteDoc(doc(db, "coupons", id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Coupon Management</h2>
          <p className="text-muted-foreground">Manage discount coupons and offers.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="h-10 font-bold bg-primary text-primary-foreground neon-glow">
              <Plus className="mr-2 h-4 w-4" />
              Generate Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-white/10 max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-headline font-bold uppercase">Create Coupon</DialogTitle>
              <DialogDescription>Define discount logic and eligibility thresholds.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Coupon Code</Label>
                <Input value={form.code} onChange={(e) => setFormData({...form, code: e.target.value})} placeholder="e.g. AATMA50" className="bg-black/40 font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setFormData({...form, type: v})}>
                    <SelectTrigger className="bg-black/40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Discount Value</Label>
                  <Input type="number" value={form.value} onChange={(e) => setFormData({...form, value: parseFloat(e.target.value)})} className="bg-black/40" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Min Order (₹)</Label>
                  <Input type="number" value={form.minAmount} onChange={(e) => setFormData({...form, minAmount: parseFloat(e.target.value)})} className="bg-black/40" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Max Discount (₹)</Label>
                  <Input type="number" value={form.maxDiscount} onChange={(e) => setFormData({...form, maxDiscount: parseFloat(e.target.value)})} className="bg-black/40" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground">Expiry Date</Label>
                <Input type="date" value={form.expiry} onChange={(e) => setFormData({...form, expiry: e.target.value})} className="bg-black/40" />
              </div>
              <Button className="w-full h-12 font-bold neon-glow mt-4" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-card border-white/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Coupon Code</th>
                  <th className="px-6 py-4">Discount</th>
                  <th className="px-6 py-4">Conditions</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : coupons.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No coupons available.</td></tr>
                ) : (
                  coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="p-2 rounded-lg bg-primary/10 text-primary">
                              <Tag className="h-4 w-4" />
                           </div>
                           <p className="font-mono font-bold text-white uppercase">{c.code}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                            {c.type === 'percentage' ? <Percent className="h-3 w-3 text-primary" /> : <DollarSign className="h-3 w-3 text-green-500" />}
                            {c.value}{c.type === 'percentage' ? '%' : ' OFF'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-1">
                            <p className="text-[9px] text-muted-foreground font-bold uppercase">Min: ₹{c.minAmount}</p>
                            <p className="text-[9px] text-muted-foreground font-bold uppercase">Max: ₹{c.maxDiscount}</p>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge className={`text-[9px] border-none uppercase ${c.isEnabled ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
                            {c.isEnabled ? 'Active' : 'Offline'}
                         </Badge>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(c.id, c.isEnabled)}>
                          <Power className={`h-4 w-4 ${c.isEnabled ? 'text-destructive' : 'text-green-500'}`} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(c.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
  );
}
