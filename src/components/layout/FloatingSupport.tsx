"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, Bot, HelpCircle, Phone, Smartphone, Zap, MessageCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * @fileOverview Unified Floating Action Hub
 * Consolidation of AI and Support channels into a single draggable interface.
 */

export function FloatingSupport() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // 1. Position Persistence Protocol
  useEffect(() => {
    const saved = localStorage.getItem("aatma_hub_pos");
    if (saved) {
      setPosition(JSON.parse(saved));
    } else {
      // Default to bottom right
      setPosition({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      setPosition({
        x: Math.min(Math.max(20, clientX - 25), window.innerWidth - 80),
        y: Math.min(Math.max(20, clientY - 25), window.innerHeight - 80)
      });
    };

    const handleUp = () => {
      if (isDragging) {
        setIsDragging(false);
        // Snap to nearest side protocol
        const snapX = position.x > window.innerWidth / 2 ? window.innerWidth - 80 : 20;
        const finalPos = { x: snapX, y: position.y };
        setPosition(finalPos);
        localStorage.setItem("aatma_hub_pos", JSON.stringify(finalPos));
      }
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [isDragging, position]);

  const channels = [
    { name: "Aatma AI", icon: Bot, href: "/ai-assistant", color: "bg-primary" },
    { name: "WhatsApp HQ", icon: MessageSquare, href: "https://wa.me/918566936666", color: "bg-green-600" },
    { name: "Contact Admin", icon: Phone, href: "tel:+918566936666", color: "bg-blue-600" },
    { name: "Telegram Hub", icon: Send, href: "https://t.me/aatmahub", color: "bg-sky-500" },
    { name: "Support Hub", icon: HelpCircle, href: "/support", color: "bg-orange-600" },
  ];

  return (
    <div 
      ref={buttonRef}
      className="fixed z-[100] transition-transform duration-300 ease-out"
      style={{ 
        left: position.x, 
        top: position.y,
        touchAction: 'none'
      }}
    >
      {/* Expanded Menu Cluster */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-3 items-end animate-in slide-in-from-bottom-5 duration-300">
           {channels.map((ch, i) => (
             <Link 
              key={i} 
              href={ch.href} 
              onClick={() => setIsOpen(false)}
              target={ch.href.startsWith('http') ? "_blank" : "_self"}
              className="flex items-center gap-3 group"
             >
                <div className="bg-card border border-white/10 px-4 py-2 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                   <p className="text-[10px] font-black uppercase text-white tracking-widest">{ch.name}</p>
                </div>
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-xl hover:scale-110 transition-transform border border-white/10",
                  ch.color
                )}>
                   <ch.icon className="h-5 w-5" />
                </div>
             </Link>
           ))}
        </div>
      )}
      
      {/* Main Core Button */}
      <Button
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className={cn(
          "h-14 w-14 rounded-full shadow-2xl transition-all duration-500 neon-glow relative group border-2 border-white/10",
          isOpen ? 'bg-destructive rotate-90 scale-90' : 'bg-primary hover:scale-110 active:scale-95'
        )}
        onClick={() => !isDragging && setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6 fill-current" />}
        {!isOpen && (
          <div className="absolute inset-0 rounded-full bg-white/20 animate-ping opacity-20 pointer-events-none" />
        )}
      </Button>
    </div>
  );
}
