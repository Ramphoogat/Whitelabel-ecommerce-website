"use client";

import { useEffect } from "react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    let lenis: InstanceType<typeof import("@studio-freight/lenis").default> | null = null;
    let rafId: number;

    async function initLenis() {
      const { default: Lenis } = await import("@studio-freight/lenis");
      lenis = new Lenis({ duration: 1.2, easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });

      try {
        const { gsap } = await import("gsap");
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");
        gsap.registerPlugin(ScrollTrigger);
        lenis.on("scroll", () => ScrollTrigger.update());
        gsap.ticker.add((time) => lenis!.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
      } catch {
        function raf(time: number) { lenis!.raf(time); rafId = requestAnimationFrame(raf); }
        rafId = requestAnimationFrame(raf);
      }
    }

    initLenis();
    return () => {
      lenis?.destroy();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <>{children}</>;
}
