"use client";

import { usePersonalization } from "@/context/PersonalizationContext";
import { useEffect, useState } from "react";

/**
 * @fileOverview Global Wallpaper Rendering Node
 * Handles fixed background projection with alpha-blending.
 * Uses high-fidelity Unsplash endpoints for built-in categories.
 */

const BUILTIN_WALLPAPERS: Record<string, string> = {
  "gaming": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
  "anime": "https://images.unsplash.com/photo-1578632738908-451145156358?q=80&w=2070&auto=format&fit=crop",
  "cyberpunk": "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2070&auto=format&fit=crop",
  "space": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2070&auto=format&fit=crop",
  "tech": "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop",
  "minimal": "https://images.unsplash.com/photo-1477346611705-65d1883cee1e?q=80&w=2070&auto=format&fit=crop",
  "abstract": "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop",
  "neon": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
  "default": "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2070&auto=format&fit=crop"
};

export function WallpaperBackground() {
  const { settings } = usePersonalization();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Resolve URL: Custom > Built-in > Default Test Node
  const wallpaperUrl = settings.customWallpaperUrl || BUILTIN_WALLPAPERS[settings.wallpaper] || BUILTIN_WALLPAPERS.default;
  const isActive = settings.wallpaper !== "default" || !!settings.customWallpaperUrl;

  if (!isActive && !settings.customWallpaperUrl) return null;

  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-black">
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${wallpaperUrl})`,
          opacity: settings.lowPerformanceMode ? 0.2 : 0.45,
          backgroundAttachment: 'fixed'
        }}
      />
      {/* Critical Dark Overlay Protocol: Opacity 0.55 */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]" /> 
      
      {/* Micro-texture layer */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}