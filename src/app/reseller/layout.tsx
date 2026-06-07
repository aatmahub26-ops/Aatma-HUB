
"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, ShoppingCart, Wallet, ShieldCheck, FileText, Code, LogOut, ArrowLeft, Gamepad2, TrendingUp, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect } from "react";

export default function ResellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/reseller/login");
      } else if (profile && (profile.role !== 'reseller' || profile.resellerStatus !== 'Approved')) {
        // Strict guard: Must have the role AND be approved by admin
        router.push("/dashboard");
      }
    }
  }, [user, profile, loading, router]);

  const menu = [
    { title: "B2B Dashboard", icon: LayoutDashboard, url: "/reseller" },
    { title: "Catalog Orders", icon: ShoppingCart, url: "/reseller/catalog" },
    { title: "Bulk Intake", icon: FileText, url: "/reseller/bulk" },
    { title: "Corporate Wallet", icon: Wallet, url: "/reseller/wallet" },
    { title: "KYC Compliance", icon: ShieldCheck, url: "/reseller/kyc" },
    { title: "Developer API", icon: Code, url: "/reseller/api" },
  ];

  if (loading || (user && profile && (profile.role !== 'reseller' || profile.resellerStatus !== 'Approved'))) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
           <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto" />
           <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Authenticating B2B Privileges...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full text-foreground">
        <Sidebar className="border-r border-white/5">
          <SidebarContent className="bg-card">
            <div className="p-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-primary p-1.5 rounded-lg shadow-lg">
                  <Gamepad2 className="h-6 w-6 text-white" />
                </div>
                <span className="font-headline text-xl font-bold tracking-tighter uppercase">
                  Aatma <span className="text-primary">B2B</span>
                </span>
              </Link>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="px-3">
                  {menu.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url} className={`flex items-center gap-3 px-3 py-6 rounded-xl transition-all ${pathname === item.url ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/5'}`}>
                          <item.icon className="h-5 w-5" />
                          <span className="font-bold text-xs uppercase tracking-widest">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4 border-t border-white/5">
               <button onClick={logout} className="flex w-full items-center gap-3 px-3 py-4 text-xs font-bold uppercase tracking-widest text-destructive hover:bg-destructive/5 rounded-xl transition-colors">
                  <LogOut className="h-4 w-4" /> Sign Out
               </button>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="bg-background">
           <header className="h-16 border-b border-white/5 flex items-center px-8 justify-between bg-card/40 backdrop-blur-md sticky top-0 z-40">
              <div className="flex items-center gap-4">
                 <SidebarTrigger />
                 <div className="h-4 w-px bg-white/10" />
                 <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reseller Portal / {profile?.resellerLevel} Tier</p>
              </div>
              <div className="flex items-center gap-4">
                 <ThemeToggle />
                 <div className="text-right">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">B2B Funds</p>
                    <p className="text-sm font-headline font-bold text-green-500">₹{profile?.walletBalance?.toFixed(2)}</p>
                 </div>
                 <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary border border-primary/20">RS</div>
              </div>
           </header>
           <main className="p-8 overflow-y-auto">
              {children}
           </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
