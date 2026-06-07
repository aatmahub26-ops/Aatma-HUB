
"use client";

import Link from "next/link";
import { Gamepad2, Mail, Lock, User, ArrowRight, ShieldCheck, Loader2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    referralCode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast({ title: "Validation Error", description: "Email and password are required parameters.", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Logic Conflict", description: "Passwords do not match.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      // 1. Verify Referral Code if provided
      let referrerUid = null;
      if (formData.referralCode) {
        try {
          const q = query(collection(db, "users"), where("referralCode", "==", formData.referralCode.trim().toUpperCase()));
          const snap = await getDocs(q);
          if (snap.empty) {
            toast({ title: "Invalid Protocol", description: "The referral code entered does not exist in the HUB.", variant: "destructive" });
            setIsLoading(false);
            return;
          }
          referrerUid = snap.docs[0].id;
        } catch (ruleError: any) {
          console.error("Referral check permission error:", ruleError);
        }
      }

      // 2. Create the Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 3. Create user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        walletBalance: 0,
        totalDeposits: 0,
        totalSpent: 0,
        totalReferralEarnings: 0,
        totalOrders: 0,
        lifetimeRechargeAmount: 0,
        currentRank: "Recruit",
        referralCode: `AATMA-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        referredBy: referrerUid,
        role: "user",
        kycStatus: "None",
        kycVerified: false,
        createdAt: serverTimestamp(),
      });

      // 4. Create internal referral record if linked
      if (referrerUid) {
        await setDoc(doc(db, "referrals", user.uid), {
          referrerId: referrerUid,
          userId: user.uid,
          username: formData.firstName,
          earnings: 0,
          status: "Active",
          date: new Date().toISOString()
        });
      }

      toast({ title: "Protocol Initialized", description: "Account created successfully. Welcome to Aatma HUB." });
      
      // Set flag for Welcome Popup
      sessionStorage.setItem("show_welcome_popup", "true");
      
      router.push("/");
    } catch (error: any) {
      console.error("Signup error:", error);
      let errorMessage = error.message;
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This identity is already registered in the ecosystem.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Security protocol requires at least 6 characters.";
      } else if (error.message.includes('permissions')) {
        errorMessage = "Identity platform rejected the write request. Contact HQ.";
      }

      toast({ 
        title: "Signup Failure", 
        description: errorMessage, 
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
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/10 blur-[150px] rounded-full -z-10" />
        
        <Card className="w-full max-w-lg bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-secondary p-2 rounded-xl shadow-[0_0_20px_rgba(107,124,255,0.3)]">
                <Gamepad2 className="h-8 w-8 text-secondary-foreground" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold tracking-tighter uppercase">Join the Squad</CardTitle>
            <CardDescription className="text-muted-foreground">
              Register your identity to access premium gaming top-ups.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      className="pl-10 h-12 bg-black/40 border-white/10"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      className="pl-10 h-12 bg-black/40 border-white/10"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@example.com" 
                    className="pl-10 h-12 bg-black/40 border-white/10"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referralCode">Referral Code (Optional)</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="referralCode" 
                    placeholder="AATMA-XXXXXX" 
                    className="pl-10 h-12 bg-black/40 border-white/10 uppercase font-mono"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      type="password" 
                      className="pl-10 h-12 bg-black/40 border-white/10"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      className="pl-10 h-12 bg-black/40 border-white/10"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox id="terms" className="mt-1 border-white/20" required />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor="terms" className="text-xs text-muted-foreground font-medium leading-none cursor-pointer">
                    I agree to the <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  </label>
                </div>
              </div>
              
              <Button type="submit" disabled={isLoading} className="w-full h-14 font-bold neon-glow-hover transition-all bg-gradient-to-r from-primary to-secondary text-primary-foreground border-none text-lg uppercase tracking-tighter">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : "Initialize Identity"}
                {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
            
            <div className="flex items-center justify-center space-x-2 py-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span>Identity Node Protection Active</span>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-center w-full text-sm text-muted-foreground uppercase font-bold tracking-tight">
              Already have an account? <Link href="/login" className="text-primary hover:underline">Return to Hub</Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
