
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ShieldAlert, Headphones, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function PendingReseller() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-white/5 text-center overflow-hidden">
           <div className="h-1.5 bg-orange-500 w-full" />
           <CardContent className="p-12 space-y-6">
              <div className="h-20 w-20 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold uppercase">Application Pending</h1>
                <p className="text-muted-foreground">Your business account is under manual review by the Aatma HQ squad. This usually takes 2-6 hours.</p>
              </div>
              <div className="space-y-3 pt-4">
                 <Button className="w-full h-12 border-white/10" variant="outline" asChild>
                    <a href="https://wa.me/918566936666" target="_blank">
                       <Headphones className="mr-2 h-4 w-4 text-primary" /> Contact Verification Squad
                    </a>
                 </Button>
                 <Button variant="ghost" asChild className="text-muted-foreground h-10">
                    <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Store</Link>
                 </Button>
              </div>
           </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
