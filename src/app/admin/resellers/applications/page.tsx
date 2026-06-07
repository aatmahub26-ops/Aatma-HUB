
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, CheckCircle2, XCircle, Eye, Briefcase, Mail, Smartphone, Clock, Calendar } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, writeBatch, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function ResellerApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "reseller_applications"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApps(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    if (!selectedApp) return;
    
    try {
      const batch = writeBatch(db);
      
      // 1. Update application status
      batch.update(doc(db, "reseller_applications", selectedApp.id), {
        status,
        reviewedAt: serverTimestamp()
      });

      // 2. Update user profile
      if (status === 'Approved') {
        batch.update(doc(db, "users", selectedApp.id), {
          role: "reseller",
          resellerStatus: "Approved",
          resellerLevel: "Bronze",
          businessName: selectedApp.businessName || "Aatma Partner",
          lifetimeVolume: 0
        });
        
        // Log notification
        const notifRef = doc(collection(db, "notifications"));
        batch.set(notifRef, {
          userId: selectedApp.id,
          type: "achievement",
          title: "B2B Activation Successful",
          message: "Welcome to the distribution squad! Your B2B Dashboard is now operational.",
          read: false,
          createdAt: new Date().toISOString()
        });
      } else {
        batch.update(doc(db, "users", selectedApp.id), {
          resellerStatus: "Rejected"
        });
      }

      await batch.commit();
      toast({ title: `Application ${status}`, description: `Business partner node has been synchronized.` });
      setSelectedApp(null);
    } catch (error: any) {
      toast({ title: "Operation Failed", description: error.message, variant: "destructive" });
    }
  };

  const filtered = apps.filter(a => 
    a.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Reseller Applications</h2>
          <p className="text-muted-foreground">Audit business enrollment requests for the B2B distribution layer.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by business name, name, or email..." 
          className="pl-10 bg-card/50 border-white/5 h-12" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="bg-card border-white/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Corporate Intelligence</th>
                    <th className="px-6 py-4">Contact Protocol</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={4} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No pending applications detected.</td></tr>
                  ) : filtered.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                               <Briefcase className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                               <p className="font-bold text-white uppercase tracking-tight">{app.businessName || "New Merchant"}</p>
                               <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{app.fullName}</p>
                            </div>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="space-y-0.5">
                            <p className="text-xs font-bold text-white">{app.email}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{app.phone}</p>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <Badge className={`text-[10px] uppercase font-bold border-none ${
                           app.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                           app.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'
                         }`}>
                           {app.status}
                         </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                         <Button variant="ghost" size="sm" className="h-8 border border-white/10 font-bold uppercase text-[9px]" onClick={() => setSelectedApp(app)}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> Audit Intel
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
         <DialogContent className="max-w-xl bg-card border-white/10 rounded-[2rem] p-0 overflow-hidden">
            <div className="bg-primary/10 p-8 border-b border-white/5">
               <DialogTitle className="text-2xl font-headline font-bold uppercase">Application Audit</DialogTitle>
               <DialogDescription className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-1">Reviewing partner: {selectedApp?.businessName}</DialogDescription>
            </div>
            
            <div className="p-8 space-y-6">
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                     <p className="text-sm font-bold text-white uppercase">{selectedApp?.fullName}</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Mobile Link</p>
                     <p className="text-sm font-bold text-white uppercase">{selectedApp?.phone}</p>
                  </div>
               </div>

               <div className="space-y-1">
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Business Mission / Intent</p>
                  <div className="bg-black/40 p-4 rounded-xl border border-white/5 text-xs text-muted-foreground leading-relaxed italic">
                     "{selectedApp?.reason}"
                  </div>
               </div>

               <div className="flex gap-4 pt-4">
                  <Button variant="destructive" className="flex-1 h-12 font-bold uppercase text-xs" onClick={() => handleReview('Rejected')}>
                     Terminate Node
                  </Button>
                  <Button className="flex-1 h-12 font-bold bg-green-600 hover:bg-green-700 text-white uppercase text-xs" onClick={() => handleReview('Approved')}>
                     Authorize B2B Access
                  </Button>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}
