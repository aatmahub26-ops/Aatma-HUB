
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, MessageSquare, ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ResellerEnrollment() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4 py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -z-10" />
        
        <Card className="w-full max-w-lg bg-card/60 backdrop-blur-xl border-white/5 shadow-2xl rounded-[2.5rem] text-center">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-3 rounded-2xl shadow-[0_0_30px_rgba(158,102,255,0.3)]">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-headline font-bold tracking-tighter uppercase">B2B Enrollment Locked</CardTitle>
            <CardDescription className="text-muted-foreground">The Aatma HUB Reseller Program is now invite-only.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="p-6 bg-primary/5 border border-primary/20 rounded-2xl">
               <p className="text-sm text-muted-foreground leading-relaxed">
                  To ensure 100% distribution efficiency, enrollment is now manually managed by the Admin HQ squad. 
                  If you are a high-volume distributor, please contact our team via WhatsApp to initialize your business node.
               </p>
            </div>
            <div className="flex flex-col gap-3">
               <Button className="h-14 font-bold bg-green-600 hover:bg-green-700 text-white rounded-2xl uppercase tracking-widest" asChild>
                  <a href="https://wa.me/918566936666" target="_blank">
                     <MessageSquare className="mr-2 h-5 w-5" /> Contact Admin Node
                  </a>
               </Button>
               <Button variant="ghost" asChild className="h-10 text-xs font-bold uppercase text-muted-foreground">
                  <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Return to Hub</Link>
               </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
