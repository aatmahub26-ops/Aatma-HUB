"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, LayoutGrid, Wallet, History, User, LogOut, Gift, LayoutDashboard, Settings, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getUserRank } from "@/lib/ranks";

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, logout } = useAuth();
const [open, setOpen] = useState(false);

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Wallet", icon: Wallet, href: "/wallet" },
    { label: "Orders", icon: History, href: "/orders" },
  ];

  const handleLogout = async () => {
  setOpen(false);
  await logout();
  router.push("/login");
};

  const rank = getUserRank(profile?.lifetimeRechargeAmount || 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="bg-card/90 backdrop-blur-3xl border-t border-white/10 px-4 py-4 flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.8)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1.5 transition-all duration-300",
                isActive ? "scale-110" : "opacity-40 hover:opacity-100"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-500 relative",
                isActive ? "bg-primary text-white shadow-[0_0_20px_rgba(158,102,255,0.6)]" : "text-white"
              )}>
                <item.icon className={cn("h-5 w-5", isActive ? "animate-in zoom-in duration-300" : "")} />
              </div>
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest leading-none mt-1",
                isActive ? "text-primary" : "text-white"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Profile Node in Bottom Nav */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className={cn(
              "flex flex-col items-center gap-1.5 transition-all duration-300",
              pathname.includes("/profile") ? "scale-110" : "opacity-40 hover:opacity-100"
            )}>
              <div className={cn(
                "p-2.5 rounded-2xl transition-all duration-500 relative",
                pathname.includes("/profile") ? "bg-primary text-white shadow-[0_0_20px_rgba(158,102,255,0.6)]" : "text-white"
              )}>
                <User className="h-5 w-5" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1 text-white">Profile</span>
            </button>
          </SheetTrigger>
          <SheetContent side="bottom" className="bg-card/95 backdrop-blur-2xl border-white/10 rounded-t-[2.5rem] p-0 overflow-hidden h-[70vh]">
            <div className="bg-primary/10 p-8 border-b border-white/5 flex flex-col items-center text-center space-y-4">
               <Avatar className="h-24 w-24 border-4 border-primary shadow-2xl">
                  <AvatarImage src={`https://picsum.photos/seed/${user?.uid}/100/100`} />
                  <AvatarFallback className="bg-muted text-2xl font-black">{profile?.firstName?.charAt(0)}</AvatarFallback>
               </Avatar>
               <div>
                  <h3 className="text-xl font-headline font-bold uppercase tracking-tight text-white">{profile?.firstName} {profile?.lastName}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                     <Badge className={`${rank.color.replace('text-', 'bg-')}/20 ${rank.color} border-none font-bold uppercase text-[9px] tracking-widest`}>{rank.tier} Rank</Badge>
                     <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">ID: {user?.uid.substring(0, 10)}</p>
                  </div>
               </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(70vh-200px)] space-y-2">
               <ProfileMenuItem href="/profile" icon={User} label="Profile" onClick={() => setOpen(false)} />

<ProfileMenuItem href="/wallet" icon={Wallet} label="Wallet" onClick={() => setOpen(false)} />

<ProfileMenuItem href="/referral" icon={Gift} label="Referral" onClick={() => setOpen(false)} />

<ProfileMenuItem href="/orders" icon={History} label="Orders" onClick={() => setOpen(false)} />

<ProfileMenuItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" onClick={() => setOpen(false)} />

{profile?.role === "admin" && (
  <ProfileMenuItem
    href="/admin"
    icon={Settings}
    label="Admin HQ Control"
    color="text-destructive"
    onClick={() => setOpen(false)}
  />
)}
               
               <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 transition-all mt-6"
               >
                  <LogOut className="h-5 w-5" />
                  <span className="font-bold text-xs uppercase tracking-widest">Terminate Session</span>
               </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function ProfileMenuItem({
  href,
  icon: Icon,
  label,
  color,
  onClick,
}: any) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary/30 transition-all group",
        color
      )}
    >
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="h-5 w-5" />
        </div>
        <span className="font-bold text-[11px] uppercase tracking-widest">
          {label}
        </span>
      </div>
      <Award className="h-4 w-4 opacity-20" />
    </Link>
  );
}
