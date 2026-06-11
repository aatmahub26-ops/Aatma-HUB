
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useCart, CartItem } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShoppingCart, Trash2, Plus, Minus, Loader2, ArrowRight, Gamepad2, ShieldCheck, Zap, ArrowLeft, Wallet, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, writeBatch, doc, increment, runTransaction, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { RESELLER_LEVELS } from "@/lib/reseller-levels";

export default function CartPage() {
  const { items, itemCount, totalPrice, updateQuantity, removeFromCart, clearCart, loading } = useCart();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (!user || !profile) {
      toast({ title: "Authentication Node Inactive", description: "Sign in to complete your order protocol.", variant: "destructive" });
      router.push("/login");
      return;
    }

    if (profile.walletBalance < totalPrice) {
      toast({ 
        title: "Insufficient Liquidity", 
        description: `Your balance (₹${profile.walletBalance}) is lower than the cart total (₹${totalPrice}).`, 
        variant: "destructive" 
      });
      router.push("/wallet/add");
      return;
    }

    setIsCheckingOut(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error("User node not found.");

        const userData = userSnap.data();
        const currentBalance = userData.walletBalance || 0;
        const currentSpent = userData.totalSpent || 0;

        // 1. Deduct Balance & Update Platform Stats
        transaction.update(userRef, {
          walletBalance: currentBalance - totalPrice,
          totalSpent: currentSpent + totalPrice,
          totalOrders: increment(items.length)
        });


        // 3. Create Orders
        for (const item of items) {
          const isManual = item.productId.includes('netflix') || item.productId.includes('instagram') || item.productId.includes('youtube') || item.productId.includes('telegram');
          const category = item.productId.includes('netflix') || item.productId.includes('prime') ? 'OTT Services' : 
                           item.productId.includes('instagram') || item.productId.includes('youtube') ? 'Social Media' : 'Games';
          
          const orderData = {
            userId: user.uid,
            userEmail: user.email,
            userName: `${profile.firstName} ${profile.lastName}`,
            productId: item.productId,
            productName: item.productName,
            packageId: item.packageId,
            packageName: item.packageName,
            price: item.price,
            quantity: item.quantity,
            playerGameId: item.playerGameId,
            playerServerId: item.playerServerId || null,
            extraData: item.extraData || null, // NEW: Capture all dynamic fields in order
            status: "Pending",
            fulfillmentType: isManual ? "manual" : "auto",
            category: category,
            createdAt: new Date().toISOString(),
            paymentMethod: 'wallet'
          };

          const orderRef = doc(collection(db, "orders"));
          transaction.set(orderRef, orderData);
        }

        // 4. Log Primary Wallet Transaction
        const txnRef = doc(collection(db, "wallet_transactions"));
        transaction.set(txnRef, {
          userId: user.uid,
          amount: totalPrice,
          type: "Debit",
          description: `Order Protocol: ${items.length} Items`,
          date: new Date().toISOString(),
          status: "Success"
        });
      }).catch(async (serverError) => {
          const permissionError = new FirestorePermissionError({
            path: 'cart_checkout_transaction',
            operation: 'write',
            requestResourceData: { totalPrice, items: items.length }
          });
          errorEmitter.emit('permission-error', permissionError);
          throw serverError;
      });

      await clearCart();
      toast({ title: "Protocol Initiated", description: "Your dispatches have been queued for processing. Yield synced." });
      router.push("/orders");
    } catch (e: any) {
      toast({ title: "Checkout Error", description: e.message, variant: "destructive" });
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
             <div className="space-y-1">
                <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter uppercase leading-none">Hub <span className="text-primary">Cart</span></h1>
                <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest opacity-60">Review your gaming and digital payloads</p>
             </div>
             <Button variant="ghost" asChild className="text-[10px] font-bold uppercase tracking-widest border border-white/5 rounded-xl px-6 h-11">
                <Link href="/catalog"><ArrowLeft className="mr-2 h-4 w-4" /> Expand Inventory</Link>
             </Button>
          </div>

          {items.length === 0 ? (
            <Card className="bg-card/30 border-white/5 border-dashed p-20 text-center space-y-6 rounded-[3rem]">
               <div className="h-24 w-24 bg-muted/20 rounded-full flex items-center justify-center mx-auto border border-white/5">
                  <ShoppingCart className="h-10 w-10 text-muted-foreground opacity-20" />
               </div>
               <div className="space-y-2">
                  <h2 className="text-2xl font-headline font-bold uppercase">Inventory Empty</h2>
                  <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest opacity-60">No dispatch protocols added yet.</p>
               </div>
               <Button size="lg" className="neon-glow font-bold h-16 px-12 rounded-2xl uppercase tracking-tighter text-lg" asChild>
                  <Link href="/catalog">Go to Marketplace</Link>
               </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-20">
               <div className="lg:col-span-8 space-y-4">
                  {items.map((item) => (
                    <Card key={item.id} className="bg-card/50 border-white/5 overflow-hidden group hover:border-primary/30 transition-all rounded-[2rem]">
                      <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative h-24 w-32 rounded-2xl overflow-hidden border border-white/5 shrink-0 bg-black/40 flex items-center justify-center">
                            <Gamepad2 className="h-8 w-8 text-primary opacity-50" />
                         </div>
                         <div className="flex-1 space-y-2 text-center sm:text-left">
                            <Badge className="bg-primary/10 text-primary border-none text-[8px] font-bold uppercase tracking-widest px-3 h-4">{item.productName}</Badge>
                            <h3 className="font-bold text-xl leading-tight uppercase tracking-tight">{item.packageName}</h3>
                            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-3 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                               <span className="text-white">ID: {item.playerGameId}</span>
                               {item.playerServerId && <span className="border-l border-white/10 pl-3">Zone: {item.playerServerId}</span>}
                            </div>
                         </div>
                         <div className="flex items-center gap-4 bg-black/40 p-2 rounded-2xl border border-white/5">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                            <span className="font-headline font-bold text-xl w-8 text-center">{item.quantity}</span>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-primary" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                         </div>
                         <div className="text-right min-w-[100px]">
                            <p className="text-2xl font-headline font-bold text-white">₹{item.price * item.quantity}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-[9px] font-bold uppercase text-destructive hover:underline mt-2 tracking-widest">Remove</button>
                         </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="ghost" className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-4 h-10 hover:text-destructive" onClick={clearCart}>
                     <Trash2 className="mr-2 h-4 w-4" /> Wipe Hub Cart
                  </Button>
               </div>

               <div className="lg:col-span-4 space-y-6">
                  <Card className="bg-card border-white/5 rounded-[2.5rem] overflow-hidden sticky top-24">
                     <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                        <CardTitle className="text-xs font-headline font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                           <Zap className="h-4 w-4" />
                           Checkout Intelligence
                        </CardTitle>
                     </CardHeader>
                     <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Items</span>
                              <span className="font-bold text-white">{itemCount}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Platform Fee</span>
                              <span className="text-green-500 font-bold uppercase text-[9px]">₹0.00</span>
                           </div>
                           <div className="pt-6 border-t border-white/5 flex justify-between items-end">
                              <span className="text-[10px] font-headline font-bold uppercase text-muted-foreground">Total Payload</span>
                              <span className="text-5xl font-headline font-bold text-primary tracking-tighter">₹{totalPrice}</span>
                           </div>
                        </div>

                        <div className="bg-muted/20 p-6 rounded-[1.5rem] border border-white/5 space-y-2">
                           <div className="flex items-center justify-between">
                              <p className="text-[9px] font-bold uppercase text-muted-foreground">Hub Wallet Balance</p>
                              <Badge className="bg-green-500/10 text-green-500 border-none text-[8px] h-3">Synced</Badge>
                           </div>
                           <p className="text-2xl font-headline font-bold text-white">₹{profile?.walletBalance?.toFixed(2) || "0.00"}</p>
                           {profile && profile.walletBalance < totalPrice && (
                             <p className="text-[9px] text-destructive font-bold uppercase pt-1">Insufficient Liquidity. Please recharge.</p>
                           )}
                        </div>

                        <Button 
                          className="w-full h-20 font-bold neon-glow text-xl uppercase tracking-tighter rounded-[1.5rem]" 
                          disabled={isCheckingOut || items.length === 0 || (profile?.walletBalance || 0) < totalPrice}
                          onClick={handleCheckout}
                        >
                           {isCheckingOut ? (
                             <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> Synchronizing...</>
                           ) : (
                             <>Finalize Dispatch <Send className="ml-3 h-6 w-6" /></>
                           )}
                        </Button>
                     </CardContent>
                     <CardFooter className="bg-primary/5 p-6 flex items-center justify-center gap-4 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="text-[9px] font-bold uppercase tracking-widest">Secure AES-256 Transaction Node</span>
                     </CardFooter>
                  </Card>
               </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
