"use client";

import Link from "next/link";
import { Gamepad2, Menu, X, Bot, ShoppingCart, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { itemCount } = useCart();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "notifications"), where("userId", "==", user.uid), where("read", "==", false));
      const unsub = onSnapshot(q, (snap) => setUnreadCount(snap.size));
      return () => unsub();
    }
  }, [user]);

  const isAdmin = profile?.role === 'admin';

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Marketplace", href: "/catalog" },
    { name: "AI Strategy", href: "/ai-assistant", icon: Bot },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Community", href: "/community" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/95 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 md:h-20 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="bg-primary p-2 md:p-2.5 rounded-xl shadow-[0_0_20px_rgba(158,102,255,0.4)] group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <span className="font-headline text-2xl md:text-3xl font-black tracking-tighter text-white uppercase leading-none">
              AATMA <span className="text-primary">HUB</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center space-x-10">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`text-[11px] font-black uppercase tracking-[0.2em] transition-colors relative group ${
                  pathname === link.href ? "text-primary" : "text-[#B8B8C0] hover:text-white"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-2 left-0 w-full h-0.5 bg-primary transition-transform origin-left ${pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
              </Link>
            ))}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="text-[11px] font-black uppercase tracking-[0.2em] text-destructive hover:text-destructive/80"
              >
                Admin HQ
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/10">
                  <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <Bell className="h-5 w-5 text-white" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-primary text-[8px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/cart" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
                    <ShoppingCart className="h-5 w-5 text-white" />
                    {itemCount > 0 && (
                      <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 bg-primary text-[8px] font-bold text-white rounded-full flex items-center justify-center border-2 border-background">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-white h-10 px-6" asChild><Link href="/login">Login</Link></Button>
                <Button className="neon-glow text-[10px] font-black uppercase tracking-[0.2em] h-10 px-8 rounded-xl bg-primary text-white border-none" asChild><Link href="/signup">Join Hub</Link></Button>
              </div>
            )}

            <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 rounded-xl text-white bg-white/5 border border-white/10" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isOpen && (
          <div className="lg:hidden py-10 border-t border-white/5 space-y-4 animate-in slide-in-from-top-4 bg-background">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                className={`flex items-center gap-6 px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-white rounded-3xl mx-4 ${pathname === link.href ? 'bg-primary/10 text-primary border border-primary/20' : 'hover:bg-white/5'}`} 
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link 
                href="/admin" 
                className="flex items-center gap-6 px-8 py-5 text-sm font-black uppercase tracking-[0.2em] text-destructive bg-destructive/5 rounded-3xl mx-4 border border-destructive/10" 
                onClick={() => setIsOpen(false)}
              >
                Admin HQ
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
