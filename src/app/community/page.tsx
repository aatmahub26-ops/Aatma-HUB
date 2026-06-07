
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Flame, TrendingUp, Clock, BookOpen, Zap, Swords, Newspaper, Trophy, ListOrdered, Bot, Sparkles, Send, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, limit, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gamingStrategyAssistant } from "@/ai/flows/gaming-strategy-assistant";

export default function CommunityHub() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // AI Strategist State
  const [aiOpen, setAiOpen] = useState(false);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<any[]>([
    { role: 'bot', text: 'I am Aatma Pro. Ask me for hero counters, meta builds, or tournament analysis.' }
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    { name: "All", icon: BookOpen },
    { name: "Guide", icon: Zap },
    { name: "Build", icon: Swords },
    { name: "Tier List", icon: ListOrdered },
    { name: "News", icon: Newspaper },
    { name: "Leaks", icon: Flame },
    { name: "Tournament", icon: Trophy },
    { name: "Patch", icon: Clock },
  ];

  useEffect(() => {
    let q = query(collection(db, "articles"), orderBy("createdAt", "desc"), limit(12));
    
    if (activeCategory !== "All") {
      q = query(collection(db, "articles"), where("category", "==", activeCategory), orderBy("createdAt", "desc"), limit(12));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeCategory]);

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.gameId?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAiAsk = async () => {
    if (!aiInput.trim()) return;
    const msg = aiInput;
    setAiInput("");
    setAiMessages(prev => [...prev, { role: 'user', text: msg }]);
    setAiLoading(true);

    try {
      const result = await gamingStrategyAssistant({ gameId: "All Games", query: msg });
      setAiMessages(prev => [...prev, { role: 'bot', text: result.answer, tips: result.proTips }]);
    } catch (e) {
      setAiMessages(prev => [...prev, { role: 'bot', text: "Meta database temporarily offline. Try again later." }]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            
            {/* Hero Section with AI Integration */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 relative glass-card p-12 rounded-[3rem] border-primary/20 overflow-hidden flex flex-col justify-center min-h-[400px]">
                  <div className="absolute top-0 right-0 p-12 opacity-5">
                     <Flame className="h-64 w-64 text-primary" />
                  </div>
                  <div className="relative z-10 space-y-6">
                     <Badge className="bg-primary/20 text-primary border-primary/20 font-bold px-4 py-1">PRO GAMING HUB</Badge>
                     <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tighter uppercase leading-none">
                       MASTER THE <span className="text-gradient">META</span>
                     </h1>
                     <p className="text-muted-foreground text-lg md:text-xl max-w-xl">
                       Exclusive pro-player guides, tier lists, and tournament leaks from the global esports scene.
                     </p>
                     <div className="relative max-w-md">
                       <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                       <Input 
                         placeholder="Search for builds, tier lists, or news..." 
                         className="h-14 pl-12 bg-black/40 border-white/10 text-lg rounded-2xl"
                         value={searchQuery}
                         onChange={(e) => setSearchQuery(e.target.value)}
                       />
                     </div>
                  </div>
               </div>

               {/* AI Strategy Mini-Widget */}
               <Card className="bg-card border-primary/20 rounded-[3rem] overflow-hidden flex flex-col">
                  <CardHeader className="bg-primary/10 border-b border-white/5 pb-4">
                     <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center neon-glow">
                           <Bot className="text-primary-foreground h-6 w-6" />
                        </div>
                        <div>
                           <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">AI Strategist</CardTitle>
                           <p className="text-[10px] font-bold text-primary uppercase">Elite Meta Access</p>
                        </div>
                     </div>
                  </CardHeader>
                  <CardContent className="flex-1 p-0 flex flex-col h-[300px]">
                     <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                        <div className="space-y-4">
                           {aiMessages.map((m, i) => (
                              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                 <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted/50 border border-white/5'}`}>
                                    {m.text}
                                    {m.tips && (
                                      <div className="mt-2 pt-2 border-t border-white/10 space-y-1">
                                        {m.tips.map((t: string, ti: number) => (
                                          <div key={ti} className="flex gap-2 items-start text-[10px] text-primary">
                                            <Sparkles className="h-3 w-3 shrink-0 mt-0.5" />
                                            <span>{t}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                 </div>
                              </div>
                           ))}
                           {aiLoading && (
                             <div className="flex justify-start">
                               <Loader2 className="h-4 w-4 animate-spin text-primary" />
                             </div>
                           )}
                        </div>
                     </ScrollArea>
                     <div className="p-4 border-t border-white/5 flex gap-2">
                        <Input 
                          placeholder="Counter Martis?" 
                          className="h-10 bg-black/40 border-white/10 text-xs" 
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                        />
                        <Button size="icon" className="h-10 w-10 shrink-0" onClick={handleAiAsk} disabled={aiLoading}>
                           <Send className="h-4 w-4" />
                        </Button>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* Category Pills */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-4 scrollbar-hide">
               {categories.map((cat) => (
                 <Button 
                   key={cat.name}
                   variant={activeCategory === cat.name ? "default" : "outline"}
                   className={`h-11 rounded-full px-6 transition-all ${activeCategory === cat.name ? "neon-glow" : "border-white/10"}`}
                   onClick={() => setActiveCategory(cat.name)}
                 >
                   <cat.icon className="mr-2 h-4 w-4" />
                   {cat.name}
                 </Button>
               ))}
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-card/50 border-white/5 h-96 animate-pulse" />
                ))
              ) : filteredArticles.length === 0 ? (
                <div className="col-span-full py-20 text-center space-y-4">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground opacity-20" />
                  <h3 className="text-xl font-bold font-headline uppercase">No Strategy Found</h3>
                  <p className="text-muted-foreground">Admins are drafting new guides. Check back shortly.</p>
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const gamePlaceholder = PlaceHolderImages.find(img => img.id === article.gameId) || PlaceHolderImages[0];
                  return (
                    <Link key={article.id} href={`/community/${article.id}`}>
                      <Card className="bg-card/50 border-white/5 overflow-hidden hover:border-primary/50 transition-all duration-300 group h-full flex flex-col relative">
                        <div className="relative aspect-video overflow-hidden">
                          <Image 
                            src={article.imageUrl || gamePlaceholder.imageUrl} 
                            alt={article.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-none font-bold uppercase tracking-widest text-[10px]">
                            {article.category}
                          </Badge>
                          <div className="absolute bottom-4 left-4 flex gap-2">
                             <Badge className="bg-black/60 backdrop-blur-md border-white/10 text-[10px] uppercase font-bold">
                               {article.gameId}
                             </Badge>
                          </div>
                        </div>
                        <CardHeader className="flex-1">
                          <CardTitle className="font-headline font-bold text-xl group-hover:text-primary transition-colors line-clamp-2">
                            {article.title}
                          </CardTitle>
                          <CardDescription className="line-clamp-2 text-xs mt-2 opacity-60">
                            {article.content.substring(0, 100).replace(/[#*`]/g, '')}...
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0 border-t border-white/5 mt-4 p-4 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                             <span>Read More</span>
                             <Sparkles className="h-3 w-3" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })
              )}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
