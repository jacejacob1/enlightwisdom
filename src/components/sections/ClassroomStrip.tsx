"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { X, ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { education } from "@/lib/content";
import { Reveal } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

/**
 * Real photos from Enlight Wisdom sessions. The strip drifts sideways as you scroll,
 * and any frame opens full size in a viewer (arrow keys / Esc work).
 */
export default function ClassroomStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const photos = education.classroom;
  const [open, setOpen] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["4%", "-38%"]);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((o) => (o === null ? o : (o + 1) % photos.length));
      if (e.key === "ArrowLeft") setOpen((o) => (o === null ? o : (o - 1 + photos.length) % photos.length));
    };
    window.addEventListener("keydown", key);
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", key);
      lenis?.start();
    };
  }, [open, photos.length]);

  return (
    <div ref={ref} className="mt-24">
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <h3 className="display text-4xl text-cream sm:text-5xl">
            From our <span className="serif-i">classrooms</span>
          </h3>
        </Reveal>
        <Reveal delay={0.1} className="lg:col-span-9">
          <p className="max-w-md text-sand">Real sessions run by our trainers. Tap any photo to see it full size.</p>
        </Reveal>
      </div>

      <div className="-mx-5 mt-10 overflow-hidden sm:-mx-8">
        <motion.ul style={{ x }} className="flex w-max items-end gap-4 px-5 sm:px-8">
          {photos.map((p, i) => {
            const small = p.w < 600;
            const portrait = p.h > p.w;
            return (
              <li key={p.src}>
                <button
                  onClick={() => setOpen(i)}
                  className={cn(
                    "group/photo relative block overflow-hidden rounded-[4px] bg-ink",
                    small ? "h-[200px] w-[270px]" : portrait ? "h-[420px] w-[315px]" : "h-[340px] w-[453px]"
                  )}
                  aria-label={`Open photo: ${p.alt}`}
                >
                  <Image src={p.src} alt={p.alt} fill sizes={small ? "270px" : "460px"} className="photo-grade object-cover transition-[filter,transform] duration-700 group-hover/photo:scale-[1.04]" />
                  <span aria-hidden="true" className="photo-tint pointer-events-none absolute inset-0 transition-opacity duration-700" />
                  <span className="absolute left-3 top-3 rounded-full bg-paper/90 px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-ink">
                    Fig. {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-paper text-ink opacity-0 transition-opacity group-hover/photo:opacity-100">
                    <Expand className="h-4 w-4" aria-hidden="true" />
                  </span>
                </button>
              </li>
            );
          })}
        </motion.ul>
      </div>

      <AnimatePresence>
        {open !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="theme-dark fixed inset-0 z-[80] flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Photo viewer"
            onClick={() => setOpen(null)}
          >
            <div className="flex items-center justify-between px-5 py-4 sm:px-8">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-sand">
                Fig. {String(open + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
              </span>
              <button onClick={() => setOpen(null)} className="grid h-11 w-11 place-items-center rounded-full border border-line text-cream hover:border-cream" aria-label="Close viewer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="relative flex-1" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div key={open} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-4 sm:inset-x-24 sm:inset-y-4">
                  <Image src={photos[open].src} alt={photos[open].alt} fill sizes="100vw" className="object-contain" />
                </motion.div>
              </AnimatePresence>
              <button onClick={() => setOpen((open - 1 + photos.length) % photos.length)} className="absolute left-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink sm:left-6" aria-label="Previous photo">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => setOpen((open + 1) % photos.length)} className="absolute right-3 top-1/2 grid h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-paper text-ink sm:right-6" aria-label="Next photo">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <p className="px-5 py-5 text-center text-sm text-sand sm:px-8">{photos[open].alt}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
