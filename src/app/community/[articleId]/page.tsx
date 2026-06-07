
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { doc, getDoc, setDoc, deleteDoc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, User, Tag, Share2, Loader2, BookOpen, Heart, Bookmark, Swords, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ArticleDetail() {
  const params = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [interactionLoading, setInteractionLoading] = useState(false);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!params.articleId) return;
      try {
        const docRef = doc(db, "articles", params.articleId as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setArticle({ id: docSnap.id, ...docSnap.data() });
          
          if (user) {
             const likeSnap = await getDoc(doc(db, "article_likes", params.articleId as string, "users", user.uid));
             const bookmarkSnap = await getDoc(doc(db, "bookmarks", user.uid, "user_bookmarks", params.articleId as string));
             setIsLiked(likeSnap.exists());
             setIsBookmarked(bookmarkSnap.exists());
          }
        }
      } catch (error) {
        console.error("Error fetching article:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [params.articleId, user]);

  const handleLike = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Sign in to like strategy guides.", variant: "destructive" });
      return;
    }
    setInteractionLoading(true);
    try {
      const likeRef = doc(db, "article_likes", article.id, "users", user.uid);
      const articleRef = doc(db, "articles", article.id);
      
      if (isLiked) {
        await deleteDoc(likeRef);
        await updateDoc(articleRef, { likesCount: increment(-1) });
        setIsLiked(false);
      } else {
        await setDoc(likeRef, { likedAt: new Date().toISOString() });
        await updateDoc(articleRef, { likesCount: increment(1) });
        setIsLiked(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInteractionLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast({ title: "Login Required", description: "Sign in to bookmark guides.", variant: "destructive" });
      return;
    }
    setInteractionLoading(true);
    try {
      const bookmarkRef = doc(db, "bookmarks", user.uid, "user_bookmarks", article.id);
      if (isBookmarked) {
        await deleteDoc(bookmarkRef);
        setIsBookmarked(false);
        toast({ title: "Removed", description: "Guide removed from your bookmarks." });
      } else {
        await setDoc(bookmarkRef, {
          articleId: article.id,
          articleTitle: article.title,
          gameId: article.gameId,
          savedAt: new Date().toISOString()
        });
        setIsBookmarked(true);
        toast({ title: "Bookmarked!", description: "Guide saved to your player profile." });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setInteractionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-background space-y-4">
        <h1 className="text-2xl font-bold font-headline uppercase">Content logic not found</h1>
        <Button asChild>
          <Link href="/community">Back to Hub</Link>
        </Button>
      </div>
    );
  }

  const gamePlaceholder = PlaceHolderImages.find(img => img.id === article.gameId) || PlaceHolderImages[0];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Article Header */}
        <div className="relative h-[65vh] w-full">
           <Image 
             src={article.imageUrl || gamePlaceholder.imageUrl} 
             alt={article.title}
             fill
             className="object-cover"
             priority
           />
           <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
           <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
              <div className="container mx-auto max-w-4xl space-y-6">
                 <div className="flex justify-between items-center">
                    <Button variant="ghost" asChild className="text-white hover:bg-white/10">
                      <Link href="/community">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Community Hub
                      </Link>
                    </Button>
                    <div className="flex gap-2">
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className={`rounded-full h-10 px-4 font-bold ${isLiked ? 'bg-primary text-primary-foreground' : 'bg-black/60 backdrop-blur-md'}`}
                         onClick={handleLike}
                         disabled={interactionLoading}
                       >
                          <Heart className={`mr-2 h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                          {article.likesCount || 0}
                       </Button>
                       <Button 
                         variant="secondary" 
                         size="sm" 
                         className={`rounded-full h-10 px-4 font-bold ${isBookmarked ? 'bg-secondary text-secondary-foreground' : 'bg-black/60 backdrop-blur-md'}`}
                         onClick={handleBookmark}
                         disabled={interactionLoading}
                       >
                          <Bookmark className={`mr-2 h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                          {isBookmarked ? 'Saved' : 'Save'}
                       </Button>
                    </div>
                 </div>
                 <div className="flex items-center space-x-4">
                    <Badge className="bg-primary text-primary-foreground font-bold px-4 py-1 uppercase tracking-widest">{article.category}</Badge>
                    <Badge variant="outline" className="border-white/20 text-white font-bold px-4 py-1 uppercase">{article.gameId}</Badge>
                 </div>
                 <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter text-white uppercase leading-tight">
                   {article.title}
                 </h1>
                 <div className="flex flex-wrap items-center gap-6 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-primary" />
                      <span>{article.authorId === 'Admin' ? 'Aatma Pro Analyst' : 'Community Author'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-4 max-w-4xl py-16">
           <div className="glass-card p-8 md:p-12 rounded-[3rem] border-white/5 space-y-12">
              
              <div className="prose prose-invert prose-primary max-w-none">
                 <div className="whitespace-pre-wrap text-lg leading-relaxed text-muted-foreground font-medium">
                   {article.content}
                 </div>
              </div>

              {/* Interaction Footer */}
              <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                       <Swords className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                       <p className="text-xs font-bold uppercase tracking-widest">Master this Guide</p>
                       <p className="text-[10px] text-muted-foreground">Elite players bookmark important builds.</p>
                    </div>
                 </div>
                 <div className="flex gap-4">
                    <Button variant="outline" className="rounded-full h-12 px-8 border-white/10 font-bold uppercase tracking-widest text-xs" onClick={() => {
                       navigator.share({ title: article.title, url: window.location.href });
                    }}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share Intel
                    </Button>
                 </div>
              </div>

           </div>

           {/* Call to Action */}
           <div className="mt-20 relative glass-card p-12 rounded-[3rem] border-primary/30 overflow-hidden text-center">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <Sparkles className="h-32 w-32 text-primary" />
              </div>
              <h2 className="text-3xl font-headline font-bold uppercase mb-4">Level up your <span className="text-primary">{article.gameId}</span> Account</h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">Equip your account with the best top-ups and exclusive season passes today.</p>
              <Button size="lg" className="neon-glow h-16 px-12 font-bold text-xl uppercase tracking-tighter" asChild>
                <Link href={`/catalog/${article.gameId}`}>
                  View {article.gameId} Shop
                </Link>
              </Button>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
