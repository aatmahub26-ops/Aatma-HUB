
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";

export default function ResellerLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/reseller");
    } catch (error: any) {
      toast({ title: "Authentication Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 blur-[120px] rounded-full -z-10" />
        
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-2 rounded-xl">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold tracking-tighter uppercase">B2B Login</CardTitle>
            <CardDescription className="text-muted-foreground">Access your corporate distribution account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Work Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="email" placeholder="business@email.com" className="pl-10 h-12" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pl-10 h-12" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full h-12 font-bold neon-glow text-lg uppercase tracking-tighter">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sign In to B2B HUB"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
             <p className="text-center text-xs text-muted-foreground">
                Don't have a business account? <Link href="/reseller/signup" className="text-primary font-bold hover:underline">Apply Here</Link>
             </p>
             <Link href="/login" className="text-center text-[10px] uppercase font-bold text-muted-foreground hover:text-white">Switch to Retail Portal</Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
