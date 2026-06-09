"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Plus, Search, Trash2, Edit3, Loader2, Sparkles, Wand2, Trophy, ListOrdered, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { generateGameGuide } from "@/ai/flows/generate-game-guide";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";

export default function AdminArticles() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [newArticle, setNewArticle] = useState({
    title: "",
    content: "",
    category: "Guide",
    gameId: "mlbb",
    tags: "",
  });

  useEffect(() => {
    const q = query(collection(db, "articles"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setArticles(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAiGenerate = async () => {
    if (!newArticle.title && !newArticle.gameId) {
      toast({ title: "Details Missing", description: "Enter a title or topic first.", variant: "destructive" });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateGameGuide({
        gameTitle: newArticle.gameId,
        category: newArticle.category as any,
        topic: newArticle.title || "Pro Player Strategy and Analysis",
        additionalDetails: "Focus on current meta, hero rankings, and tournament viability."
      });
      setNewArticle({
        ...newArticle,
        title: result.title,
        content: result.content,
        tags: result.tags.join(", ")
      });
      toast({ title: "AI Strategy Drafted", description: "Professional content ready for review." });
    } catch (error) {
      console.error(error);
      toast({ title: "AI Error", description: "Meta database sync failed.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!newArticle.title || !newArticle.content) {
      toast({ title: "Validation Error", description: "Admin payload cannot be empty.", variant: "destructive" });
      return;
    }
    setIsPublishing(true);
    try {
      await addDoc(collection(db, "articles"), {
        ...newArticle,
        authorId: "Admin",
        likesCount: 0,
        tags: newArticle.tags.split(",").map(t => t.trim()).filter(Boolean),
        createdAt: new Date().toISOString(),
        serverTimestamp: serverTimestamp(),
      });
      setNewArticle({ title: "", content: "", category: "Guide", gameId: "mlbb", tags: "" });
      toast({ title: "Article Published", description: "Strategy guide published to the HUB." });
    } catch (error: any) {
      toast({ title: "Transmission Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Declassify this guide?")) return;
    try {
      await deleteDoc(doc(db, "articles", id));
      toast({ title: "Removed", description: "Article purged from system." });
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const filteredArticles = articles.filter(a => a.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Content Management</h2>
          <p className="text-muted-foreground">Manage tier lists, builds, and tournament intel.</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-9 font-bold bg-primary text-primary-foreground">
              <Plus className="mr-2 h-4 w-4" />
              New Intel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-white/10">
            <DialogHeader>
              <DialogTitle className="text-2xl font-headline font-bold">Draft Gaming Strategy</DialogTitle>
              <DialogDescription>Use Aatma AI Pro to analyze meta and draft authoritative guides.</DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newArticle.category} onValueChange={(v) => setNewArticle({...newArticle, category: v})}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Guide">Pro Guide</SelectItem>
                      <SelectItem value="Build">Hero Build</SelectItem>
                      <SelectItem value="Tier List">Tier List</SelectItem>
                      <SelectItem value="News">Breaking News</SelectItem>
                      <SelectItem value="Tournament">Tournament Intel</SelectItem>
                      <SelectItem value="Leaks">Exclusive Leaks</SelectItem>
                      <SelectItem value="Patch">Patch Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Game</Label>
                  <Select value={newArticle.gameId} onValueChange={(v) => setNewArticle({...newArticle, gameId: v})}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mlbb">Mobile Legends</SelectItem>
                      <SelectItem value="bgmi">BGMI / PUBG</SelectItem>
                      <SelectItem value="free-fire">Free Fire</SelectItem>
                      <SelectItem value="valorant">Valorant</SelectItem>
                      <SelectItem value="codm">COD Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Article Headline</Label>
                <div className="flex gap-2">
                   <Input 
                    placeholder="e.g. Mythic Tier S-Rank Hero List" 
                    className="bg-black/40 border-white/10" 
                    value={newArticle.title}
                    onChange={(e) => setNewArticle({...newArticle, title: e.target.value})}
                  />
                  <Button 
                    variant="outline" 
                    className="border-primary/50 text-primary hover:bg-primary/10 font-bold shrink-0"
                    onClick={handleAiGenerate}
                    disabled={isGenerating}
                  >
                    {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    AI Analyze
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Article Content (Markdown)</Label>
                <Textarea 
                  className="min-h-[300px] bg-black/40 border-white/10 font-mono text-xs" 
                  placeholder="Write analysis here..." 
                  value={newArticle.content}
                  onChange={(e) => setNewArticle({...newArticle, content: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Discovery Tags (Comma separated)</Label>
                <Input 
                  placeholder="mythic, s-tier, counter, meta" 
                  className="bg-black/40 border-white/10" 
                  value={newArticle.tags}
                  onChange={(e) => setNewArticle({...newArticle, tags: e.target.value})}
                />
              </div>

              <Button className="w-full h-12 font-bold neon-glow" onClick={handlePublish} disabled={isPublishing}>
                {isPublishing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Article"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter intel database..." 
          className="pl-10 bg-card/50 border-white/5" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-6 py-4">Title</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Game</th>
                  <th className="px-6 py-4">Engagement</th>
                  <th className="px-6 py-4 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                ) : filteredArticles.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No articles available.</td></tr>
                ) : (
                  filteredArticles.map((art) => (
                    <tr key={art.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold max-w-xs truncate">{art.title}</td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-[10px] uppercase border-primary/20 text-primary">
                          {art.category}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold uppercase">{art.gameId}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
                           <Heart className="h-3 w-3 text-primary fill-primary" />
                           {art.likesCount || 0} Likes
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" asChild>
                          <Link href={`/community/${art.id}`} target="_blank"><BookOpen className="h-4 w-4" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(art.id)}>
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