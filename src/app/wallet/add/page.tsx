"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info, ArrowLeft, Loader2, QrCode, Copy, CreditCard, Smartphone, CheckCircle2, Zap, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, onSnapshot } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function AddFundsPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [txnId, setTxnId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState<"razorpay" | "phonepe" | "manual" | null>(null);
  const [isSandbox, setIsSandbox] = useState(true);

  const upiId = "aatmahub@upi";

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "system_settings", "gateways"), (d) => {
      if (d.exists()) setIsSandbox(d.data().sandboxMode);
    });
    return () => unsub();
  }, []);

  const handleRazorpayPayment = async () => {
    if (!user) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10) {
      toast({ title: "Invalid Amount", description: "Minimum recharge is ₹10", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Aatma HUB",
        description: `Wallet Recharge Protocol ${isSandbox ? '(SANDBOX)' : ''}`,
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                userId: user.uid,
                amount: numAmount,
              }),
            });

            const result = await verifyRes.json();
            if (result.success) {
              toast({ title: "Recharge Synchronized", description: "Your wallet balance updated instantly." });
              router.push("/wallet/success");
            } else {
              router.push("/wallet/failed");
            }
          } catch (e) {
            toast({ title: "Verification Failed", description: "Node error. Contact support.", variant: "destructive" });
          }
        },
        prefill: {
          name: `${profile?.firstName} ${profile?.lastName}`,
          email: user.email,
        },
        theme: {
          color: "#9E66FF",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      toast({ title: "API Node Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhonePePayment = async () => {
    if (!user || !amount) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/phonepe/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(amount), userId: user.uid, email: user.email }),
      });
      const result = await response.json();
      
      if (result.success) {
         toast({ title: "PhonePe Initialized", description: `Redirecting to payment gateway (${isSandbox ? 'UAT' : 'Live'})` });
         // Simulate redirect in development/sandbox
         setTimeout(() => {
           setIsSubmitting(false);
           router.push("/wallet"); // Fallback redirect
         }, 2000);
      }
    } catch (e: any) {
      toast({ title: "Gateway Error", description: e.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 10 || !txnId.trim()) {
      toast({ title: "Validation Error", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "deposit_requests"), {
        userId: user.uid,
        userEmail: user.email,
        amount: numAmount,
        utr: txnId,
        paymentMethod: "Manual UPI",
        status: "pending",
        createdAt: new Date().toISOString(),
      });
      toast({ title: "Request Submitted", description: "Audit squad will verify in 5-30 mins." });
      router.push("/wallet");
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-8 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase">Add Money</h1>
              <p className="text-muted-foreground text-sm uppercase font-bold tracking-widest opacity-60">Synchronize funds to digital HUB wallet</p>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-[10px] font-bold uppercase tracking-widest">
              <Link href="/wallet"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
            </Button>
          </div>

          <div className="space-y-8">
            {step === 1 && (
              <Card className="bg-card border-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                <CardHeader className="border-b border-white/5 bg-primary/5">
                  <div className="flex items-center justify-between">
                     <CardTitle className="font-headline font-bold text-lg uppercase tracking-tight">Step 1: Amount & Method</CardTitle>
                     {isSandbox && <Badge className="bg-orange-500 text-white border-none text-[8px]">SANDBOX ACTIVE</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Select Payload Amount</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[100, 500, 1000, 2000].map((val) => (
                        <Button 
                          key={val} 
                          variant={amount === val.toString() ? "default" : "outline"} 
                          className={`h-12 font-bold transition-all rounded-xl ${amount === val.toString() ? 'neon-glow' : 'border-white/5 bg-white/5'}`}
                          onClick={() => setAmount(val.toString())}
                        >
                          ₹{val}
                        </Button>
                      ))}
                    </div>
                    <div className="relative mt-4">
                      <span className="absolute left-4 top-3.5 text-lg font-bold text-primary">₹</span>
                      <Input 
                        placeholder="Other Amount" 
                        type="number"
                        className="h-14 pl-10 bg-black/40 border-white/10 text-xl font-bold rounded-xl" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Payment Protocol</Label>
                    <div className="grid grid-cols-1 gap-4">
                      {[
                        { id: 'razorpay', title: 'Instant Auto-Recharge', desc: 'Cards, Netbanking, UPI', icon: Zap, color: 'text-primary' },
                        { id: 'phonepe', title: 'PhonePe Direct', desc: 'High Speed Gateway', icon: Smartphone, color: 'text-blue-500' },
                        { id: 'manual', title: 'Manual UPI Transfer', desc: 'Verify via UTR Payload', icon: QrCode, color: 'text-orange-500' }
                      ].map((m) => (
                        <button 
                          key={m.id}
                          onClick={() => setMethod(m.id as any)}
                          className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all group ${method === m.id ? 'border-primary bg-primary/10' : 'border-white/5 bg-black/20 hover:border-white/10'}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-xl flex items-center justify-center transition-colors ${method === m.id ? 'bg-primary text-white' : 'bg-white/5 ' + m.color}`}>
                              <m.icon className="h-6 w-6 fill-current" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-white text-sm uppercase">{m.title}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">{m.desc}</p>
                            </div>
                          </div>
                          {method === m.id && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    className="w-full h-16 text-lg font-bold uppercase tracking-tighter rounded-2xl neon-glow" 
                    disabled={!amount || !method || isSubmitting}
                    onClick={() => {
                      if (method === 'razorpay') handleRazorpayPayment();
                      else if (method === 'phonepe') handlePhonePePayment();
                      else setStep(2);
                    }}
                  >
                    {isSubmitting ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Zap className="mr-2 h-6 w-6 fill-current" />}
                    {method === 'manual' ? `Next: Scan QR for ₹${amount}` : `Pay ₹${amount} Now`}
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && method === 'manual' && (
              <Card className="bg-card border-white/5 overflow-hidden animate-in fade-in slide-in-from-right-4">
                <CardHeader className="text-center border-b border-white/5 bg-orange-500/5">
                  <CardTitle className="font-headline font-bold text-lg uppercase tracking-tight">Step 2: Payment Proof</CardTitle>
                  <CardDescription>Scan QR and submit 12-digit UTR node.</CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                   <div className="text-center mb-8 space-y-4">
                    <div className="bg-white p-5 rounded-[2.5rem] inline-block shadow-2xl">
                      <QrCode className="w-48 h-48 text-black" />
                    </div>
                    <div className="p-4 bg-black/40 rounded-2xl border border-white/10 flex items-center justify-between max-w-sm mx-auto">
                      <div className="text-left">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Admin UPI Node</p>
                        <p className="font-mono font-bold text-orange-500 text-sm">{upiId}</p>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => { navigator.clipboard.writeText(upiId); toast({ title: "Copied" }); }}><Copy className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <form onSubmit={handleManualSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">UTR / Transaction ID</Label>
                      <Input placeholder="Enter 12 digit Ref No." className="h-14 bg-black/40 border-white/10 text-center font-mono text-xl tracking-widest" value={txnId} onChange={(e) => setTxnId(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full h-14 font-bold bg-orange-600 hover:bg-orange-700 text-white rounded-xl" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Execute Proof Sync"}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full text-[10px] uppercase font-bold" onClick={() => setStep(1)}>Go Back</Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
