"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Upload, CheckCircle2, AlertCircle, Camera, Loader2, Info, User, Calendar, CreditCard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { storage, db } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { setDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function KycPage() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    dob: "",
    idType: "Aadhaar",
    idNumber: "",
  });

  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    front: null,
    back: null,
    selfie: null,
  });

  if (!user) return null;

  const currentStatus = (profile as any)?.kycStatus || "None";

  const handleFileChange = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [key]: e.target.files[0] });
    }
  };

  const handleUpload = async () => {
    if (!files.front || !files.back || !files.selfie) {
      toast({ title: "Documents Missing", description: "Please upload all 3 photos.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      const urls: { [key: string]: string } = {};

      for (const key of ['front', 'back', 'selfie']) {
        const file = files[key]!;
        const storageRef = ref(storage, `kyc/${user.uid}/${key}_${Date.now()}`);
        const snapshot = await uploadBytes(storageRef, file);
        urls[key] = await getDownloadURL(snapshot.ref);
      }

      await setDoc(doc(db, "kyc_submissions", user.uid), {
        userId: user.uid,
        userEmail: user.email,
        ...formData,
        frontUrl: urls.front,
        backUrl: urls.back,
        selfieUrl: urls.selfie,
        status: "Pending",
        submittedAt: new Date().toISOString(),
      });

      await updateDoc(doc(db, "users", user.uid), {
        kycStatus: "Pending"
      });

      toast({ title: "KYC Submitted", description: "Our team will review your identity within 24 hours." });
      setStep(4);
    } catch (error: any) {
      console.error(error);
      toast({ title: "Upload Failed", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          
          <div className="mb-12 text-center space-y-4">
             <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4">
                <ShieldCheck className="h-10 w-10 text-primary" />
             </div>
             <h1 className="text-4xl font-headline font-bold tracking-tighter uppercase">Identity <span className="text-primary">Verification</span></h1>
             <p className="text-muted-foreground max-w-md mx-auto">Verify your identity to unlock full account features including referral withdrawals.</p>
          </div>

          {currentStatus === "Approved" ? (
             <Card className="bg-card border-green-500/20 text-center p-12 rounded-[2.5rem]">
                <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <h2 className="text-2xl font-headline font-bold mb-2 uppercase">Verified Player</h2>
                <p className="text-muted-foreground mb-8">Your account is fully verified. You can now withdraw rewards and enjoy priority support.</p>
                <Badge className="bg-green-500 text-white px-6 py-2 text-xs uppercase font-bold tracking-widest rounded-full">Aatma Verified</Badge>
             </Card>
          ) : currentStatus === "Pending" ? (
             <Card className="bg-card border-orange-500/20 text-center p-12 rounded-[2.5rem]">
                <div className="h-20 w-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                   <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
                </div>
                <h2 className="text-2xl font-headline font-bold mb-2 uppercase">Verification Pending</h2>
                <p className="text-muted-foreground">We are currently reviewing your documents. This usually takes 2-4 hours.</p>
             </Card>
          ) : (
            <div className="space-y-8">
              {/* Progress Stepper */}
              <div className="flex items-center justify-between px-4 max-w-md mx-auto">
                 {[1, 2, 3].map((s) => (
                   <div key={s} className="flex flex-col items-center gap-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {s}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Step {s}</span>
                   </div>
                 ))}
              </div>

              <Card className="bg-card border-white/5 overflow-hidden rounded-[2.5rem]">
                <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                   <CardTitle className="font-headline font-bold text-xl uppercase tracking-widest flex items-center gap-3">
                      {step === 1 && "Identity Details"}
                      {step === 2 && "Document Photos"}
                      {step === 3 && "Final Review"}
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {step === 1 && (
                    <div className="space-y-6">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold tracking-widest">Legal Full Name</Label>
                             <div className="relative">
                                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                   placeholder="As per ID Card" 
                                   className="pl-10 h-12 bg-black/40 border-white/10" 
                                   value={formData.fullName}
                                   onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold tracking-widest">Date of Birth</Label>
                             <div className="relative">
                                <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                   type="date" 
                                   className="pl-10 h-12 bg-black/40 border-white/10" 
                                   value={formData.dob}
                                   onChange={(e) => setFormData({...formData, dob: e.target.value})}
                                />
                             </div>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold tracking-widest">ID Type</Label>
                             <Select value={formData.idType} onValueChange={(v) => setFormData({...formData, idType: v})}>
                                <SelectTrigger className="h-12 bg-black/40 border-white/10">
                                   <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                   <SelectItem value="Aadhaar">Aadhaar Card</SelectItem>
                                   <SelectItem value="PAN">PAN Card</SelectItem>
                                   <SelectItem value="Passport">Passport</SelectItem>
                                   <SelectItem value="Driving License">Driving License</SelectItem>
                                </SelectContent>
                             </Select>
                          </div>
                          <div className="space-y-2">
                             <Label className="text-xs uppercase font-bold tracking-widest">ID Number / Reference</Label>
                             <div className="relative">
                                <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                <Input 
                                   placeholder="ID unique number" 
                                   className="pl-10 h-12 bg-black/40 border-white/10 font-mono uppercase" 
                                   value={formData.idNumber}
                                   onChange={(e) => setFormData({...formData, idNumber: e.target.value})}
                                />
                             </div>
                          </div>
                       </div>
                       
                       <div className="p-4 bg-primary/5 border border-primary/20 rounded-2xl flex items-start gap-4">
                          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                          <div className="space-y-1">
                             <p className="text-sm font-bold text-white uppercase tracking-widest">Policy Note</p>
                             <p className="text-[10px] text-muted-foreground leading-relaxed uppercase font-bold">
                                Your data is protected by AES-256 node encryption and is only accessible by authorized verification staff.
                             </p>
                          </div>
                       </div>
                       <Button className="w-full h-14 font-bold uppercase tracking-widest text-lg" disabled={!formData.fullName || !formData.dob || !formData.idNumber} onClick={() => setStep(2)}>
                          Proceed to Photos
                       </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <Label className="text-xs uppercase font-bold tracking-widest">ID Front View</Label>
                          <div className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-colors group cursor-pointer overflow-hidden">
                             {files.front ? (
                               <img src={URL.createObjectURL(files.front)} className="absolute inset-0 object-cover opacity-60" />
                             ) : null}
                             <div className="relative z-10 text-center space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary" />
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Upload Front</p>
                             </div>
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange('front', e)} accept="image/*" />
                          </div>
                       </div>

                       <div className="space-y-4">
                          <Label className="text-xs uppercase font-bold tracking-widest">ID Back View</Label>
                          <div className="relative aspect-[4/3] rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-colors group cursor-pointer overflow-hidden">
                             {files.back ? (
                               <img src={URL.createObjectURL(files.back)} className="absolute inset-0 object-cover opacity-60" />
                             ) : null}
                             <div className="relative z-10 text-center space-y-2">
                                <Upload className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary" />
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Upload Back</p>
                             </div>
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange('back', e)} accept="image/*" />
                          </div>
                       </div>

                       <div className="space-y-4 md:col-span-2">
                          <Label className="text-xs uppercase font-bold tracking-widest">Selfie Verification</Label>
                          <div className="relative h-48 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-6 hover:border-primary/50 transition-colors group cursor-pointer overflow-hidden">
                             {files.selfie ? (
                               <img src={URL.createObjectURL(files.selfie)} className="absolute inset-0 object-cover opacity-60" />
                             ) : null}
                             <div className="relative z-10 text-center space-y-2">
                                <Camera className="h-8 w-8 mx-auto text-muted-foreground group-hover:text-primary" />
                                <p className="text-[10px] font-bold uppercase text-muted-foreground">Selfie holding ID</p>
                             </div>
                             <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange('selfie', e)} accept="image/*" />
                          </div>
                       </div>

                       <div className="md:col-span-2 flex gap-4 pt-4">
                          <Button variant="outline" className="flex-1 h-12 uppercase font-bold text-xs" onClick={() => setStep(1)}>Back</Button>
                          <Button className="flex-[2] h-12 uppercase font-bold text-xs" onClick={() => setStep(3)}>Verify Photos</Button>
                       </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-8">
                       <div className="grid grid-cols-3 gap-3">
                          {['front', 'back', 'selfie'].map((k) => (
                             <div key={k} className="aspect-square rounded-2xl bg-black/40 border border-white/10 overflow-hidden relative group">
                                <img src={URL.createObjectURL(files[k]!)} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                   <span className="text-[10px] font-bold uppercase tracking-widest">{k}</span>
                                </div>
                             </div>
                          ))}
                       </div>

                       <div className="bg-muted/20 p-6 rounded-2xl border border-white/5 space-y-4">
                          <h4 className="text-xs font-bold uppercase text-primary">Identity Confirmation</h4>
                          <div className="grid grid-cols-2 gap-4 text-[10px] font-bold uppercase tracking-tight">
                             <div>
                                <p className="text-muted-foreground mb-1">Full Name</p>
                                <p className="text-white">{formData.fullName}</p>
                             </div>
                             <div>
                                <p className="text-muted-foreground mb-1">ID Number</p>
                                <p className="text-white">{formData.idNumber}</p>
                             </div>
                          </div>
                       </div>

                       <div className="flex gap-4">
                          <Button variant="outline" className="flex-1 h-14 uppercase font-bold text-xs" onClick={() => setStep(2)}>Recapture</Button>
                          <Button className="flex-[2] h-14 uppercase font-bold text-xs neon-glow" onClick={handleUpload} disabled={isUploading}>
                             {isUploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                             Submit Intelligence
                          </Button>
                       </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}
