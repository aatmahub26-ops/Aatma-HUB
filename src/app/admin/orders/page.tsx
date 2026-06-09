
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreVertical, Eye, CheckCircle, Clock, XCircle, Loader2, Package, User, ExternalLink, Image as ImageIcon, MessageSquare, ShieldAlert, History, RotateCcw, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, updateDoc, doc, setDoc, addDoc, serverTimestamp, runTransaction, increment } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RESELLER_LEVELS } from "@/lib/reseller-levels";
import { useAuth } from "@/context/AuthContext";
import { logAdminAction } from "@/lib/admin-audit";
import { processFulfillment } from "@/services/fulfillment-service";

export default function AdminOrders() {
  const { profile: adminProfile } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOrdering, setIsOrdering] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleAutoOrder = async (orderId: string) => {
    setIsOrdering(orderId);
    try {
      const result = await processFulfillment(orderId);
      if (result.success) {
        toast({ title: "Auto-Order Success", description: result.message });
      } else {
        toast({ title: "Auto-Order Failed", description: result.error, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Fulfillment Breach", description: e.message, variant: "destructive" });
    } finally {
      setIsOrdering(null);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    if (isUpdating) return;
    setIsUpdating(true);
    
    try {
      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await transaction.get(orderRef);
        if (!orderSnap.exists()) throw new Error("Order node not found.");
        
        const orderData = orderSnap.data();
        if (orderData.status === newStatus) return;

        const userRef = doc(db, "users", orderData.userId);
        const userSnap = await transaction.get(userRef);
        
        if (newStatus === 'Completed' && !orderData.commissionPaid) {
          if (userSnap.exists()) {
             const uData = userSnap.data();
             if (uData.role === 'reseller') {
                const tier = RESELLER_LEVELS.find(l => l.level === (uData.resellerLevel || 'Bronze'));
                const rate = (tier?.discount || 1) / 100; 
                const commission = orderData.price * rate;

                transaction.update(userRef, { 
                  walletBalance: increment(commission),
                  totalCommissionEarnings: increment(commission),
                  lifetimeVolume: increment(orderData.price)
                });

                const commRef = doc(collection(db, "reseller_commissions"));
                transaction.set(commRef, {
                  resellerId: orderData.userId,
                  businessName: uData.businessName || uData.firstName || "Aatma Partner",
                  amount: commission,
                  orderId: orderId,
                  orderTotal: orderData.price,
                  type: "Order Amount",
                  createdAt: new Date().toISOString()
                });

                const txnRef = doc(collection(db, "wallet_transactions"));
                transaction.set(txnRef, {
                  userId: orderData.userId,
                  amount: commission,
                  type: "Credit",
                  description: `B2B Amount: Completed Order #${orderId.substring(0, 8)}`,
                  status: "Success",
                  date: new Date().toISOString(),
                  reference: orderId
                });

                transaction.update(orderRef, { commissionPaid: true });
             }
          }
        }

        const isWalletPay = orderData.paymentMethod === 'wallet';
        if ((newStatus === 'Failed' || newStatus === 'Refunded') && isWalletPay && !orderData.refunded) {
          if (userSnap.exists()) {
             transaction.update(userRef, { walletBalance: increment(orderData.price) });
             
             const txnRef = doc(collection(db, "wallet_transactions"));
             transaction.set(txnRef, {
               userId: orderData.userId,
               amount: orderData.price,
               type: "Credit",
               description: `Refund: Failed dispatch #${orderId.substring(0, 8)}`,
               status: "Success",
               date: new Date().toISOString(),
               reference: orderId
             });
             
             transaction.update(orderRef, { refunded: true });
          }
        }

        transaction.update(orderRef, { 
          status: newStatus,
          updatedAt: serverTimestamp(),
          processedBy: adminProfile?.email || 'System'
        });

        logAdminAction({
          adminId: adminProfile?.uid || 'unknown',
          adminEmail: adminProfile?.email || 'unknown',
          action: 'ORDER_STATUS',
          targetId: orderId,
          details: `Order status changed to ${newStatus} for ${orderData.userEmail}`
        });
      });

      toast({ title: "Status Synchronized", description: `System moved to ${newStatus}.` });
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.playerGameId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.productName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && o.status?.toLowerCase() === activeTab.toLowerCase();
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Order Management</h2>
          <p className="text-muted-foreground">Orchestrate automated and manual fulfillment nodes.</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-10 border-primary/30 text-primary uppercase font-bold tracking-widest px-4">
             {orders.filter(o => o.status === 'Pending').length} Pending Tasks
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <TabsList className="bg-card border border-white/5 h-12 p-1 rounded-xl overflow-x-auto scrollbar-hide">
             <TabsTrigger value="all" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">All</TabsTrigger>
             <TabsTrigger value="Pending" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Pending</TabsTrigger>
             <TabsTrigger value="Processing" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Processing</TabsTrigger>
             <TabsTrigger value="Completed" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Completed</TabsTrigger>
             <TabsTrigger value="Failed" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Failed</TabsTrigger>
          </TabsList>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Filter nodes..." 
              className="pl-10 h-11 bg-card/50 border-white/5" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="bg-card border-white/5 overflow-hidden rounded-[2rem]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Target Identity</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoading ? (
                    <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></td></tr>
                  ) : filteredOrders.length === 0 ? (
                    <tr><td colSpan={6} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No tasks in current buffer.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-white uppercase truncate max-w-[180px]">{order.productName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono uppercase">ID: {order.id.substring(0, 12)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] font-bold text-primary">
                          {order.playerGameId}
                        </td>
                        <td className="px-6 py-4">
                           <p className="font-headline font-bold text-base text-white">₹{order.price}</p>
                           {order.commissionPaid && <Badge className="bg-green-500/10 text-green-500 border-none text-[7px] uppercase h-3">YIELD PAID</Badge>}
                        </td>
                        <td className="px-6 py-4">
                          <Badge className={
                            order.status === 'Completed' ? 'bg-green-500/10 text-green-500 border-none' : 
                            order.status === 'Processing' ? 'bg-blue-500/10 text-blue-500 border-none' : 
                            order.status === 'Failed' ? 'bg-destructive/10 text-destructive border-none' :
                            'bg-orange-500/10 text-orange-500 border-none'
                          }>
                            {order.status || 'Pending'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                             {order.status === 'Pending' && (
                               <Button 
                                variant="outline" 
                                size="icon" 
                                className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/10" 
                                onClick={() => handleAutoOrder(order.id)}
                                disabled={isOrdering === order.id}
                               >
                                 {isOrdering === order.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4 fill-current" />}
                               </Button>
                             )}
                             <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 text-primary" onClick={() => setSelectedOrder(order)}>
                               <Eye className="h-4 w-4" />
                             </Button>
                             <DropdownMenu>
                               <DropdownMenuTrigger asChild>
                                 <Button variant="ghost" size="icon" className="h-8 w-8">
                                   <MoreVertical className="h-4 w-4" />
                                 </Button>
                               </DropdownMenuTrigger>
                               <DropdownMenuContent align="end" className="bg-card border-white/10 w-48 p-2 rounded-xl">
                                 <DropdownMenuItem className="cursor-pointer rounded-lg p-2" onClick={() => handleUpdateStatus(order.id, 'Processing')}>
                                   <Clock className="mr-2 h-4 w-4 text-blue-500" /> Start Processing
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="cursor-pointer rounded-lg p-2" onClick={() => handleUpdateStatus(order.id, 'Completed')}>
                                   <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> Finalize Delivery
                                 </DropdownMenuItem>
                                 <DropdownMenuItem className="cursor-pointer rounded-lg p-2 text-destructive" onClick={() => handleUpdateStatus(order.id, 'Failed')}>
                                   <XCircle className="mr-2 h-4 w-4" /> Mark as Failed
                                 </DropdownMenuItem>
                               </DropdownMenuContent>
                             </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-white/10 rounded-[2.5rem] p-0 overflow-hidden">
            <div className="bg-primary/10 p-8 border-b border-white/5 flex items-center justify-between">
               <div className="space-y-1">
                  <Badge className="bg-primary text-primary-foreground font-bold uppercase text-[8px] tracking-widest px-3 h-4">PROTOCOL DETAIL</Badge>
                  <h2 className="text-2xl font-headline font-bold uppercase tracking-tight">Order #{selectedOrder?.id.substring(0, 12)}</h2>
               </div>
               <Badge className={`text-xs uppercase font-bold tracking-widest border-none px-4 py-1 ${
                 selectedOrder?.status === 'Completed' ? 'bg-green-500 text-white' : 'bg-orange-500 text-white'
               }`}>{selectedOrder?.status}</Badge>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                        <User className="h-4 w-4" /> Player Identity
                     </h3>
                     <div className="bg-black/40 rounded-2xl border border-white/5 p-6 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Email</span>
                           <span className="text-white font-bold">{selectedOrder?.userEmail}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Target ID</span>
                           <span className="text-primary font-mono font-bold text-sm">{selectedOrder?.playerGameId}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs border-t border-white/5 pt-4">
                           <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Processed By</span>
                           <span className="text-muted-foreground font-bold text-[9px]">{selectedOrder?.processedBy || 'Pending'}</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-8">
                  <div className="space-y-4">
                     <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-primary flex items-center gap-2">
                        <Package className="h-4 w-4" /> Payload Info
                     </h3>
                     <div className="bg-black/40 rounded-2xl border border-white/5 p-6 space-y-4">
                        <div className="flex justify-between items-center text-xs">
                           <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Product</span>
                           <span className="text-white font-bold uppercase">{selectedOrder?.productName}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-4 border-t border-white/5">
                           <span className="text-muted-foreground uppercase font-bold tracking-widest text-[9px]">Total Amount</span>
                           <span className="text-xl font-headline font-bold text-primary">₹{selectedOrder?.price}</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5 flex gap-4">
               <Button className="flex-1 h-14 font-bold uppercase text-xs tracking-widest bg-green-600 hover:bg-green-700" onClick={() => handleUpdateStatus(selectedOrder.id, 'Completed')} disabled={isUpdating}>
                  Complete Order
               </Button>
               <Button 
                variant="secondary" 
                className="flex-1 h-14 font-bold uppercase text-xs tracking-widest bg-primary text-white"
                onClick={() => handleAutoOrder(selectedOrder.id)}
                disabled={isOrdering === selectedOrder?.id}
               >
                  {isOrdering === selectedOrder?.id ? <Loader2 className="h-5 w-5 animate-spin" /> : "Process Order"}
               </Button>
               <Button variant="destructive" className="flex-1 h-14 font-bold uppercase text-xs tracking-widest" onClick={() => handleUpdateStatus(selectedOrder.id, 'Failed')} disabled={isUpdating}>
                  Mark Failed & Revert
               </Button>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
