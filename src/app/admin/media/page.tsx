"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image as ImageIcon, Upload, Trash2, Loader2, Gamepad2, Tv, CreditCard, Sparkles, Copy, CheckCircle2, Cloud } from "lucide-react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { collection, onSnapshot, doc, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function MediaManager() {
  const [activeTab, setActiveTab] = useState("banners");
  const [products, setProducts] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Listen for catalog products
    const unsubCatalog = onSnapshot(collection(db, "catalog"), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    // Listen for banners
    const unsubBanners = onSnapshot(doc(db, "system_settings", "banners"), (doc) => {
      if (doc.exists()) {
        setBanners(doc.data().list || []);
      }
    });

    return () => {
      unsubCatalog();
      unsubBanners();
    };
  }, []);

  const handleUpload = async (id: string, file: File, folder: string) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Payload Too Heavy", description: "System limit is 5MB.", variant: "destructive" });
      return;
    }

    setUploadingId(id);
    setProgress(0);

    try {
      const storageRef = ref(storage, `${folder}/${id}_${Date.now()}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (error) => {
          toast({ title: "Transmission Failed", description: error.message, variant: "destructive" });
          setUploadingId(null);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          if (folder === 'banners') {
             const bannerDoc = await getDoc(doc(db, "system_settings", "banners"));
             let currentList = bannerDoc.exists() ? (bannerDoc.data().list || []) : [];
             
             const existingIdx = currentList.findIndex((b: any) => b.id === id);
             if (existingIdx > -1) {
               currentList[existingIdx] = { ...currentList[existingIdx], imageUrl: downloadURL };
             } else {
               currentList.push({ id, imageUrl: downloadURL, title: "New Banner", subtitle: "Active", badge: "Exclusive", link: "/" });
             }
             
             await setDoc(doc(db, "system_settings", "banners"), { list: currentList });
          } else {
             await updateDoc(doc(db, "catalog", id), { imageUrl: downloadURL });
          }

          toast({ title: "Admin Synced", description: "Media updated successfully." });
          setUploadingId(null);
        }
      );
    } catch (e: any) {
      toast({ title: "Critical Error", description: e.message, variant: "destructive" });
      setUploadingId(null);
    }
  };

  const deleteAsset = async (id: string, currentUrl: string, folder: string) => {
    if (!confirm("Declassify and purge this asset from the ecosystem?")) return;
    
    try {
      if (currentUrl.includes('firebasestorage')) {
        const fileRef = ref(storage, currentUrl);
        await deleteObject(fileRef);
      }

      if (folder === 'banners') {
        const updatedList = banners.filter(b => b.id !== id);
        await setDoc(doc(db, "system_settings", "banners"), { list: updatedList });
      } else {
        await updateDoc(doc(db, "catalog", id), { imageUrl: null });
      }

      toast({ title: "Asset Purged", description: "Media deleted successfully." });
    } catch (e: any) {
      toast({ title: "Purge Failed", description: e.message, variant: "destructive" });
    }
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "URL Captured", description: "Stored to terminal buffer." });
  };

  const categories = [
    { name: "Games", icon: Gamepad2, folder: "games" },
    { name: "OTT Services", icon: Tv, folder: "ott" },
    { name: "Gift Cards", icon: CreditCard, folder: "giftcards" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Media Manager</h2>
          <p className="text-muted-foreground">Orchestrate platform visual nodes and branded distribution assets.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold text-[10px] tracking-widest px-3 py-1">
              <Cloud className="mr-2 h-3 w-3" /> Storage Active
           </Badge>
        </div>
      </div>

      <Tabs defaultValue="banners" onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-card border border-white/5 h-14 p-1 rounded-2xl">
          <TabsTrigger value="banners" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Sparkles className="h-3 w-3" /> Platform Banners
          </TabsTrigger>
          <TabsTrigger value="products" className="px-8 rounded-xl font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
            <Gamepad2 className="h-3 w-3" /> Marketplace Branding
          </TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {["banner-season", "banner-uc", "banner-sale"].map((id) => {
               const b = banners.find(x => x.id === id);
               return (
                 <Card key={id} className="bg-card border-white/5 overflow-hidden group hover:border-primary/30 transition-all">
                   <CardHeader className="bg-white/5 border-b border-white/5 py-3">
                      <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
                         <span>{id.replace('banner-', '').toUpperCase()} NODE</span>
                         {b && <Badge className="bg-green-500/10 text-green-500 border-none uppercase text-[8px] h-4">ACTIVE</Badge>}
                      </CardTitle>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="relative aspect-[21/9] bg-black flex items-center justify-center overflow-hidden">
                        {b?.imageUrl ? (
                          <img src={b.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={id} />
                        ) : (
                          <div className="text-center space-y-2 opacity-20">
                             <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground" />
                             <p className="text-[9px] font-bold uppercase tracking-tighter">Awaiting Payload</p>
                          </div>
                        )}
                        {uploadingId === id && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center space-y-4 p-8 text-center">
                             <Loader2 className="h-8 w-8 animate-spin text-primary" />
                             <div className="w-full space-y-1">
                                <Progress value={progress} className="h-1 bg-white/10" />
                                <p className="text-[10px] font-bold text-white uppercase tracking-widest">{progress.toFixed(0)}% SYNCED</p>
                             </div>
                          </div>
                        )}
                        <input 
                          type="file" 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                          onChange={(e) => e.target.files?.[0] && handleUpload(id, e.target.files[0], 'banners')}
                          accept="image/*"
                        />
                      </div>
                      <div className="p-4 bg-black/20 flex gap-2">
                         <Button variant="ghost" className="flex-1 font-bold text-[9px] uppercase h-9 border border-white/5 hover:bg-primary hover:text-white" disabled={!!uploadingId}>
                            <Upload className="h-3.5 w-3.5 mr-2" /> Replace Asset
                         </Button>
                         {b?.imageUrl && (
                           <>
                             <Button variant="ghost" size="icon" className="h-9 w-9 bg-white/5" onClick={() => copyUrl(b.imageUrl)}>
                               <Copy className="h-3.5 w-3.5" />
                             </Button>
                             <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => deleteAsset(id, b.imageUrl, 'banners')}>
                               <Trash2 className="h-3.5 w-3.5" />
                             </Button>
                           </>
                         )}
                      </div>
                   </CardContent>
                 </Card>
               );
             })}
           </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-12">
          {categories.map((cat) => (
            <div key={cat.name} className="space-y-6">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                    <cat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-headline font-bold text-lg uppercase tracking-tight">{cat.name} Logic Items</h3>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                  {products.filter(p => p.category === cat.name).map((prod) => (
                    <Card key={prod.id} className="bg-card border-white/5 overflow-hidden group hover:border-primary/30 transition-all">
                       <CardContent className="p-4 flex flex-col items-center gap-4 text-center">
                          <div className="relative h-20 w-20 rounded-2xl bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                             {prod.imageUrl ? (
                               <img src={prod.imageUrl} className="w-full h-full object-contain p-2" alt={prod.name} />
                             ) : (
                               <img src={`/logos/${prod.id.includes('mlbb') ? 'mlbb' : prod.id.split('-')[0]}.png`} className="w-full h-full object-contain p-2 opacity-30 grayscale" alt="fallback" />
                             )}
                             {uploadingId === prod.id && (
                               <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                 <Loader2 className="h-6 w-6 animate-spin text-primary" />
                               </div>
                             )}
                             <input 
                                type="file" 
                                className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                onChange={(e) => e.target.files?.[0] && handleUpload(prod.id, e.target.files[0], cat.folder)}
                                accept="image/*"
                             />
                             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center pointer-events-none">
                                <Upload className="h-5 w-5 text-white mb-1" />
                                <span className="text-[7px] font-bold text-white uppercase">Replace</span>
                             </div>
                          </div>
                          <div className="w-full overflow-hidden">
                             <p className="text-[9px] font-bold text-white uppercase truncate">{prod.name}</p>
                             <div className="flex items-center justify-center gap-2 mt-1">
                                {prod.imageUrl ? (
                                  <Badge className="bg-green-500/10 text-green-500 border-none text-[6px] font-bold px-1.5 h-3">CLOUD SYNC</Badge>
                                ) : (
                                  <Badge variant="outline" className="text-[6px] font-bold px-1.5 h-3 border-white/10 text-muted-foreground uppercase">LOCAL ASSET</Badge>
                                )}
                             </div>
                          </div>
                          {prod.imageUrl && (
                            <div className="flex gap-1 w-full pt-1 border-t border-white/5">
                               <button onClick={() => copyUrl(prod.imageUrl)} className="flex-1 h-6 bg-white/5 hover:bg-white/10 rounded flex items-center justify-center transition-colors">
                                  <Copy className="h-3 w-3 text-muted-foreground" />
                               </button>
                               <button onClick={() => deleteAsset(prod.id, prod.imageUrl, cat.folder)} className="flex-1 h-6 bg-destructive/10 hover:bg-destructive/20 rounded flex items-center justify-center transition-colors">
                                  <Trash2 className="h-3 w-3 text-destructive" />
                               </button>
                            </div>
                          )}
                       </CardContent>
                    </Card>
                  ))}
               </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
