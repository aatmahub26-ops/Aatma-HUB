
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Zap, Globe, Star, Activity, History, Trash2, Search, Loader2, ShieldCheck, Power } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy, limit, doc, setDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export default function AdminTools() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState({
    region: true,
    weekly: true,
    double: true
  });
  const { toast } = useToast();

  useEffect(() => {
    // Listen for settings
    const unsubSettings = onSnapshot(doc(db, "system_settings", "mlbb_tools"), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as any);
      }
    });

    // Listen for logs
    const q = query(collection(db, "mlbb_tool_logs"), orderBy("createdAt", "desc"), limit(50));
    const unsubLogs = onSnapshot(q, (snap) => {
      setLogs(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubLogs();
    };
  }, []);

  const toggleTool = async (key: string) => {
    try {
      const newSettings = { ...settings, [key]: !settings[key as keyof typeof settings] };
      await setDoc(doc(db, "system_settings", "mlbb_tools"), newSettings, { merge: true });
      toast({ title: "Protocol Updated", description: `${key.toUpperCase()} node status changed.` });
    } catch (e: any) {
      toast({ title: "Update Failed", description: e.message, variant: "destructive" });
    }
  };

  const deleteLog = async (id: string) => {
    if (!confirm("Purge this intelligence record?")) return;
    try {
      await deleteDoc(doc(db, "mlbb_tool_logs", id));
      toast({ title: "Record Purged" });
    } catch (e: any) {
      toast({ title: "Failed", description: e.message, variant: "destructive" });
    }
  };

  const filteredLogs = logs.filter(l => l.playerId.includes(searchQuery) || l.toolType.includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Gaming Tool Logic</h2>
          <p className="text-muted-foreground">Manage MLBB checkers, monitor usage, and audit scan logs.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { key: 'region', label: 'Region Checker', icon: Globe },
          { key: 'weekly', label: 'Pass Limit', icon: Zap },
          { key: 'double', label: 'Double Diamond', icon: Star },
        ].map((tool) => (
          <Card key={tool.key} className="bg-card border-white/5 group hover:border-primary/20 transition-all">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white/5 ${settings[tool.key as keyof typeof settings] ? 'text-primary' : 'text-muted-foreground'}`}>
                  <tool.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white uppercase">{tool.label}</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {settings[tool.key as keyof typeof settings] ? 'Operational' : 'Restricted'}
                  </p>
                </div>
              </div>
              <Switch 
                checked={settings[tool.key as keyof typeof settings]} 
                onCheckedChange={() => toggleTool(tool.key)}
                className="data-[state=checked]:bg-primary"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h3 className="font-headline font-bold text-lg uppercase flex items-center gap-2">
             <Activity className="h-5 w-5 text-primary" />
             Real-time Usage Audit
           </h3>
           <div className="relative w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Filter logs..." 
                className="pl-9 h-9 bg-black/20 border-white/5 text-xs" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
           </div>
        </div>

        <Card className="bg-card border-white/5 overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-6 py-4">Tool Node</th>
                    <th className="px-6 py-4">Player Details</th>
                    <th className="px-6 py-4">Scan Timestamp</th>
                    <th className="px-6 py-4">User Cluster</th>
                    <th className="px-6 py-4 text-right">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></td></tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr><td colSpan={5} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No scan logs captured.</td></tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <Badge variant="outline" className="text-[9px] uppercase border-primary/20 text-primary">
                            {log.toolType}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono text-xs font-bold">
                             {log.playerId} <span className="text-muted-foreground">({log.zoneId})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground text-xs">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-[10px] font-bold uppercase text-white truncate max-w-[120px]">{log.userId === 'guest' ? 'Public Guest' : log.userId}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteLog(log.id)}>
                            <Trash2 className="h-4 w-4" />
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
      </div>
    </div>
  );
}
