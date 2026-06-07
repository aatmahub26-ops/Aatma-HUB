
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Wallet, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-white/5 text-center overflow-hidden">
          <div className="h-2 bg-green-500 w-full" />
          <CardContent className="p-12 space-y-6">
            <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-headline font-bold">RECHARGE SUCCESSFUL</h1>
              <p className="text-muted-foreground">Your wallet balance has been updated instantly. Get back to the action!</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-12 font-bold neon-glow">
                <Link href="/catalog">
                  Browse Games
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-12 border-white/5">
                <Link href="/wallet">
                  <Wallet className="mr-2 h-4 w-4 text-primary" />
                  View Wallet
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
