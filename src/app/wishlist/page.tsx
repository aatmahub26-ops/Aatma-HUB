
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useWishlist } from "@/context/WishlistContext";
import { GAMES } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Zap, Trash2, Gamepad2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();

  const games = GAMES.filter(g => wishlist.includes(g.id));

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20 lg:pb-0">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-12">
             <div className="space-y-1">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                      <Heart className="h-6 w-6 fill-current" />
                   </div>
                   <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter uppercase leading-none">Player <span className="text-destructive">Cabinet</span></h1>
                </div>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mt-2">Personal wishlist of gaming protocols</p>
             </div>
             <Badge variant="outline" className="h-8 border-white/10 uppercase font-bold px-4">{wishlist.length} Items</Badge>
          </div>

          {games.length === 0 ? (
             <div className="p-20 text-center glass-card rounded-[3rem] border-dashed border-white/10 space-y-8">
                <div className="h-24 w-24 bg-muted/10 rounded-full flex items-center justify-center mx-auto">
                   <Heart className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <div className="space-y-2">
                   <h2 className="text-2xl font-headline font-bold uppercase">Cabinet Empty</h2>
                   <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest opacity-60">No protocols saved in your player profile.</p>
                </div>
                <Button size="lg" className="neon-glow font-bold h-16 px-12 rounded-2xl uppercase tracking-tighter text-lg" asChild>
                   <Link href="/catalog">Go to Marketplace</Link>
                </Button>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-500">
               {games.map((game) => (
                 <Card key={game.id} className="bg-card border-white/5 group hover:border-primary/20 transition-all rounded-[2rem] overflow-hidden">
                    <CardContent className="p-6 flex items-center gap-6">
                       <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-white/10 shrink-0 bg-black/40 flex items-center justify-center p-4">
                          <Image 
                            src={game.imageUrl || `/logos/${game.image || 'default'}.png`}
                            alt={game.name}
                            fill
                            className="object-contain p-2"
                          />
                       </div>
                       <div className="flex-1 space-y-2">
                          <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase tracking-widest px-3 h-4">{game.category}</Badge>
                          <h3 className="font-bold text-xl uppercase tracking-tight text-white leading-none">{game.name}</h3>
                          <div className="flex items-center justify-between pt-2">
                             <p className="text-sm font-headline font-bold text-primary">Starts at ₹{game.packages?.[0]?.price || 0}</p>
                             <div className="flex items-center gap-2">
                                <Button size="icon" variant="ghost" className="h-10 w-10 text-destructive hover:bg-destructive/10 rounded-xl" onClick={() => toggleWishlist(game.id)}>
                                   <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button className="h-10 px-6 font-bold uppercase text-[9px] tracking-widest rounded-xl" asChild>
                                   <Link href={`/catalog/${game.id}`}>Buy Now <Zap className="ml-2 h-3.5 w-3.5 fill-current" /></Link>
                                </Button>
                             </div>
                          </div>
                       </div>
                    </CardContent>
                 </Card>
               ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
