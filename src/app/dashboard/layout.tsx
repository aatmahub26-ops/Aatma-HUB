"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { LayoutDashboard, Gamepad2, Wallet, UserCircle, Gift, Bell, LogOut, ChevronLeft, History, Loader2, ShieldCheck, Bot, Palette } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const menuItems = [
    { title: "Overview", icon: LayoutDashboard, url: "/dashboard" },
    { title: "AI Assistant", icon: Bot, url: "/ai-assistant" },
    { title: "My Orders", icon: History, url: "/orders" },
    { title: "Wallet & Funds", icon: Wallet, url: "/wallet" },
    { title: "Personalization", icon: Palette, url: "/settings/personalization" },
    { title: "Identity Verification", icon: ShieldCheck, url: "/kyc" },
    { title: "Refer & Earn", icon: Gift, url: "/referral" },
    { title: "Profile Settings", icon: UserCircle, url: "/profile" },
  ];

  if (loading || !user) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background w-full">
        <Sidebar className="border-r border-white/5">
          <SidebarContent className="bg-card">
            <div className="p-6">
              <Link href="/" className="flex items-center space-x-2">
                <div className="bg-primary p-1 rounded-lg">
                  <Gamepad2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-headline text-lg font-bold tracking-tighter">
                  AATMA <span className="text-primary">HUB</span>
                </span>
              </Link>
            </div>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={pathname === item.url}>
                        <Link href={item.url} className="flex items-center space-x-3 px-3 py-2">
                          <item.icon className={`h-5 w-5 ${pathname === item.url ? 'text-primary' : ''}`} />
                          <span className="font-medium">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            
            <div className="mt-auto p-4 border-t border-white/5">
              <SidebarMenuButton className="text-destructive w-full" onClick={logout}>
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-medium">Logout</span>
              </SidebarMenuButton>
            </div>
          </SidebarContent>
        </Sidebar>
        
        <SidebarInset className="flex flex-col bg-background">
          <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="font-headline font-bold text-lg">
                Dashboard <span className="text-muted-foreground">/</span> {menuItems.find(m => m.url === pathname)?.title || "Overview"}
              </h1>
            </div>
            <Link href="/" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
               <ChevronLeft className="h-3 w-3" />
               Back to Shop
            </Link>
          </header>
          <main className="p-6 overflow-y-auto">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
