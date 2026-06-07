"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function PersonalizationPage() {
  const router = useRouter();

  useEffect(() => {
    // Protocol decommissioned. Redirecting to home.
    router.replace("/");
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center bg-background text-foreground">
       <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Synchronizing Design Node...</p>
       </div>
    </div>
  );
}