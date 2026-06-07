
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileText, Zap, Loader2, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, where, doc, runTransaction, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ResellerBulk() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(query(collection(db, "catalog"), where("isEnabled", "==", true)), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleBulkDispatch = async () => {
    if (!selectedProduct || !selectedPkg || !input.trim()) {
      toast({ title: "Configuration Error", description: "Select product, package, and provide player IDs.", variant: "destructive" });
      return;
    }

    const ids = input.split('\n').map(id => id.trim()).filter(Boolean);
    const product = products.find(p => p.id === selectedProduct);
    const pkg = product.packages.find((p: any) => p.id === selectedPkg);
    const totalCost = ids.length * pkg.price;

    if (!user || (profile?.walletBalance || 0) < totalCost) {
      toast({ title: "Insufficient Funds", description: "B2B wallet balance too low for this dispatch.", variant: "destructive" });
      return;
    }

    setIsProcessing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error("Partner node not found.");
        const currentBalance = userSnap.data().walletBalance || 0;
        
        if (currentBalance < totalCost) throw new Error("Insufficient liquidity for bulk protocol.");

        // 1. Deduct Balance & Sync Stats
        transaction.update(userRef, { 
          walletBalance: increment(-totalCost),
          totalSpent: increment(totalCost),
          totalOrders: increment(ids.length),
          lifetimeVolume: increment(totalCost)
        });

        // 2. Queue Orders
        ids.forEach(id => {
          const orderRef = doc(collection(db, "orders"));
          transaction.set(orderRef, {
            userId: user.uid,
            userEmail: user.email,
            userName: `${profile?.firstName || ''} ${profile?.lastName || ''}`,
            productId: product.id,
            productName: product.name,
            packageId: pkg.id,
            packageName: pkg.amount,
            price: pkg.price,
            playerGameId: id,
            status: "Pending",
            createdAt: new Date().toISOString(),
            isBulk: true,
            paymentMethod: 'wallet'
          });
        });

        // 3. Log Financial Signal
        const txnRef = doc(collection(db, "wallet_transactions"));
        transaction.set(txnRef, {
          userId: user.uid,
          amount: totalCost,
          type: "Debit",
          description: `Bulk Dispatch: ${ids.length} items (${product.name})`,
          date: new Date().toISOString(),
          status: "Success"
        });
      });

      toast({ title: "Bulk Intake Success", description: `${ids.length} orders queued for fulfillment. Balance synchronized.` });
      setInput("");
    } catch (e: any) {
      toast({ title: "Dispatch Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="space-y-1">
        <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Bulk Intake Portal</h2>
        <p className="text-muted-foreground">High-speed dispatch node for high-volume distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <Card className="bg-card border-white/5">
            <CardHeader className="bg-white/5 border-b border-white/5">
              <CardTitle className="text-xs uppercase font-bold tracking-widest text-primary">Target Protocol</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>Product Selection</Label>
                <Select value={selectedProduct || ""} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="bg-black/40 border-white/10">
                    <SelectValue placeholder="Select Game/Service" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProduct && (
                <div className="space-y-2">
                  <Label>Package Node</Label>
                  <Select value={selectedPkg || ""} onValueChange={setSelectedPkg}>
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="Select Layer" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.find(p => p.id === selectedProduct)?.packages.map((pkg: any) => (
                        <SelectItem key={pkg.id} value={pkg.id}>{pkg.amount} - ₹{pkg.price}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20 border-dashed">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Check</span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">
                Ensure IDs are 100% correct. Total dispatch cost will be deducted from your B2B wallet instantly upon transmission.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-8">
          <Card className="bg-card border-white/5 h-full flex flex-col">
            <CardHeader className="bg-black/40 border-b border-white/5 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                ID Payload Buffer
              </CardTitle>
              <Badge variant="outline" className="text-[10px] border-white/10 uppercase">Paste Multiple IDs (One per line)</Badge>
            </CardHeader>
            <CardContent className="flex-1 p-6 flex flex-col gap-6">
              <Textarea 
                placeholder="123456789&#10;987654321&#10;512345678..."
                className="flex-1 min-h-[300px] bg-black/40 border-white/10 font-mono text-lg p-6 focus:ring-primary/50"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <Button className="h-16 font-bold neon-glow text-xl uppercase tracking-tighter" onClick={handleBulkDispatch} disabled={isProcessing}>
                {isProcessing ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Zap className="mr-2 h-6 w-6 fill-current" />}
                Initiate Global Dispatch
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
