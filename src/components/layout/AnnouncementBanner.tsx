
"use client";

import { useState, useEffect } from "react";
import { X, Megaphone, Zap, Sparkles } from "lucide-react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function AnnouncementBanner() {
  const [isVisible, setIsOpen] = useState(true);
  const [announcement, setAnnouncement] = useState({
    text: "NEW: MLBB Weekly Diamond Pass now available at ₹160! | Double Reward Points Active.",
    badge: "FLASH DEAL",
    type: "promotion"
  });

  useEffect(() => {
    // Listen for global announcement settings from admin
    const unsub = onSnapshot(doc(db, "system_settings", "announcement"), (doc) => {
      if (doc.exists()) {
        setAnnouncement(doc.data() as any);
      }
    });
    return () => unsub();
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative z-[60] bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_auto] animate-marquee-slow border-b border-white/10 py-1.5 px-4 overflow-hidden shadow-[0_0_20px_rgba(158,102,255,0.3)]">
      <div className="container mx-auto flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
           <div className="bg-white/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest text-white animate-pulse">
              {announcement.badge}
           </div>
           <p className="text-[10px] md:text-xs font-bold text-white uppercase tracking-tight">
              {announcement.text}
           </p>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="absolute right-4 p-1 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="h-3 w-3 text-white/70" />
        </button>
      </div>
    </div>
  );
}
