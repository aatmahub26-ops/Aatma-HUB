"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Eye, CheckCircle as CheckCircle2, XCircle, Search, Loader2, ExternalLink, Mail, User, Clock, Calendar, Hash } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, onSnapshot, doc, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function AdminKyc() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const q = query(collection(db, "kyc_submissions"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleReview = async (status: 'Approved' | 'Rejected') => {
    if (!selectedSub) return;
    
    try {
      const batch = writeBatch(db);
      
      // Update submission status
      batch.update(doc(db, "kyc_submissions", selectedSub.id), {
        status,
        adminNote: reviewNote,
        reviewedAt: new Date().toISOString()
      });

      // Update user status
      batch.update(doc(db, "users", selectedSub.id), {
        kycStatus: status,
        kycVerified: status === 'Approved'
      });

      await batch.commit();
      toast({ title: `KYC ${status}`, description: `Player identity has been ${status.toLowerCase()}.` });
      setSelectedSub(null);
      setReviewNote("");
    } catch (error: any) {
      toast({ title: "Update Failed", description: error.message, variant: "destructive" });
    }
  };

  const filtered = submissions.filter(s => 
    s.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.idNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">KYC Verification Hub</h2>
          <p className="text-muted-foreground">Audit player identities and approve account verification requests.</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search submissions by email, name or ID..." 
          className="pl-10 bg-card/50 border-white/5 h-12" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="bg-card border-white/5 rounded-[2rem] overflow-hidden">
        <CardContent className="p-0">
           <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="border-b border-white/5 bg-white/5 font-bold uppercase tracking-widest text-[10px] text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Player Details</th>
                    <th className="px-6 py-4">ID Intel</th>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" /></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No verification requests detected.</td></tr>
                  ) : (
                    filtered.map((sub) => (
                      <tr key={sub.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                                 {sub.fullName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                 <p className="font-bold text-white uppercase tracking-tight">{sub.fullName}</p>
                                 <p className="text-[10px] text-muted-foreground font-mono uppercase truncate max-w-[150px]">{sub.userEmail}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="space-y-1">
                              <Badge variant="outline" className="text-[10px] uppercase border-white/10 font-bold">{sub.idType}</Badge>
                              <p className="text-[10px] font-mono text-primary font-bold">{sub.idNumber}</p>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">
                           <div className="flex items-center gap-2">
                              <Clock className="h-3 w-3" />
                              <span className="text-[10px] font-bold uppercase">{new Date(sub.submittedAt).toLocaleDateString()}</span>
                           </div>
                        </td>
                        <td className="px-6 py-4">
                           <Badge className={`text-[10px] uppercase font-bold border-none ${
                             sub.status === 'Approved' ? 'bg-green-500/10 text-green-500' : 
                             sub.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 'bg-orange-500/10 text-orange-500'
                           }`}>
                             {sub.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Button variant="ghost" size="sm" className="h-8 border border-white/10 rounded-xl font-bold uppercase text-[9px] tracking-widest" onClick={() => setSelectedSub(sub)}>
                              <Eye className="mr-2 h-3 w-3" /> Audit
                           </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
             </table>
           </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
         <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-card border-white/10 rounded-[2.5rem] p-0 overflow-hidden">
            <div className="bg-primary/10 p-8 border-b border-white/5 flex items-center justify-between">
               <div>
                  <Badge className="bg-primary text-primary-foreground font-bold uppercase text-[8px] tracking-widest px-3 h-4 mb-2">INTELLIGENCE AUDIT</Badge>
                  <DialogTitle className="text-2xl font-headline font-bold uppercase tracking-tight">Identity of {selectedSub?.fullName}</DialogTitle>
               </div>
               <Badge className={`text-xs uppercase font-bold tracking-widest px-4 h-8 flex items-center ${
                 selectedSub?.status === 'Approved' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'
               }`}>{selectedSub?.status}</Badge>
            </div>
            
            <div className="p-8">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                  <DetailItem icon={User} label="Legal Name" value={selectedSub?.fullName} />
                  <DetailItem icon={Calendar} label="Date of Birth" value={selectedSub?.dob} />
                  <DetailItem icon={Hash} label="ID Reference" value={`${selectedSub?.idType}: ${selectedSub?.idNumber}`} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <ImageAuditItem label="Front Document" url={selectedSub?.frontUrl} />
                  <ImageAuditItem label="Back Document" url={selectedSub?.backUrl} />
                  <ImageAuditItem label="Live Selfie" url={selectedSub?.selfieUrl} />
               </div>

               <div className="space-y-4 pt-8 border-t border-white/5">
                  <Label className="text-xs uppercase font-bold tracking-widest text-muted-foreground">Admin Execution Note</Label>
                  <Input 
                    placeholder="Enter reason for rejection or approval remarks..." 
                    className="bg-black/40 border-white/10 h-14"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                  <div className="flex gap-4 pt-4">
                     <Button variant="destructive" className="flex-1 h-14 font-bold uppercase text-sm rounded-2xl" onClick={() => handleReview('Rejected')}>
                        <XCircle className="mr-2 h-5 w-5" /> Terminate Access
                     </Button>
                     <Button className="flex-1 h-14 font-bold bg-green-600 hover:bg-green-700 text-white uppercase text-sm rounded-2xl" onClick={() => handleReview('Approved')}>
                        <CheckCircle2 className="mr-2 h-5 w-5" /> Authorize Identity
                     </Button>
                  </div>
               </div>
            </div>
         </DialogContent>
      </Dialog>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
       <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
          <Icon className="h-5 w-5" />
       </div>
       <div>
          <p className="text-[9px] font-bold uppercase text-muted-foreground tracking-widest">{label}</p>
          <p className="text-sm font-bold text-white uppercase">{value}</p>
       </div>
    </div>
  );
}

function ImageAuditItem({ label, url }: any) {
  return (
    <div className="space-y-4">
       <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">{label}</p>
       <div className="relative aspect-[3/4] rounded-2xl bg-black overflow-hidden border border-white/10 group">
          <img src={url} className="h-full w-full object-contain" alt={label} />
          <a href={url} target="_blank" className="absolute top-4 right-4 p-3 bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md border border-white/10">
             <ExternalLink className="h-5 w-5 text-white" />
          </a>
       </div>
    </div>
  );
}