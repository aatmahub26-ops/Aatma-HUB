"use client";

import Link from "next/link";
import { Gamepad2, Mail, ArrowLeft, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setIsSent(true);
      toast({ title: "Signal Deployed", description: "Recovery instructions transmitted to your inbox." });
    } catch (error: any) {
      toast({ 
        title: "Transmission Error", 
        description: error.message || "Failed to initiate recovery protocol.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full -z-10" />
        
        <Card className="w-full max-w-md bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl rounded-[2rem]">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-muted p-3 rounded-2xl border border-white/5">
                <Gamepad2 className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold tracking-tighter uppercase">RECOVER ACCESS</CardTitle>
            <CardDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest">
              {isSent 
                ? "Check your email for reset instructions" 
                : "Lost your way? Enter your email and we'll help you back in."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isSent ? (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[10px] uppercase font-bold tracking-widest ml-1">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="name@example.com" 
                      className="pl-10 h-12 bg-black/40 border-white/10" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full h-14 text-lg font-bold neon-glow uppercase tracking-tighter rounded-xl"
                >
                  {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Initiate Recovery"}
                  {!isLoading && <Send className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            ) : (
              <div className="p-8 bg-primary/5 border border-primary/20 rounded-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
                <div className="h-16 w-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto text-primary">
                  <Send className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                   <p className="text-sm font-bold text-white uppercase tracking-tight">Transmission Sent</p>
                   <p className="text-xs text-muted-foreground leading-relaxed">Follow the logic link in your inbox to reset your authentication credentials.</p>
                </div>
                <Button variant="outline" className="w-full h-10 border-white/10 font-bold uppercase text-[10px]" onClick={() => setIsSent(false)}>
                  Retry Node
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/login" className="flex items-center justify-center w-full text-[10px] uppercase text-muted-foreground hover:text-primary transition-colors font-bold tracking-widest">
              <ArrowLeft className="mr-2 h-3 w-3" />
              Back to HUB Entrance
            </Link>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}