
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { type GameCategory, GAMES } from "@/lib/data";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Star, Gamepad2, Tv, CreditCard, Loader2, Zap, Swords, Trophy, Sparkles } from "lucide-react";
import { useState, useEffect, Suspense } from "react";
import { collection, query, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useSearchParams } from "next/navigation";
import Image from "next/image";

function getCatalogBrandIcon(name: string, category: string) {
  const n = name.toLowerCase();
  if (n.includes('mobile legends')) return { color: 'from-blue-600/30 to-slate-900' };
  if (n.includes('bgmi')) return { color: 'from-orange-600/30 to-slate-900' };
  if (n.includes('pubg')) return { color: 'from-yellow-600/30 to-slate-900' };
  if (n.includes('free fire')) return { color: 'from-red-600/30 to-slate-900' };
  if (n.includes('valorant')) return { color: 'from-red-500/30 to-slate-900' };
  if (category === 'OTT Services') return { color: 'from-blue-900/30 to-black' };
  if (category === 'Gift Cards') return { color: 'from-orange-400/20 to-slate-950' };
  return { color: 'from-primary/20 to-slate-950' };
}

function CatalogContent() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || "");
  const [activeCategory, setActiveCategory] = useState<string>(searchParams.get('category') || "All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { name: "All", icon: Star },
    { name: "Battle Royale", icon: Trophy },
    { name: "MOBA", icon: Swords },
    { name: "RPG", icon: Sparkles },
    { name: "Strategy", icon: Gamepad2 },
    { name: "Sports", icon: Trophy },
    { name: "Casual", icon: Sparkles },
    { name: "OTT Services", icon: Tv },
    { name: "Gift Cards", icon: CreditCard },
  ];

  useEffect(() => {
    const q = query(collection(db, "catalog"), where("isEnabled", "==", true));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let cloudItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const allItems = [...GAMES];
      cloudItems.forEach(cloudItem => {
         const idx = allItems.findIndex(i => i.id === cloudItem.id);
         if (idx > -1) allItems[idx] = { ...allItems[idx], ...cloudItem };
         else allItems.push(cloudItem);
      });
      setProducts(allItems);
      setLoading(false);
    }, (error) => {
      setProducts(GAMES);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredItems = products.filter(item => {
    if (!item.isEnabled) return false;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div className="space-y-4 text-center md:text-left">
          <Badge className="bg-primary/20 text-primary border-none px-4 py-1 uppercase font-bold tracking-widest">Global Marketplace</Badge>
          <h1 className="text-4xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-none">Aatma <span className="text-gradient">Hub</span></h1>
          <p className="text-muted-foreground max-w-lg text-lg">Instant Top-ups, Premium Subscriptions, and Digital Assets for the Global Gamer.</p>
        </div>
        <div className="relative w-full md:w-96">
           <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
           <Input placeholder="Search games or services..." className="h-14 pl-12 bg-card border-white/5 text-lg rounded-2xl shadow-2xl focus:border-primary/50 transition-all" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-md py-4 -mx-4 px-4 border-b border-white/5 mb-8">
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide max-w-6xl mx-auto justify-center px-4">
           {categories.map((cat) => (
             <Button key={cat.name} variant={activeCategory === cat.name ? "default" : "outline"} className={`h-10 rounded-full px-6 font-bold uppercase tracking-widest text-[9px] transition-all duration-300 shrink-0 ${activeCategory === cat.name ? 'neon-glow border-primary/50 shadow-[0_0_20px_rgba(158,102,255,0.4)]' : 'border-white/5 bg-card/50 hover:border-primary/30'}`} onClick={() => setActiveCategory(cat.name)}>
               <cat.icon className={`mr-2 h-3 w-3 ${activeCategory === cat.name ? 'text-primary-foreground' : 'text-primary'}`} />
               {cat.name}
             </Button>
           ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6 pb-20">
        {loading ? (
           Array.from({ length: 12 }).map((_, i) => <Card key={i} className="bg-card/50 border-white/5 aspect-square animate-pulse rounded-2xl" />)
        ) : filteredItems.length === 0 ? (
           <div className="col-span-full py-32 text-center space-y-4 bg-card/30 rounded-[3rem] border border-dashed border-white/10"><Search className="h-12 w-12 mx-auto text-muted-foreground opacity-20" /><p className="text-muted-foreground font-bold uppercase tracking-widest">No products found in this sector</p></div>
        ) : (
          filteredItems.map((game) => <ProductCard key={game.id} game={game} />)
        )}
      </div>
    </div>
  );
}

function ProductCard({ game }: { game: any }) {
  const brand = getCatalogBrandIcon(game.name, game.category);
  const [imgError, setImgError] = useState(false);
  const DefaultIcon = game.category === 'OTT Services' ? Tv : game.category === 'Gift Cards' ? CreditCard : Gamepad2;
  
  // Resolve image from placeholder registry if not a direct URL
  const resolvedImg = '/logos/' + game.image + '.webp';

  return (
    <Link href={`/catalog/${game.id}`} className={`group relative bg-card rounded-[2rem] overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-500 hover:-translate-y-1 shadow-xl ${game.isComingSoon ? 'opacity-70' : ''}`}>
      <div className="p-3">
        <div 
          className={`relative aspect-square w-full rounded-[1.5rem] overflow-hidden bg-gradient-to-br ${brand.color} flex items-center justify-center border border-white/10 group-hover:shadow-[0_0_30px_rgba(158,102,255,0.25)] transition-all duration-500 shadow-lg`}
          data-image-protected="true"
        >
          {!imgError ? (
            <div className="relative w-full h-full p-4 md:p-6 product-image">
              <Image 
                src={resolvedImg} 
                alt={game.name} 
                fill 
                className={`object-contain p-4 logo-protected ${game.isComingSoon ? '' : 'group-hover:scale-110'} transition-transform duration-500`} 
                onError={() => setImgError(true)} 
              />
            </div>
          ) : (
            <DefaultIcon className="h-10 w-10 text-primary opacity-50 group-hover:scale-110 transition-transform duration-500" />
          )}
          <div className="absolute top-3 left-3"><Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[7px] uppercase font-bold px-1.5 h-4">{game.category.split(' ')[0]}</Badge></div>
          {game.isComingSoon && <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"><Badge className="bg-primary text-primary-foreground font-bold uppercase text-[9px] px-3 py-1 animate-in zoom-in duration-300">COMING SOON</Badge></div>}
        </div>
      </div>
      <div className="px-4 pb-5 pt-1 space-y-2 text-center">
        <h3 className="font-bold text-xs group-hover:text-primary transition-colors truncate uppercase tracking-tight">{game.name}</h3>
        <div className="flex flex-col items-center">
          {game.isComingSoon ? <span className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Service Launching</span> : <><span className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">From</span><span className="text-primary font-headline font-bold text-base">₹{game.packages?.length > 0 ? Math.min(...game.packages.map((p: any) => p.price)) : 0}</span></>}
        </div>
      </div>
    </Link>
  );
}

export default function CatalogPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
          <CatalogContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
