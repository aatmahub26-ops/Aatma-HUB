
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Code, Terminal, Key, ShieldCheck, Globe, Database, Copy, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

export default function ResellerApi() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [requested, setRequested] = useState(false);

  const copy = (val: string) => {
    navigator.clipboard.writeText(val);
    toast({ title: "Copied", description: "Value stored to clipboard." });
  };

  const isEligible = (profile?.lifetimeVolume || 0) >= 10000;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
       <div className="space-y-1">
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight text-white">Developer Integration</h2>
          <p className="text-muted-foreground">Automate your distribution using Aatma B2B API nodes.</p>
       </div>

       {!isEligible ? (
          <Card className="bg-destructive/5 border-destructive/20 border-dashed">
             <CardContent className="p-10 text-center space-y-6">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
                   <ShieldCheck className="h-8 w-8 text-destructive" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                   <h3 className="text-xl font-bold uppercase font-headline">Access Restricted</h3>
                   <p className="text-sm text-muted-foreground leading-relaxed">
                      API access requires a minimum lifetime volume of **₹10,000** (Silver Tier). 
                      Continue dispatching orders to unlock programmatic distribution.
                   </p>
                </div>
                <Badge variant="outline" className="h-6 uppercase font-bold border-white/10">Current Volume: ₹{profile?.lifetimeVolume?.toLocaleString()}</Badge>
             </CardContent>
          </Card>
       ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <Card className="bg-card border-white/5">
                <CardHeader className="bg-white/5 border-b border-white/5">
                   <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      Protocol Credentials
                   </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                   <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Merchant ID</p>
                      <div className="flex gap-2">
                         <Input value={profile?.uid} readOnly className="font-mono bg-black/40 border-white/10 h-10 text-xs" />
                         <Button size="icon" variant="ghost" onClick={() => copy(profile?.uid)}><Copy className="h-4 w-4" /></Button>
                      </div>
                   </div>
                   <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase text-muted-foreground">Production API Key</p>
                      <div className="flex gap-2">
                         <Input type="password" value="••••••••••••••••••••••••" readOnly className="font-mono bg-black/40 border-white/10 h-10 text-xs" />
                         <Button variant="secondary" className="h-10 text-[10px] font-bold uppercase">Generate Key</Button>
                      </div>
                   </div>
                </CardContent>
             </Card>

             <Card className="bg-card border-white/5 overflow-hidden">
                <CardHeader className="bg-black/40 border-b border-white/5">
                   <CardTitle className="text-sm font-headline font-bold uppercase tracking-widest">Environment Status</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                   <div className="space-y-4">
                      {[
                        { label: "B2B REST Nodes", status: "Operational", color: "text-green-500" },
                        { label: "Webhook Dispatcher", status: "Active", color: "text-green-500" },
                        { label: "Callback Verifier", status: "Online", color: "text-green-500" },
                      ].map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                           <span className="text-xs font-bold uppercase tracking-tighter text-white">{s.label}</span>
                           <span className={`text-[10px] font-bold uppercase ${s.color}`}>{s.status}</span>
                        </div>
                      ))}
                   </div>
                </CardContent>
             </Card>
          </div>
       )}

       <Card className="bg-card border-white/5">
          <CardHeader>
             <CardTitle className="text-lg font-headline font-bold uppercase flex items-center gap-2">
                <Terminal className="h-5 w-5 text-primary" />
                Technical Documentation
             </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4 bg-black/20 font-mono text-[10px] text-muted-foreground leading-relaxed">
             <p className="text-primary font-bold"># POST /v1/dispatch</p>
             <div className="p-4 border-l-2 border-primary bg-black/40">
                <pre>{JSON.stringify({
                  "merchant_id": "RES_XXXX",
                  "package_id": "mlbb_86",
                  "player_id": "12345678",
                  "server_id": "9001",
                  "callback_url": "https://yoursite.com/webhook"
                }, null, 2)}</pre>
             </div>
             <p>// The dispatch node will verify B2B wallet balance before fulfillment.</p>
          </CardContent>
       </Card>
    </div>
  );
}
