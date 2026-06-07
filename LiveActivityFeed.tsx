
"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot, where, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Zap, UserCheck, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

type ActivityItem = {
  id: string;
  type: 'order' | 'recharge' | 'winner';
  text: string;
  user: string;
  amount?: string;
  timestamp: any;
};

export function LiveActivityFeed() {
  const { user, profile, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({ isEnabled: true });

  const maskName = (name: string | undefined) => {
    if (!name) return "Gamer***";
    if (name.includes('@')) {
      const parts = name.split('@');
      return parts[0].substring(0, 2) + "***@" + parts[1].substring(0, 3);
    }
    return name.substring(0, 2) + "***" + name.slice(-2);
  };

  useEffect(() => {
    // 1. Settings listener
    const unsubSettings = onSnapshot(doc(db, "system_settings", "live_activity"), (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as any);
      }
    });

    if (authLoading) return () => unsubSettings();

    // Reset feed on user change
    setActivities([]);

    if (!user) {
      setLoading(false);
      return () => unsubSettings();
    }

    // Use definitive role once profile is available
    const isAdminUser = profile?.role === 'admin';

    // 2. Orders Query Protocol
    const qOrders = isAdminUser 
      ? query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(4))
      : query(collection(db, "orders"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(4));

    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const newItems: ActivityItem[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: 'order',
          user: maskName(data.userEmail || data.userId),
          text: `Top-up: ${data.packageName}`,
          timestamp: data.createdAt
        };
      });
      updateFeed(newItems);
    }, (err) => {
      console.warn("LiveActivityFeed: Orders sync restricted.", err.message);
      setLoading(false);
    });

    // 3. Recharges Query Protocol
    const qRecharges = isAdminUser
      ? query(collection(db, "recharge_requests"), where("status", "==", "Approved"), orderBy("createdAt", "desc"), limit(4))
      : query(collection(db, "recharge_requests"), where("userId", "==", user.uid), where("status", "==", "Approved"), orderBy("createdAt", "desc"), limit(4));

    const unsubRecharges = onSnapshot(qRecharges, (snapshot) => {
      const newItems: ActivityItem[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          type: 'recharge',
          user: maskName(data.userEmail),
          text: `Wallet Recharge`,
          amount: `₹${data.amount}`,
          timestamp: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()
        };
      });
      updateFeed(newItems);
    }, (err) => {
      console.warn("LiveActivityFeed: Recharges sync restricted.", err.message);
      setLoading(false);
    });

    return () => {
      unsubSettings();
      unsubOrders();
      unsubRecharges();
    };
  }, [user, profile, authLoading]);

  const updateFeed = (newItems: ActivityItem[]) => {
    setActivities(prev => {
      const combined = [...newItems, ...prev];
      const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
      return unique.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 6);
    });
    setLoading(false);
  };

  if (!settings.isEnabled) return null;

  return (
    <Card className="bg-card border-white/5 h-full overflow-hidden animate-in fade-in duration-500 shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between p-3 bg-white/5 border-b border-white/5">
        <CardTitle className="text-[10px] font-headline font-bold uppercase tracking-widest flex items-center gap-2">
          <Activity className="h-3 w-3 text-primary animate-pulse" />
          {profile?.role === 'admin' ? 'Live Platform' : 'Personal Activity'}
        </CardTitle>
        <Badge variant="outline" className="text-[7px] uppercase border-green-500/30 text-green-500 bg-green-500/5 px-1 h-3.5">Active</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {loading ? (
            <div className="p-10 text-center">
               <Loader2 className="h-4 w-4 animate-spin mx-auto text-primary opacity-20" />
            </div>
          ) : activities.length === 0 ? (
            <div className="p-10 text-center opacity-20 uppercase font-bold text-[8px] tracking-widest leading-relaxed">
              {user ? 'Aatma node awaiting dispatches...' : 'Authenticate to view platform activity'}
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-3 flex items-start gap-2.5 hover:bg-white/5 transition-colors">
                <div className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${
                  activity.type === 'order' ? 'bg-primary/10' : 'bg-green-500/10'
                }`}>
                  {activity.type === 'order' ? <Zap className="h-3 w-3 text-primary" /> : <UserCheck className="h-3 w-3 text-green-500" />}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[8px] font-bold text-primary uppercase">{activity.user}</span>
                    <span className="text-[7px] text-muted-foreground font-bold uppercase">
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                    </span>
                  </div>
                  <p className="text-[10px] font-bold leading-tight truncate">
                    {activity.text} {activity.amount && <span className="text-green-500">{activity.amount}</span>}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
