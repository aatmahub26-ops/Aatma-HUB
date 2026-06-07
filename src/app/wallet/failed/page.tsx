
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { XCircle, RefreshCw, Headphones } from "lucide-react";
import Link from "next/link";

export default function PaymentFailedPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-white/5 text-center overflow-hidden">
          <div className="h-2 bg-destructive w-full" />
          <CardContent className="p-12 space-y-6">
            <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-headline font-bold text-destructive uppercase">Payment Failed</h1>
              <p className="text-muted-foreground">Something went wrong during the transaction. No funds were debited.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-12 font-bold" variant="destructive">
                <Link href="/wallet/add">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-12 border-white/5">
                <Link href="/support">
                  <Headphones className="mr-2 h-4 w-4 text-primary" />
                  Contact Support
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
