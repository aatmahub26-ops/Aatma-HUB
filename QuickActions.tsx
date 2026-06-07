"use client";

import { Wallet, History, Users, Ticket } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export function QuickActions() {
  const { user } = useAuth();

  const actions = [
    { label: "Add Money", icon: Wallet, href: "/wallet/add", color: "text-green-500", bg: "bg-green-500/10" },
    { label: "My Orders", icon: History, href: "/orders", color: "text-primary", bg: "bg-primary/10" },
    { label: "Invite Squad", icon: Users, href: "/referral", color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Redeem", icon: Ticket, href: "/catalog", color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0 py-1">
      {actions.map((action, i) => (
        <Link key={i} href={user ? action.href : "/login"} className="group shrink-0">
           <div className="glass-card px-4 py-2.5 rounded-xl flex items-center gap-2.5 hover:border-primary/40 transition-all duration-300 shadow-md group-active:scale-95 border border-white/5 bg-white/5">
              <div className={`h-7 w-7 rounded-lg ${action.bg} flex items-center justify-center shrink-0 border border-white/5`}>
                 <action.icon className={`h-3.5 w-3.5 ${action.color}`} />
              </div>
              <span className="text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-primary transition-colors whitespace-nowrap">
                {action.label}
              </span>
           </div>
        </Link>
      ))}
    </div>
  );
}
