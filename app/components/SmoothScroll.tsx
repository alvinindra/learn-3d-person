"use client";

import { useEffect, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

interface SmoothScrollProps {
  children: ReactNode;
}

// Pages that use their own scroll system (like ScrollControls)
const EXCLUDED_PATHS = ["/jumping"];

export function SmoothScroll({ children }: SmoothScrollProps) {
  const pathname = usePathname();
  const isExcluded = EXCLUDED_PATHS.some((path) => pathname?.startsWith(path));

  useEffect(() => {
    // Don't initialize Lenis on excluded pages
    if (isExcluded) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isExcluded]);

  return <>{children}</>;
}
