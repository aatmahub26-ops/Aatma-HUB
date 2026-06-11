"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, QrCode, CreditCard, Smartphone, ShieldCheck, Zap, Loader2, ArrowLeft, Send, CheckCircle2, Copy, Info, Tag, Star } from "lucide-react";
import { doc, getDoc, runTransaction, collection, serverTimestamp, increment, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { GAMES } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { RESELLER_LEVELS } from "@/lib/reseller-levels";
import { getUserRank } from "@/lib/ranks";

type PaymentMethod = 'wallet' | 'upi' | 'razorpay' | 'phonepe';

function CheckoutContent() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  
  const productId = searchParams.get('productId');
  const packageId = searchParams.get('packageId');
  const playerGameId = searchParams.get('playerGameId');
  const playerServerId = searchParams.get('playerServerId');

  const [product, setProduct] = useState<any>(null);
  const [pkg, setPkg] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('wallet');
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [utr, setUtr] = useState("");

  const upiId = "aatmahub@upi";

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchProduct = async () => {
      if (!productId || !packageId) {
        router.push("/catalog");
        return;
      }

      try {
        const docRef = doc(db, "catalog", productId);
        const docSnap = await getDoc(docRef);
        let prodData = docSnap.exists() ? docSnap.data() : GAMES.find(g => g.id === productId);
        
        if (prodData) {
          setProduct(prodData);
          const foundPkg = prodData.packages.find((p: any) => p.id === packageId);
          setPkg(foundPkg);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, packageId, user, router]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    try {
      const code = couponCode.toUpperCase().trim();
      const couponRef = doc(db, "coupons", code);
      const couponSnap = await getDoc(couponRef);

      if (!couponSnap.exists()) {
        toast({ title: "Invalid Protocol", description: "This coupon code does not exist.", variant: "destructive" });
        return;
      }

      const cData = couponSnap.data();
      if (!cData.isEnabled) {
        toast({ title: "Protocol Offline", description: "This coupon is currently inactive.", variant: "destructive" });
        return;
      }

      if (pkg.price < cData.minAmount) {
        toast({ title: "Threshold Error", description: `Minimum order of ₹${cData.minAmount} required.`, variant: "destructive" });
        return;
      }

      const usageRef = doc(db, "users", user!.uid, "user_coupons", code);
      const usageSnap = await getDoc(usageRef);
      if (usageSnap.exists()) {
        toast({ title: "Usage Breach", description: "You have already deployed this coupon.", variant: "destructive" });
        return;
      }

      setAppliedCoupon({ ...cData, id: code });
      toast({ title: "Coupon Synced", description: "Discount applied to order total." });
    } catch (e: any) {
      toast({ title: "Sync Error", description: e.message, variant: "destructive" });
    }
  };

  const calculateDiscount = () => {
    if (!appliedCoupon || !pkg) return 0;
    let disc = 0;
    if (appliedCoupon.type === 'percentage') {
      disc = (pkg.price * appliedCoupon.value) / 100;
    } else {
      disc = appliedCoupon.value;
    }
    return Math.min(disc, appliedCoupon.maxDiscount || disc);
  };

  const discount = calculateDiscount();
  const finalPrice = pkg ? Math.max(0, pkg.price - discount) : 0;

  const handleCheckout = async () => {
    if (!profile || !pkg || !user) return;
    if (!playerGameId || !playerServerId) { toast({ title: "Verification Required", description: "Please verify Player ID before checkout.", variant: "destructive" }); return; }
    
    if (profile.walletBalance < finalPrice) {
      toast({ title: "Insufficient Funds", description: "Please load funds to your wallet.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User node not found.");

        const userData = userSnap.data();
        const currentBalance = userData.walletBalance || 0;
        const currentSpent = userData.totalSpent || 0;
        const currentLifetime = userData.lifetimeRechargeAmount || 0;

        if (currentBalance < finalPrice) throw new Error("Balance insufficient at execution time.");

        // 1. VIP & Points Logic
        const rank = getUserRank(currentLifetime);


        if (appliedCoupon) {
          const usageRef = doc(db, "users", user.uid, "user_coupons", appliedCoupon.id);
          transaction.set(usageRef, { usedAt: new Date().toISOString() });
        }

        const orderRef = doc(collection(db, "orders"));
        const orderData = {
          userId: user.uid,
          userEmail: user.email,
          userName: `${profile.firstName} ${profile.lastName}`,
          productId: product.id,
          productName: product.name,
          packageId: pkg.id,
          packageName: pkg.amount,
          price: finalPrice,
          originalPrice: pkg.price,
          discount: discount,
          couponCode: appliedCoupon?.id || null,
          playerGameId,
          playerServerId: playerServerId || null,
          status: "Pending",
          fulfillmentType: product.fulfillmentType || "auto",
          category: product.category || "Games",
          createdAt: new Date().toISOString(),
          paymentMethod: paymentMethod
        };
        transaction.set(orderRef, orderData);

        const txnRef = doc(collection(db, "transactions"));
        transaction.set(txnRef, {
          userId: user.uid,
          amount: finalPrice,
          type: "Debit",
          description: `Order Protocol: ${product.name}`,
          date: new Date().toISOString(),
          status: "Success",
          reference: orderRef.id
        });

      });

      toast({ title: "Order Successful", description: "Dispatch protocol initiated. Order created successfully." });
      router.push("/orders");
    } catch (e: any) {
      toast({ title: "Checkout Error", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="animate-spin text-primary" /></div>;
  if (!product || !pkg) return <div className="p-20 text-center font-headline uppercase opacity-20">Protocol Node Data Error.</div>;

  const resolvedImg = product.imageUrl?.startsWith('http') 
    ? product.imageUrl 
    : `/logos/${product.imageUrl || product.image || 'default'}.png`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-6 md:py-12">
        <div className="container mx-auto px-4 max-w-6xl pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
             <div className="space-y-1">
                <h1 className="text-3xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-none">Hub <span className="text-primary">Checkout</span></h1>
                <p className="text-muted-foreground uppercase text-[9px] font-bold tracking-widest opacity-60">Finalize your digital dispatch protocol</p>
             </div>
             <Button variant="ghost" onClick={() => router.back()} className="text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded-xl h-10">
                <ArrowLeft className="mr-2 h-4 w-4" /> Re-calibrate Selection
             </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-8 space-y-8">
               <Card className="bg-card/50 border-white/5 rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-white/5 border-b border-white/5 p-6 md:p-8">
                     <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Dispatch Summary
                     </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8">
                     <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8">
                        <div className="relative h-24 w-24 md:h-32 md:w-32 rounded-3xl overflow-hidden border border-white/10 shrink-0 bg-black/40 flex items-center justify-center">
                           <Image src={resolvedImg} alt={product.name} fill className="object-contain p-4" />
                        </div>
                        <div className="flex-1 space-y-4 text-center sm:text-left">
                           <div>
                              <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase tracking-widest px-3 h-4 mb-2">{product.name}</Badge>
                              <h3 className="font-bold text-2xl md:text-3xl leading-none uppercase tracking-tight">{pkg.amount}</h3>
                           </div>
                           <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto sm:mx-0">
                              <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                 <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Player ID</p>
                                 <p className="font-bold text-white uppercase text-xs truncate">{playerGameId}</p>
                              </div>
                              {playerServerId && (
                                <div className="bg-black/40 p-3 rounded-2xl border border-white/5">
                                   <p className="text-[8px] font-bold uppercase text-muted-foreground tracking-widest">Zone / Server</p>
                                   <p className="font-bold text-white uppercase text-xs truncate">{playerServerId}</p>
                                </div>
                              )}
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground px-4">Yield Optimization</h3>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 space-y-2">
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                             <Tag className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground" />
                             <Input 
                               placeholder="INPUT PROTOCOL CODE" 
                               className="h-12 pl-12 bg-black/40 border-white/10 font-mono uppercase" 
                               value={couponCode}
                               onChange={(e) => setCouponCode(e.target.value)}
                             />
                          </div>
                          <Button className="h-12 px-8 font-bold uppercase text-xs" variant="secondary" onClick={handleApplyCoupon}>Apply</Button>
                       </div>
                       {appliedCoupon && (
                         <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <CheckCircle2 className="h-4 w-4 text-green-500" />
                               <p className="text-[10px] font-bold text-white uppercase">Protocol {appliedCoupon.code} Active: -₹{discount}</p>
                            </div>
                            <button onClick={() => setAppliedCoupon(null)} className="text-[8px] font-bold text-destructive uppercase hover:underline">Remove</button>
                         </div>
                       )}
                    </div>
                    
                    <Card className="bg-primary/5 border-primary/20 md:w-64 p-4 rounded-2xl flex items-center gap-4">
                       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <Star className="h-5 w-5 fill-current" />
                       </div>
                       <div>
                          <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Estimated Rewards</p>
                          <p className="text-sm font-bold text-white uppercase">{Math.floor((finalPrice / 10) * getUserRank(profile?.lifetimeRechargeAmount || 0).pointMultiplier)} HUB Points</p>
                       </div>
                    </Card>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-[10px] font-headline font-bold uppercase tracking-widest text-muted-foreground px-4">Payment Protocol</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <PaymentMethodCard id="wallet" icon={Wallet} title="Hub Wallet" desc={`₹${profile?.walletBalance?.toFixed(2) || "0.00"}`} active={paymentMethod === 'wallet'} onClick={() => setPaymentMethod('wallet')} />
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
               <Card className="bg-card border-white/5 rounded-[2.5rem] overflow-hidden sticky top-24">
                  <CardHeader className="bg-white/5 border-b border-white/5 p-6 md:p-8">
                     <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-primary">Intelligence Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 space-y-8">
                     <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Payload Price</span>
                           <span className="font-bold text-white">₹{pkg.price}</span>
                        </div>
                        {discount > 0 && (
                          <div className="flex justify-between items-center text-sm">
                             <span className="text-green-500 uppercase font-bold tracking-widest text-[9px]">Coupon Yield</span>
                             <span className="font-bold text-green-500">-₹{discount}</span>
                          </div>
                        )}
                        <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                           <span className="text-[10px] font-headline font-bold uppercase text-muted-foreground">Total Payload</span>
                           <span className="text-4xl md:text-5xl font-headline font-bold text-primary tracking-tighter">₹{finalPrice}</span>
                        </div>
                     </div>

                     <Button 
                        className="w-full h-16 md:h-20 font-bold neon-glow text-lg md:text-xl uppercase tracking-tighter rounded-[1.5rem]" 
                        disabled={isProcessing || (paymentMethod === 'wallet' && (profile?.walletBalance || 0) < finalPrice)}
                        onClick={handleCheckout}
                     >
                        {isProcessing ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : <><Send className="mr-3 h-6 w-6" /> Place Order</>}
                     </Button>
                  </CardContent>
                  <CardFooter className="bg-primary/5 p-4 flex items-center justify-center gap-3 text-primary">
                     <ShieldCheck className="h-4 w-4" />
                     <span className="text-[8px] font-bold uppercase tracking-widest">Protocol Secured by Aatma HQ</span>
                  </CardFooter>
               </Card>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function PaymentMethodCard({ id, icon: Icon, title, desc, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 p-4 rounded-[1.5rem] border-2 transition-all text-left relative group ${active ? "border-primary bg-primary/10 shadow-[0_0_20px_rgba(158,102,255,0.15)]" : "border-white/5 bg-black/20 hover:border-white/20"}`}>
       <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-primary text-white' : 'bg-white/5 ' + (id === 'wallet' ? 'text-primary' : 'text-orange-500')}`}><Icon className="h-5 w-5" /></div>
       <div className="overflow-hidden">
          <p className={`text-[10px] font-bold uppercase leading-none mb-1 ${active ? 'text-white' : 'text-muted-foreground'}`}>{title}</p>
          <p className={`text-[8px] font-bold uppercase tracking-widest truncate ${active ? 'text-primary' : 'text-muted-foreground/40'}`}>{desc}</p>
       </div>
       {active && <div className="absolute top-3 right-3 animate-in zoom-in"><CheckCircle2 className="h-3.5 w-3.5 text-primary" /></div>}
    </button>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  );
}
