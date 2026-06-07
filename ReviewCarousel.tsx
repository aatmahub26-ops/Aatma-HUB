"use client";

import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Quote, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const REVIEWS = [
  {
    name: "Aman Sharma",
    rank: "Immortal Player",
    text: "Instant delivery every time. Best prices for BGMI UC in India. Highly recommended!",
    stars: 5,
    avatar: "AS"
  },
  {
    name: "Ravi Teja",
    rank: "Mythic Legend",
    text: "The Aatma AI assistant helped me track my order in seconds. Very professional platform.",
    stars: 5,
    avatar: "RT"
  },
  {
    name: "Sanjay Kumar",
    rank: "Veteran Reseller",
    text: "As a B2B partner, I love the API integration. Uptime is 99% and support is excellent.",
    stars: 5,
    avatar: "SK"
  },
  {
    name: "Priyanka G.",
    rank: "Pro Gamer",
    text: "Finally a reliable site for MLBB Diamonds. The referral rewards are a great bonus!",
    stars: 4,
    avatar: "PG"
  }
];

export function ReviewCarousel() {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: true })
  );

  return (
    <section className="py-12 bg-background relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-10 space-y-2">
           <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">Squad <span className="text-primary">Intelligence</span></h2>
           <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest opacity-60 italic">Verified operator testimonials</p>
        </div>

        <Carousel
          plugins={[plugin.current]}
          className="w-full max-w-5xl mx-auto"
        >
          <CarouselContent className="-ml-4">
            {REVIEWS.map((review, i) => (
              <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="bg-card/50 border-white/5 h-full rounded-[2rem] hover:border-primary/20 transition-all group relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                      <Quote className="h-12 w-12 text-primary" />
                   </div>
                   <CardContent className="p-8 flex flex-col h-full space-y-6">
                      <div className="flex gap-1">
                         {Array.from({ length: 5 }).map((_, si) => (
                           <Star key={si} className={`h-3 w-3 ${si < review.stars ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} />
                         ))}
                      </div>
                      <p className="text-sm font-medium leading-relaxed text-white/80 flex-1 italic">
                        "{review.text}"
                      </p>
                      <div className="flex items-center gap-4 pt-4 border-t border-white/5">
                         <Avatar className="h-10 w-10 border border-white/10 shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">{review.avatar}</AvatarFallback>
                         </Avatar>
                         <div className="flex flex-col justify-center overflow-hidden">
                            <p className="text-xs font-bold text-white uppercase truncate">{review.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                               <ShieldCheck className="h-3 w-3 text-green-500 shrink-0" />
                               <span className="text-[9px] font-bold text-muted-foreground uppercase truncate">{review.rank}</span>
                            </div>
                         </div>
                      </div>
                   </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}
