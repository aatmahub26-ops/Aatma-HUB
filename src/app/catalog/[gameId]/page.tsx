
"use client";

import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, ShieldCheck, Zap, Loader2, ArrowLeft, Mail, Smartphone, ShoppingCart, Gamepad2, Tv, CreditCard, ZapIcon, Rocket, PackageOpen, BellRing, Sparkles, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GAMES } from "@/lib/data";
import Link from "next/link";
import Image from "next/image";

function getDetailBrandIcon(name: string, category: string) {
  const n = name.toLowerCase();
  if (n.includes('mobile legends')) return { color: 'from-blue-600 to-slate-900' };
  if (n.includes('bgmi')) return { color: 'from-orange-600 to-slate-900' };
  if (n.includes('pubg')) return { color: 'from-yellow-600 to-slate-900' };
  if (n.includes('free fire')) return { color: 'from-red-600 to-slate-900' };
  if (n.includes('valorant')) return { color: 'from-red-500 to-slate-900' };
  if (category === 'OTT Services') return { color: 'from-red-700 to-black' };
  return { color: 'from-primary/40 to-slate-950' };
}

export default function GameProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const gameIdParam = Array.isArray(params.gameId) ? params.gameId[0] : params.gameId;
  const { toast } = useToast();
  
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  
  // Dynamic Form State
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNotified, setIsNotified] = useState(false);

  useEffect(() => {
    if (!gameIdParam) return;
    const unsub = onSnapshot(doc(db, "catalog", gameIdParam), (docSnap) => {
      if (docSnap.exists()) {
        setGame({ id: docSnap.id, ...docSnap.data() });
      } else {
        const staticGame = GAMES.find(g => g.id === gameIdParam);
        if (staticGame) setGame(staticGame);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [gameIdParam]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  if (!game) return <div className="p-20 text-center font-headline font-bold text-muted-foreground uppercase tracking-widest bg-background min-h-screen">Intelligence not found in node.</div>;

  const handleNotifyMe = () => {
    if (!user) {
      toast({ title: "Authentication Required", description: "Sign in to subscribe to launch alerts.", variant: "destructive" });
      router.push("/login");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsNotified(true);
      setIsSubmitting(false);
      toast({ title: "Signal Captured", description: "You will be notified as soon as this node goes live." });
    }, 1500);
  };

  const validateInputs = () => {
    if (!user) { 
      toast({ title: "Authentication Required", description: "Sign in to proceed.", variant: "destructive" }); 
      router.push("/login"); 
      return false; 
    }
    
    // Check dynamic fields
    if (game.formFields?.length > 0) {
       for (const field of game.formFields) {
          if (field.required && !formData[field.id]) {
             toast({ title: "Input Required", description: `${field.label} is mandatory.`, variant: "destructive" });
             return false;
          }
       }
    } else {
       // Legacy Fallback
       if (!formData['legacy_id']) {
          toast({ title: "Input Required", description: "Please enter your ID.", variant: "destructive" });
          return false;
       }
       if (game.requiresServer && !formData['legacy_server']) {
          toast({ title: "Input Required", description: "Zone/Server ID is mandatory.", variant: "destructive" });
          return false;
       }
    }

    if (!selectedPkg) { 
      toast({ title: "Selection Required", description: "Select a package to proceed.", variant: "destructive" }); 
      return false; 
    }
    
    return true;
  };

  const handleAddToCart = async () => {
    if (!validateInputs()) return;
    setIsSubmitting(true);
    const pkg = game.packages.find((p: any) => p.id === selectedPkg);

    // Map dynamic fields to core properties
    let playerGameId = "";
    let playerServerId = undefined;

    if (game.formFields?.length > 0) {
       playerGameId = formData[game.formFields[0].id] || "";
       playerServerId = game.formFields[1] ? formData[game.formFields[1].id] : undefined;
    } else {
       playerGameId = formData['legacy_id'];
       playerServerId = formData['legacy_server'];
    }

    try {
      await addToCart({ 
        productId: game.id, 
        productName: game.name, 
        packageId: pkg.id, 
        packageName: pkg.amount, 
        price: pkg.price, 
        quantity: 1, 
        playerGameId, 
        playerServerId, 
        imageUrl: game.imageUrl || `/logos/${game.image || 'default'}.png`,
        extraData: formData // NEW: Persist all dynamic fields
      });
      toast({ title: "Protocol Synced", description: "Added to Hub Cart." });
    } catch (error: any) { 
      toast({ title: "Error", description: error.message, variant: "destructive" }); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleBuyNow = () => {
    if (!validateInputs()) return;
    const pkg = game.packages.find((p: any) => p.id === selectedPkg);

    let playerGameId = "";
    let playerServerId = "";

    if (game.formFields?.length > 0) {
       playerGameId = formData[game.formFields[0].id] || "";
       playerServerId = game.formFields[1] ? formData[game.formFields[1].id] : "";
    } else {
       playerGameId = formData['legacy_id'];
       playerServerId = formData['legacy_server'] || "";
    }

    const query = new URLSearchParams({ 
      productId: game.id, 
      packageId: pkg.id, 
      playerGameId, 
      playerServerId,
      formData: JSON.stringify(formData)
    }).toString();
    router.push(`/checkout?${query}`);
  };

  if (game.isComingSoon) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 py-10 md:py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div 
                className="relative aspect-square rounded-[3rem] bg-gradient-to-br from-primary/20 to-slate-900 flex items-center justify-center border border-white/10 group overflow-hidden shadow-2xl"
                data-image-protected="true"
              >
                <Image src={game.imageUrl || `/logos/${game.image || 'default'}.png`} alt={game.name} fill className="object-contain p-12 logo-protected opacity-40 grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <Badge className="bg-primary text-white font-bold uppercase tracking-[0.2em] px-6 py-2 text-xs shadow-2xl animate-pulse">COMING SOON</Badge>
                </div>
              </div>

              <div className="space-y-8 text-center md:text-left">
                <div className="space-y-4">
                   <h1 className="text-4xl md:text-6xl font-headline font-bold uppercase tracking-tighter leading-none">{game.name}</h1>
                   <p className="text-muted-foreground text-lg uppercase font-bold tracking-widest opacity-60">Service Node Synchronization in Progress</p>
                </div>

                <Card className="bg-card border-white/5 p-8 rounded-[2.5rem] space-y-6">
                   <div className="flex items-center gap-4 text-primary">
                      <Rocket className="h-8 w-8 animate-bounce" />
                      <h3 className="font-headline font-bold uppercase text-lg tracking-tight">Launch Sequence Active</h3>
                   </div>
                   <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                      This service is currently being integrated into our automated distribution layer. 
                      Register your interest to receive an instant dispatch signal on launch.
                   </p>
                   
                   <Button 
                    size="lg" 
                    className={`w-full h-16 font-bold uppercase tracking-widest text-lg rounded-2xl transition-all ${isNotified ? 'bg-green-600 text-white' : 'neon-glow'}`}
                    disabled={isSubmitting || isNotified}
                    onClick={handleNotifyMe}
                   >
                      {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : isNotified ? <><Check className="mr-2 h-6 w-6" /> Signal Locked</> : <><BellRing className="mr-2 h-6 w-6" /> Notify Me on Launch</>}
                   </Button>
                </Card>

                <Button asChild variant="ghost" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                   <Link href="/catalog"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Marketplace</Link>
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const brand = getDetailBrandIcon(game.name, game.category);
  const hasPackages = game.packages && game.packages.length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto px-4">
          <Link href="/catalog" className="inline-flex items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary mb-8 transition-colors"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Marketplace</Link>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-4 space-y-6">
              <div 
                className={`relative aspect-square rounded-[2.5rem] overflow-hidden border border-white/10 bg-gradient-to-br ${brand.color} flex items-center justify-center shadow-2xl`}
                data-image-protected="true"
              >
                 <div className="relative w-full h-full p-16 product-image">
                    <Image src={game.imageUrl || `/logos/${game.image || 'default'}.png`} alt={game.name} fill className="object-contain p-4 logo-protected" />
                 </div>
                 <div className="absolute bottom-8 left-8 right-8 space-y-1"><Badge className="bg-primary/20 text-primary border-none font-bold uppercase text-[9px] px-3">{game.category}</Badge><h1 className="font-headline text-2xl font-bold text-white tracking-tighter uppercase leading-none">{game.name}</h1></div>
              </div>
              <div className="glass-card p-6 rounded-2xl space-y-4 border-primary/20">
                <div className="flex items-center space-x-3 text-primary"><ShieldCheck className="h-5 w-5" /><h2 className="font-headline font-bold uppercase text-xs tracking-widest">Service Information</h2></div>
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed uppercase">{game.description || "Verify account credentials before dispatch. Latency: 0-5 mins."}</p>
              </div>
            </div>
            
            <div className="lg:col-span-8 space-y-8">
              {/* Dynamic Form Card */}
              <Card className="bg-card/50 border-white/5 rounded-[2rem] p-8 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-headline font-bold text-lg text-primary-foreground shadow-lg">1</div>
                  <h2 className="text-xl font-headline font-bold uppercase tracking-tight">Account Details</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {game.formFields?.length > 0 ? (
                    game.formFields.map((field: any) => (
                      <div key={field.id} className="space-y-2">
                        <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">
                           {field.label} {field.required && <span className="text-destructive">*</span>}
                        </Label>
                        <div className="relative">
                          {field.type === 'email' ? (
                            <Mail className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                          ) : (
                            <ListChecks className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />
                          )}
                          <Input 
                            type={field.type}
                            placeholder={field.placeholder} 
                            className="h-12 pl-12 bg-black/40 border-white/10 text-base font-bold" 
                            value={formData[field.id] || ""} 
                            onChange={(e) => setFormData({...formData, [field.id]: e.target.value})} 
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Legacy Fallback UI */}
                      <div className="space-y-2">
                        <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Player / Account ID</Label>
                        <div className="relative">
                          {game.isOtt ? <Mail className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" /> : <Smartphone className="absolute left-4 top-3.5 h-4 w-4 text-primary/40" />}
                          <Input 
                            placeholder={game.isOtt ? "user@email.com" : "e.g. 123456789"} 
                            className="h-12 pl-12 bg-black/40 border-white/10 text-base font-bold" 
                            value={formData['legacy_id'] || ""} 
                            onChange={(e) => setFormData({...formData, ['legacy_id']: e.target.value})} 
                          />
                        </div>
                      </div>
                      {game.requiresServer && (
                        <div className="space-y-2">
                          <Label className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground">Zone / Server ID</Label>
                          <Input 
                            placeholder="e.g. 9001" 
                            className="h-12 bg-black/40 border-white/10 text-base font-bold" 
                            value={formData['legacy_server'] || ""} 
                            onChange={(e) => setFormData({...formData, ['legacy_server']: e.target.value})} 
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>

              <Card className="bg-card/50 border-white/5 rounded-[2rem] overflow-hidden min-h-[300px]">
                <CardHeader className="bg-white/5 border-b border-white/5 p-6 flex flex-row items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center font-headline font-bold text-lg text-primary-foreground shadow-lg">2</div>
                  <CardTitle className="text-xl font-headline font-bold uppercase tracking-tight">Select Package</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {!hasPackages ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                      <PackageOpen className="h-12 w-12 text-muted-foreground opacity-20" />
                      <div className="space-y-1"><p className="font-bold text-white uppercase text-sm">Packages Awaiting Launch</p></div>
                    </div>
                  ) : (
                    <Tabs defaultValue="large" className="space-y-6">
                      <TabsList className="grid grid-cols-4 bg-black/40 h-12 p-1 rounded-xl">
                        {['small', 'large', 'pass', 'double'].map(s => <TabsTrigger key={s} value={s} className="text-[9px] uppercase font-bold">{s}</TabsTrigger>)}
                      </TabsList>
                      {['small', 'large', 'pass', 'double'].map(s => (
                        <TabsContent key={s} value={s} className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in duration-300">
                          {game.packages.filter((p: any) => p.section === s).map((p: any) => (
                            <button key={p.id} onClick={() => setSelectedPkg(p.id)} className={`relative p-5 rounded-2xl border-2 text-left transition-all duration-300 ${selectedPkg === p.id ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(158,102,255,0.25)]" : "border-white/5 bg-black/20 hover:border-white/20"}`}>
                               <div className="space-y-1"><p className="font-bold text-sm text-white uppercase leading-tight truncate">{p.amount}</p><p className="text-[9px] font-bold uppercase text-muted-foreground truncate">{p.description}</p></div>
                               <p className="mt-4 font-headline font-bold text-primary text-lg">₹{p.price}</p>
                               {selectedPkg === p.id && <div className="absolute top-2 right-2 h-4 w-4 bg-primary rounded-full flex items-center justify-center animate-in zoom-in"><Check className="h-2.5 w-2.5 text-white" /></div>}
                            </button>
                          ))}
                        </TabsContent>
                      ))}
                    </Tabs>
                  )}
                </CardContent>
              </Card>

              {hasPackages && (
                <div className="glass-card p-8 rounded-[2.5rem] border-primary/20 space-y-6 relative overflow-hidden">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 relative z-10">
                    <div className="text-center md:text-left">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Protocol Selected</p>
                      <p className="text-xl font-headline font-bold text-white uppercase">{selectedPkg ? game.packages.find((p: any) => p.id === selectedPkg)?.amount : "Awaiting selection"}</p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Transaction Total</p>
                      <p className="text-4xl font-headline font-bold text-primary">₹{selectedPkg ? game.packages.find((p: any) => p.id === selectedPkg)?.price : "0"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button size="lg" className="h-16 text-xl font-bold uppercase tracking-widest rounded-2xl neon-glow" disabled={!selectedPkg || isSubmitting} onClick={handleBuyNow}>
                      <ZapIcon className="mr-2 h-5 w-5 fill-current" /> Buy Now
                    </Button>
                    <Button size="lg" variant="outline" className="h-16 text-lg font-bold uppercase tracking-widest rounded-2xl border-primary/30 text-primary hover:bg-primary/10" disabled={!selectedPkg || isSubmitting} onClick={handleAddToCart}>
                      <ShoppingCart className="mr-2 h-5 w-5" /> Add To Cart
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
