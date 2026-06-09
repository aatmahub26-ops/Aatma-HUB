"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, UserPlus, Mail, Smartphone, Wallet, Gift, MoreHorizontal, Loader2, Edit3, ShieldAlert, ArrowUpCircle, ArrowDownCircle, Briefcase, Award, Trash2, Eye, User as UserIcon, Lock, Unlock, History, Star, Coins } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, runTransaction, serverTimestamp, deleteField, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RESELLER_LEVELS } from "@/lib/reseller-levels";
import { useAuth } from "@/context/AuthContext";
import { logAdminAction } from "@/lib/admin-audit";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUserRank } from "@/lib/ranks";

export default function AdminUsers() {
  const { profile: adminProfile } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // States
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustType, setAdjustType] = useState<'Credit' | 'Debit'>('Credit');
  const [adjustField, setAdjustField] = useState<'wallet' | 'points'>('wallet');
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [walletDialogOpen, setWalletOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleManualAdjustment = async () => {
    if (!selectedUser || !adjustAmount || isNaN(parseFloat(adjustAmount)) || !adjustReason) {
       toast({ title: "System Violation", description: "Amount and Reason are mandatory.", variant: "destructive" });
       return;
    }
    
    setIsAdjusting(true);
    const amount = parseFloat(adjustAmount);
    const multiplier = adjustType === 'Credit' ? 1 : -1;

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", selectedUser.id);
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw "Target node not found";

        if (adjustField === 'wallet') {
          const currentBalance = userSnap.data().walletBalance || 0;
          transaction.update(userRef, { walletBalance: currentBalance + (amount * multiplier) });
          
          const txnRef = doc(collection(db, "transactions"));
          transaction.set(txnRef, {
            userId: selectedUser.id,
            amount: amount,
            type: adjustType,
            description: `Admin Manual Adjustment: ${adjustReason}`,
            status: "Success",
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            processedBy: adminProfile?.email || "Admin HUB"
          });
        } else {
          const currentPoints = userSnap.data().loyaltyPoints || 0;
          transaction.update(userRef, { loyaltyPoints: currentPoints + (amount * multiplier) });
        }

        logAdminAction({
          adminId: adminProfile?.uid,
          adminEmail: adminProfile?.email,
          action: 'WALLET_ADJUST',
          targetId: selectedUser.id,
          details: `${adjustType} ${amount} ${adjustField} for ${selectedUser.email}. Reason: ${adjustReason}`
        });
      });

      toast({ title: "Admin Synced", description: `${adjustField.toUpperCase()} adjusted for ${selectedUser.firstName}` });
      setWalletOpen(false);
      setAdjustAmount("");
      setAdjustReason("");
    } catch (e: any) {
      toast({ title: "Operation Failed", description: e.message, variant: "destructive" });
    } finally {
      setIsAdjusting(false);
    }
  };

  const handleToggleBan = async (user: any) => {
    const isBanning = !user.isBanned;
    if (!confirm(`Are you sure you want to ${isBanning ? 'SUSPEND' : 'RESTORE'} account access for ${user.email}?`)) return;

    try {
      await updateDoc(doc(db, "users", user.id), {
        isBanned: isBanning,
        bannedAt: isBanning ? serverTimestamp() : deleteField(),
        bannedBy: isBanning ? adminProfile?.email : deleteField()
      });

      logAdminAction({
        adminId: adminProfile?.uid,
        adminEmail: adminProfile?.email,
        action: isBanning ? 'USER_BAN' : 'USER_UNBAN',
        targetId: user.id,
        details: `${isBanning ? 'Suspended' : 'Restored'} access for ${user.email}`
      });

      toast({ title: isBanning ? "Account Suspended" : "Access Restored", description: "Identity node status synchronized." });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const filteredUsers = users.filter(u => 
    u.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Population Management</h2>
          <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-60">Audit player nodes and authorize B2B distribution layers.</p>
        </div>
        <Button size="sm" className="h-10 font-bold bg-primary text-primary-foreground neon-glow">
          <UserPlus className="mr-2 h-4 w-4" />
          Provision Item
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by Identity, System or Email..." 
          className="pl-10 bg-card/50 border-white/5 h-12" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList className="bg-card border border-white/5 h-12 p-1 rounded-xl">
           <TabsTrigger value="list" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Active Database</TabsTrigger>
           <TabsTrigger value="suspended" className="rounded-lg px-6 font-bold uppercase text-[9px] tracking-widest">Suspended Items</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <UserTable users={filteredUsers.filter(u => !u.isBanned)} onWalletAdjust={(user, field) => { setSelectedUser(user); setAdjustField(field); setWalletOpen(true); }} onToggleBan={handleToggleBan} />
        </TabsContent>
        
        <TabsContent value="suspended">
          <UserTable users={filteredUsers.filter(u => u.isBanned)} onWalletAdjust={(user, field) => { setSelectedUser(user); setAdjustField(field); setWalletOpen(true); }} onToggleBan={handleToggleBan} />
        </TabsContent>
      </Tabs>

      <Dialog open={walletDialogOpen} onOpenChange={setWalletOpen}>
         <DialogContent className="bg-card border-white/10 max-w-md rounded-[2.5rem] p-10">
            <DialogHeader>
               <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-tight">Admin Override</DialogTitle>
               <DialogDescription className="uppercase text-[10px] font-bold tracking-widest text-muted-foreground">
                  Adjusting {adjustField.toUpperCase()} for {selectedUser?.firstName}
               </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-6">
               <div className="flex gap-4">
                  <Button 
                    className={`flex-1 h-12 font-bold uppercase text-[10px] rounded-xl transition-all ${adjustType === 'Credit' ? 'bg-green-600 text-white shadow-lg shadow-green-500/20' : 'bg-black/40 border border-white/5 text-muted-foreground'}`}
                    onClick={() => setAdjustType('Credit')}
                  >
                     Credit Item
                  </Button>
                  <Button 
                    className={`flex-1 h-12 font-bold uppercase text-[10px] rounded-xl transition-all ${adjustType === 'Debit' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-black/40 border border-white/5 text-muted-foreground'}`}
                    onClick={() => setAdjustType('Debit')}
                  >
                     Debit Item
                  </Button>
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Amount</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    className="h-14 text-2xl font-headline font-bold bg-black/40 border-white/10 text-center" 
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                  />
               </div>

               <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Reason System</Label>
                  <Input 
                    placeholder="e.g. Loyalty Compensation" 
                    className="h-12 bg-black/40 border-white/10 text-xs font-bold" 
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                  />
               </div>
            </div>

            <DialogFooter>
               <Button className="w-full h-14 font-bold neon-glow text-lg uppercase tracking-tighter rounded-2xl" onClick={handleManualAdjustment} disabled={isAdjusting || !adjustAmount}>
                  {isAdjusting ? <Loader2 className="h-6 w-6 animate-spin" /> : "Authorize Admin Change"}
               </Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function UserTable({ users, onWalletAdjust, onToggleBan }: { users: any[], onWalletAdjust: (user: any, field: 'wallet' | 'points') => void, onToggleBan: (user: any) => void }) {
   return (
    <Card className="bg-card border-white/5 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                <tr>
                  <th className="px-8 py-5">Operator ID</th>
                  <th className="px-8 py-5">VIP Intel</th>
                  <th className="px-8 py-5">Assets</th>
                  <th className="px-8 py-5">Role</th>
                  <th className="px-8 py-5 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.length === 0 ? (
                  <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">Sector data missing.</td></tr>
                ) : (
                  users.map((user) => {
                    const rank = getUserRank(user.lifetimeRechargeAmount || 0);
                    return (
                      <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-11 w-11 rounded-xl border border-white/5">
                              <AvatarImage src={`https://picsum.photos/seed/${user.id}/44/44`} />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">{user.firstName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-bold text-white uppercase tracking-tight leading-none mb-1">{user.firstName} {user.lastName}</p>
                              <p className="text-[9px] text-muted-foreground font-mono tracking-tighter uppercase">ID: {user.id.substring(0, 10)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                           <div className="space-y-1">
                              <Badge className={`${rank.color.replace('text-', 'bg-')}/10 ${rank.color} border-none text-[8px] px-2 h-4 uppercase`}>{rank.tier}</Badge>
                              <p className="text-[8px] font-black text-primary uppercase tracking-widest">VIP {rank.vipTier}</p>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1.5">
                             <div className="flex items-center gap-1.5 font-bold text-green-500 text-xs">
                               <Wallet className="h-3 w-3" /> ₹{user.walletBalance?.toFixed(2) || "0.00"}
                             </div>
                             <div className="flex items-center gap-1.5 font-bold text-yellow-500 text-[10px] uppercase">
                               <Star className="h-3 w-3 fill-current" /> {user.loyaltyPoints || 0} Points
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <Badge className={`${user.role === 'admin' ? 'bg-destructive' : user.role === 'reseller' ? 'bg-primary' : 'bg-muted'} text-white border-none text-[8px] font-bold uppercase tracking-widest h-4`}>
                             {user.role?.toUpperCase() || 'PLAYER'}
                          </Badge>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-white rounded-xl bg-white/5">
                                   <MoreHorizontal className="h-5 w-5" />
                                </Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end" className="w-64 bg-card border-white/10 p-2 rounded-2xl">
                                <DropdownMenuLabel className="text-[9px] uppercase font-bold px-3 py-2 opacity-50">Assets</DropdownMenuLabel>
                                <DropdownMenuItem className="p-3 rounded-xl cursor-pointer" onClick={() => onWalletAdjust(user, 'wallet')}>
                                   <Wallet className="mr-2 h-4 w-4 text-green-500" /> Adjust Wallet
                                </DropdownMenuItem>
                                <DropdownMenuItem className="p-3 rounded-xl cursor-pointer" onClick={() => onWalletAdjust(user, 'points')}>
                                   <Coins className="mr-2 h-4 w-4 text-yellow-500" /> Adjust Points
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5" />
                                <DropdownMenuLabel className="text-[9px] uppercase font-bold px-3 py-2 opacity-50">Governance</DropdownMenuLabel>
                                <DropdownMenuItem className="p-3 rounded-xl cursor-pointer" onClick={() => onToggleBan(user)}>
                                   {user.isBanned ? (
                                     <><Unlock className="mr-2 h-4 w-4 text-green-500" /> Restore Item</>
                                   ) : (
                                     <><Lock className="mr-2 h-4 w-4 text-destructive" /> Suspend System</>
                                   )}
                                </DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
    </Card>
   );
}
