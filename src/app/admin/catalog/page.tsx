
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Trash2, Edit3, Loader2, Gamepad2, Package, Globe, Smartphone, Tv, Gift, Power, FileUp, Save, RefreshCw, Layers, ShieldCheck, DatabaseZap, Star, ListChecks, Type } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, setDoc, updateDoc, writeBatch, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { GAMES } from "@/lib/data";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function CatalogManager() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const { toast } = useToast();

  const [form, setFormData] = useState({
    id: "",
    name: "",
    category: "MOBA",
    description: "",
    imageUrl: "",
    requiresServer: false,
    isOtt: false,
    isEnabled: true,
    packages: [] as any[],
    formFields: [] as any[] // NEW: Custom fields for the product
  });

  useEffect(() => {
    const q = query(collection(db, "catalog"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSaveProduct = async () => {
    if (!form.name || !form.id) {
      toast({ title: "Missing Product Information", description: "ID and Title are mandatory.", variant: "destructive" });
      return;
    }

    try {
      await setDoc(doc(db, "catalog", form.id), {
        ...form,
        updatedAt: new Date().toISOString()
      });
      toast({ title: "Product Updated", description: `${form.name} node updated.` });
      setIsEditing(null);
      resetForm();
    } catch (e: any) {
      toast({ title: "Sync Failed", description: e.message, variant: "destructive" });
    }
  };

  const seedMarketplace = async () => {
    if (!confirm("Initiate Global Marketplace Seeding? This will only add missing nodes and merge existing ones.")) return;
    setIsSyncing(true);
    try {
      const batch = writeBatch(db);
      for (const game of GAMES) {
        const ref = doc(db, "catalog", game.id);
        // Using set with merge true to prevent overwriting custom package prices/SKUs
        batch.set(ref, {
          ...game,
          isEnabled: true,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      await batch.commit();
      toast({ title: "Global Sync Success", description: `${GAMES.length} nodes processed.` });
    } catch (e: any) {
      toast({ title: "Seeding Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsSyncing(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      id: "", 
      name: "", 
      category: "MOBA", 
      description: "", 
      imageUrl: "", 
      requiresServer: false, 
      isOtt: false, 
      isEnabled: true, 
      packages: [],
      formFields: []
    });
  };

  const addPackage = () => {
    setFormData({
      ...form,
      packages: [...form.packages, { 
        id: `pkg-${Date.now()}`, 
        amount: "", 
        price: 0, 
        description: "",
        bonus: "",
        section: "large",
        smileSku: "",
        mooGoldSku: "",
        uniPinSku: ""
      }]
    });
  };

  const updatePackage = (index: number, field: string, value: any) => {
    const pkgs = [...form.packages];
    pkgs[index] = { ...pkgs[index], [field]: value };
    setFormData({ ...form, packages: pkgs });
  };

  const removePackage = (index: number) => {
    setFormData({ ...form, packages: form.packages.filter((_, i) => i !== index) });
  };

  // NEW: Field Logic Handlers
  const addField = () => {
    setFormData({
      ...form,
      formFields: [...(form.formFields || []), {
        id: `field-${Date.now()}`,
        label: "",
        placeholder: "",
        type: "text",
        required: true
      }]
    });
  };

  const updateField = (index: number, field: string, value: any) => {
    const fields = [...form.formFields];
    fields[index] = { ...fields[index], [field]: value };
    setFormData({ ...form, formFields: fields });
  };

  const removeField = (index: number) => {
    setFormData({ ...form, formFields: form.formFields.filter((_, i) => i !== index) });
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Product Catalog</h2>
          <p className="text-muted-foreground">Manage game nodes, manual package pricing, and distribution layers.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 border-primary/20 bg-primary/5 font-bold" onClick={seedMarketplace} disabled={isSyncing}>
            {isSyncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <DatabaseZap className="mr-2 h-4 w-4" />}
            Import Products
          </Button>

          <Dialog open={!!isEditing || form.id !== ""} onOpenChange={(open) => {
            if (!open) {
              setIsEditing(null);
              resetForm();
            }
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 font-bold bg-primary text-primary-foreground neon-glow" onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-tighter">Configure Product</DialogTitle>
                <DialogDescription>Define retail packages, prices, and provider mappings for this product.</DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product ID</Label>
                    <Input className="bg-black/40 border-white/10" value={form.id} onChange={(e) => setFormData({...form, id: e.target.value})} placeholder="e.g. mlbb-promo" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Public Title</Label>
                    <Input className="bg-black/40 border-white/10" value={form.name} onChange={(e) => setFormData({...form, name: e.target.value})} placeholder="Mobile Legends" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Classification</Label>
                    <Select value={form.category} onValueChange={(v) => setFormData({...form, category: v})}>
                      <SelectTrigger className="bg-black/40 border-white/10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Games">Games</SelectItem>
                        <SelectItem value="OTT Services">OTT / Digital</SelectItem>
                        <SelectItem value="Social Media">Social Media</SelectItem>
                        <SelectItem value="Gift Cards">Gift Cards</SelectItem>
                        <SelectItem value="MOBA">MOBA</SelectItem>
                        <SelectItem value="Battle Royale">Battle Royale</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Product Description</Label>
                    <Input className="bg-black/40 border-white/10" value={form.description} onChange={(e) => setFormData({...form, description: e.target.value})} placeholder="Enter public description..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-white">OTT Logic</p>
                        <p className="text-[8px] text-muted-foreground">Legacy Email Flag</p>
                      </div>
                      <Switch checked={form.isOtt} onCheckedChange={(v) => setFormData({...form, isOtt: v})} />
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase text-white">Server Required</p>
                        <p className="text-[8px] text-muted-foreground">Legacy Zone Flag</p>
                      </div>
                      <Switch checked={form.requiresServer} onCheckedChange={(v) => setFormData({...form, requiresServer: v})} />
                    </div>
                  </div>
                </div>
              </div>

              {/* NEW: Dynamic Form Builder Section */}
              <div className="space-y-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg uppercase flex items-center gap-2">
                    <ListChecks className="h-5 w-5 text-primary" />
                    Custom Form Fields
                  </h3>
                  <Button variant="outline" size="sm" onClick={addField} className="text-[10px] font-bold uppercase tracking-widest border-primary/20">
                    <Plus className="h-3 w-3 mr-2" /> Define New Field
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(form.formFields || []).map((field: any, idx: number) => (
                    <div key={field.id} className="bg-black/20 p-4 rounded-2xl border border-white/5 space-y-4">
                       <div className="flex justify-between items-center">
                          <Badge variant="outline" className="text-[8px] uppercase border-primary/20">Field #{idx + 1}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeField(idx)}><Trash2 className="h-3.5 w-3.5" /></Button>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                             <Label className="text-[8px] uppercase font-bold text-muted-foreground">Input Label</Label>
                             <Input className="h-8 text-xs bg-black/40" value={field.label} onChange={(e) => updateField(idx, 'label', e.target.value)} placeholder="e.g. Player ID" />
                          </div>
                          <div className="space-y-1">
                             <Label className="text-[8px] uppercase font-bold text-muted-foreground">Placeholder</Label>
                             <Input className="h-8 text-xs bg-black/40" value={field.placeholder} onChange={(e) => updateField(idx, 'placeholder', e.target.value)} placeholder="Enter UID..." />
                          </div>
                       </div>
                       <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                             <Label className="text-[8px] uppercase font-bold text-muted-foreground">Type</Label>
                             <Select value={field.type} onValueChange={(v) => updateField(idx, 'type', v)}>
                                <SelectTrigger className="h-7 text-[8px] uppercase w-24">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="text">Text</SelectItem>
                                   <SelectItem value="number">Number</SelectItem>
                                   <SelectItem value="email">Email</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="flex items-center gap-2">
                             <Label className="text-[8px] uppercase font-bold text-muted-foreground">Required</Label>
                             <Switch className="scale-75" checked={field.required} onCheckedChange={(v) => updateField(idx, 'required', v)} />
                          </div>
                       </div>
                    </div>
                  ))}
                  {form.formFields?.length === 0 && (
                    <div className="col-span-full py-10 text-center border border-dashed border-white/5 rounded-2xl opacity-30">
                       <p className="text-[10px] font-bold uppercase tracking-widest">No custom fields defined. Using global defaults.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-6 pt-6 border-t border-white/10 mt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-headline font-bold text-lg uppercase flex items-center gap-2">
                    <Layers className="h-5 w-5 text-primary" />
                    Retail Packages & Tiers
                  </h3>
                  <Button variant="outline" size="sm" onClick={addPackage} className="text-[10px] font-bold uppercase tracking-widest border-primary/20">
                    <Plus className="h-3 w-3 mr-2" /> Add Package
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {form.packages.map((pkg, idx) => (
                    <div key={pkg.id} className="bg-black/20 p-6 rounded-2xl border border-white/5 space-y-4">
                       <div className="grid grid-cols-12 gap-4 items-end">
                          <div className="col-span-3 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Package Amount</Label>
                            <Input className="h-9 text-xs" value={pkg.amount} onChange={(e) => updatePackage(idx, 'amount', e.target.value)} placeholder="e.g. 86 Diamonds" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Retail Price (₹)</Label>
                            <Input className="h-9 text-xs" type="number" value={pkg.price} onChange={(e) => updatePackage(idx, 'price', parseFloat(e.target.value))} />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Bonus Amount</Label>
                            <Input className="h-9 text-xs" value={pkg.bonus || ""} onChange={(e) => updatePackage(idx, 'bonus', e.target.value)} placeholder="+14 Bonus" />
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Section/Tab</Label>
                            <Select value={pkg.section || "large"} onValueChange={(v) => updatePackage(idx, 'section', v)}>
                              <SelectTrigger className="h-9 text-[10px] uppercase font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="large">Medium/Large</SelectItem>
                                <SelectItem value="pass">Passes</SelectItem>
                                <SelectItem value="double">Double Bonus</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="col-span-2 space-y-1">
                            <Label className="text-[9px] uppercase font-bold text-muted-foreground">Description</Label>
                            <Input className="h-9 text-xs" value={pkg.description} onChange={(e) => updatePackage(idx, 'description', e.target.value)} placeholder="Popular" />
                          </div>
                          <div className="col-span-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => removePackage(idx)}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                       </div>
                       
                       <div className="grid grid-cols-3 gap-4 pt-2">
                          <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                             <Label className="text-[8px] uppercase font-bold text-primary">Smile.one SKU</Label>
                             <Input className="h-8 text-[10px] bg-black/40 font-mono" value={pkg.smileSku || ""} onChange={(e) => updatePackage(idx, 'smileSku', e.target.value)} placeholder="Provider SKU" />
                          </div>
                          <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                             <Label className="text-[8px] uppercase font-bold text-blue-400">MooGold SKU</Label>
                             <Input className="h-8 text-[10px] bg-black/40 font-mono" value={pkg.mooGoldSku || ""} onChange={(e) => updatePackage(idx, 'mooGoldSku', e.target.value)} placeholder="Item Code" />
                          </div>
                          <div className="space-y-1 bg-white/5 p-3 rounded-lg border border-white/5">
                             <Label className="text-[8px] uppercase font-bold text-yellow-500">UniPin SKU</Label>
                             <Input className="h-8 text-[10px] bg-black/40 font-mono" value={pkg.uniPinSku || ""} onChange={(e) => updatePackage(idx, 'uniPinSku', e.target.value)} placeholder="Product ID" />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button className="w-full h-14 font-bold neon-glow mt-8 text-lg uppercase tracking-tighter" onClick={handleSaveProduct}>
                <Save className="h-5 w-5 mr-3" /> Save Product
              </Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Filter catalog intelligence..." className="pl-10 h-12 bg-card/50 border-white/5" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Form Field</th>
                  <th className="px-6 py-4">Packages</th>
                  <th className="px-6 py-4">Price Range</th>
                  <th className="px-6 py-4 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">Catalog node empty.</td></tr>
                ) : (
                  filtered.map((prod) => (
                    <tr key={prod.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-black/40 flex items-center justify-center border border-white/5">
                            <Gamepad2 className="h-5 w-5 text-primary opacity-50" />
                          </div>
                          <div>
                            <p className="font-bold text-white uppercase tracking-tight">{prod.name}</p>
                            <div className="flex gap-2 items-center">
                               <Badge variant="outline" className="text-[8px] h-3 uppercase border-white/10 text-muted-foreground font-bold">{prod.category}</Badge>
                               <span className="text-[8px] text-muted-foreground font-mono">#{prod.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className={`flex items-center gap-2 text-[9px] font-bold uppercase ${prod.isEnabled ? 'text-green-500' : 'text-destructive'}`}>
                            {prod.isEnabled ? <ShieldCheck className="h-3 w-3" /> : <Power className="h-3 w-3" />}
                            {prod.isEnabled ? 'Active' : 'Offline'}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                            <ListChecks className="h-3 w-3 text-primary" />
                            {prod.formFields?.length || 0} Inputs
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 font-bold text-xs text-white">
                          <Layers className="h-3 w-3 text-primary" />
                          {prod.packages?.length || 0} Tiers
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <p className="text-xs font-bold text-white">
                            {prod.packages?.length > 0 
                              ? `₹${Math.min(...prod.packages.map((p: any) => p.price))} - ₹${Math.max(...prod.packages.map((p: any) => p.price))}`
                              : "N/A"}
                         </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => {
                          setFormData({ ...prod });
                          setIsEditing(prod.id);
                        }}>
                          <Edit3 className="h-4 w-4" />
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
