"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Gift, Trophy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const DEFAULT_BANNERS = [
  {
    id: "banner-season",
    title: "MYTHIC SEASON PASS",
    subtitle: "Unlock elite skins and seasonal rewards instantly.",
    cta: "Join Now",
    link: "/catalog/mlbb-in",
    badge: "Exclusive",
    icon: Trophy
  },
  {
    id: "banner-uc",
    title: "INSTANT RECHARGE HUB",
    subtitle: "Fuel your gameplay with 0s latency dispatches.",
    cta: "Top-up Now",
    link: "/catalog/bgmi",
    badge: "Instant",
    icon: Zap
  },
];

export function BannerSlider() {
  const [loading, setLoading] = React.useState(true);
  const [banners, setBanners] = React.useState<any[]>(DEFAULT_BANNERS);
  const plugin = React.useRef(
    Autoplay({ delay: 6000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    const unsub = onSnapshot(doc(db, "system_settings", "banners"), (doc) => {
      if (doc.exists() && doc.data().list?.length > 0) {
        const customBanners = DEFAULT_BANNERS.map(def => {
          const match = doc.data().list.find((b: any) => b.id === def.id);
          return match ? { ...def, ...match } : def;
        });
        setBanners(customBanners);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-2">
        <Skeleton className="w-full h-[160px] md:h-[350px] rounded-2xl bg-white/5" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-2 animate-in fade-in duration-1000">
      <Carousel
        plugins={[plugin.current]}
        className="w-full rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl group/carousel"
      >
        <CarouselContent>
          {banners.map((banner) => {
            const imgUrl = banner.imageUrl;
            
            return (
              <CarouselItem key={banner.id}>
                <div className="relative h-[160px] md:h-[350px] w-full overflow-hidden">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={banner.title}
                      fill
                      className="object-cover scale-105"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                       <Sparkles className="h-10 w-10 text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-center p-6 md:p-12 space-y-2 md:space-y-4 max-w-2xl">
                    <div className="flex items-center gap-2">
                       <Badge className="bg-primary/20 text-primary border-primary/20 font-bold px-2 py-0.5 uppercase tracking-widest text-[8px] md:text-[10px]">
                         {banner.badge}
                       </Badge>
                    </div>
                    <h2 className="text-lg md:text-5xl font-headline font-bold tracking-tighter text-white leading-none uppercase">
                      {banner.title}
                    </h2>
                    <p className="text-muted-foreground text-[9px] md:text-lg line-clamp-1 max-w-md font-medium">
                      {banner.subtitle}
                    </p>
                    <div className="pt-1">
                      <Button size="sm" className="neon-glow font-bold h-7 md:h-11 px-5 md:px-8 text-[8px] md:text-sm uppercase tracking-tighter rounded-lg" asChild>
                        <Link href={banner.link}>{banner.cta || "Initialize"}</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
