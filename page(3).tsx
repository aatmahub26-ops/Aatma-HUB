
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Search, ShieldAlert, Clock, User, Target, Filter, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Input } from "@/components/ui/input";

export default function AuditTrail() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const q = query(collection(db, "admin_activity_logs"), orderBy("createdAt", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(l => 
    l.adminEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.details?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-headline font-bold uppercase tracking-tight">Audit Trail Hub</h2>
          <p className="text-muted-foreground">Immutable ledger of all administrative intelligence operations.</p>
        </div>
        <Badge variant="outline" className="border-primary/20 text-primary uppercase font-bold tracking-widest px-4 h-9">
           Security Sync: Active
        </Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Filter by admin, action or target..." 
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
                  <th className="px-8 py-5">Operator</th>
                  <th className="px-8 py-5">Protocol</th>
                  <th className="px-8 py-5">Intelligence Payload</th>
                  <th className="px-8 py-5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={4} className="py-20 text-center text-muted-foreground uppercase font-bold tracking-widest text-xs">No activity captured in buffer.</td></tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                           </div>
                           <p className="font-bold text-white text-xs truncate max-w-[150px]">{log.adminEmail}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <Badge className={`text-[8px] uppercase font-bold border-none px-2 h-4 ${
                          log.action.includes('BAN') ? 'bg-destructive/10 text-destructive' : 
                          log.action.includes('WALLET') ? 'bg-green-500/10 text-green-500' : 
                          'bg-primary/10 text-primary'
                        }`}>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">
                           {log.details}
                        </p>
                        {log.targetId && (
                           <div className="flex items-center gap-1 mt-1 opacity-50">
                              <Target className="h-2.5 w-2.5" />
                              <span className="text-[8px] font-mono uppercase tracking-tighter">NODE::{log.targetId.substring(0, 12)}</span>
                           </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex flex-col items-end gap-1">
                           <div className="flex items-center gap-1.5 text-[9px] font-bold text-muted-foreground uppercase">
                              <Clock className="h-3 w-3" />
                              {new Date(log.createdAt).toLocaleDateString()}
                           </div>
                           <span className="text-[8px] font-mono opacity-30">{new Date(log.createdAt).toLocaleTimeString()}</span>
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
    </div>
  );
}
