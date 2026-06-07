"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Gamepad2, ChevronRight, MessageSquare, Loader2, ShoppingBag, Phone, History } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [searchQuery, setSearchSearchQuery] = useState("");

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoadingOrders(false);
      }, (error) => {
        console.error("Error fetching orders:", error);
        setLoadingOrders(false);
      });
      return () => unsubscribe();
    } else if (!authLoading) {
      setLoadingOrders(false);
    }
  }, [user, authLoading]);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    order.packageName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase">Order History</h1>
                <p className="text-muted-foreground mt-1">Review all your previous game top-ups and digital purchases</p>
              </div>
              <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/10">
                <Link href="/tracking">
                  <Search className="mr-2 h-4 w-4" />
                  Track Order
                </Link>
              </Button>
            </div>

            <Card className="bg-card/50 border-white/5">
              <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                   <Input 
                    placeholder="Search by Order ID or Game..." 
                    className="pl-10 h-10 bg-black/40 border-white/10" 
                    value={searchQuery}
                    onChange={(e) => setSearchSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest h-8">
                    <Filter className="mr-2 h-3 w-3" />
                    Filter
                  </Button>
                  <div className="h-4 w-px bg-white/10 mx-2" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Total: {orders.length} Orders
                  </p>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                  {loadingOrders ? (
                    <div className="p-20 text-center text-muted-foreground">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                      <p>Loading your orders...</p>
                    </div>
                  ) : filteredOrders.length === 0 ? (
                    <div className="p-20 text-center text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No orders found. Start your first top-up today!</p>
                      <Button asChild className="mt-6 neon-glow" variant="secondary">
                        <Link href="/catalog">Browse Catalog</Link>
                      </Button>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div key={order.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between hover:bg-white/5 transition-all group">
                        <div className="flex items-center space-x-6">
                          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center relative overflow-hidden group-hover:bg-primary/10 transition-colors">
                             <Gamepad2 className="h-8 w-8 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
                             <div className="absolute inset-0 border border-white/5 rounded-2xl" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-bold text-lg leading-none">{order.packageName}</h3>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                               <span className="font-mono text-primary/80 font-bold">{order.id.substring(0, 8)}</span>
                               <span className="opacity-20">•</span>
                               <span>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recently'}</span>
                            </div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">ID: {order.playerGameId}</p>
                          </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0 flex items-center justify-between md:space-x-12">
                          <div className="text-left md:text-right">
                            <p className="text-2xl font-headline font-bold">₹{order.price}</p>
                            <Badge className={`text-[10px] mt-1 ${
                              order.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 
                              order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500' : 
                              order.status === 'Failed' ? 'bg-destructive/10 text-destructive' : order.status === 'Refunded' ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-500/10 text-orange-500'
                            } border-none`}>
                              {order.status}
                            </Badge>
                          </div>
                          <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform" asChild>
                             <Link href={`/tracking?id=${order.id}`}>
                                <ChevronRight className="h-5 w-5" />
                             </Link>
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="p-12 text-center glass-card rounded-[2rem] border-dashed border-white/10">
               <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <MessageSquare className="h-8 w-8 text-primary" />
               </div>
               <h3 className="text-xl font-headline font-bold mb-2">Need Help with an Order?</h3>
               <p className="text-muted-foreground max-w-sm mx-auto mb-6">Contact our 24/7 support squad for instant resolution of top-up queries.</p>
               <div className="flex flex-wrap justify-center gap-4">
                  <Button className="bg-green-600 hover:bg-green-700 font-bold" asChild>
                    <a href="https://wa.me/918566936666" target="_blank">
                      <MessageSquare className="mr-2 h-4 w-4" /> WhatsApp Support
                    </a>
                  </Button>
                  <Button variant="outline" className="border-primary/20 hover:bg-primary/10 font-bold" asChild>
                    <a href="tel:+918566936666">
                      <Phone className="mr-2 h-4 w-4" /> +91 8566936666
                    </a>
                  </Button>
               </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
