"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * @fileOverview Unified Tracking & Monitoring Node
 * Asynchronous shell for production analytics (GTM, GA4, Meta Pixel).
 * Does not block main thread.
 */

export function AnalyticsNode() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;

    // Logic: Capture route transitions for fulfillment funnel analysis
    const url = pathname + searchParams.toString();
    
    // Placeholder: window.gtag('config', 'GA_MEASUREMENT_ID', { page_path: url });
    console.debug(`[Intelligence Tracking] Node sync: ${url}`);
  }, [pathname, searchParams]);

  return null;
}
