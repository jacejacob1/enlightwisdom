"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/** Buttery smooth scrolling (Lenis) + liquid-glass capability flag. */
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Real refraction only where backdrop-filter: url() is supported (Chromium, not Safari/Firefox).
    const ua = navigator.userAgent;
    const chromium = /Chrome|Chromium|Edg\//.test(ua) && !/Firefox|FxiOS/.test(ua);
    if (chromium) document.documentElement.classList.add("liquid-on");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true, anchors: false });
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
