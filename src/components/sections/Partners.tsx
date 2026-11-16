"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useCallback } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { ChevronLeft, ChevronRight, GripHorizontal } from "lucide-react";
import { partners } from "@/lib/content";
import { Reveal, SectionHeader } from "@/components/ui/primitives";
import { cn, clamp } from "@/lib/utils";

const filters = ["All", "Our clients", "Our MOU partners"] as const;
type Filter = (typeof filters)[number];

const initials = (n: string) =>
  n
    .replace(/[^A-Za-z .]/g, "")
    .split(/[ .]+/)
    .filter((w) => w.length > 1 || /[A-Z]/.test(w))
    .filter((w) => !["of", "and", "the"].includes(w.toLowerCase()))
    .slice(0, 3)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export default function Partners() {
  const [filter, setFilter] = useState<Filter>("All");
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [bounds, setBounds] = useState({ min: 0, max: 0 });
  const [progress, setProgress] = useState(0);
  const list = partners.items.filter((p) => filter === "All" || p.group === filter);

  const measure = useCallback(() => {
    const vw = viewport.current?.clientWidth ?? 0;
    const tw = track.current?.scrollWidth ?? 0;
    const min = Math.min(0, vw - tw);
    setBounds({ min, max: 0 });
    if (x.get() < min) x.set(min);
  }, [x]);

  useEffect(() => {
    animate(x, 0, { type: "spring", stiffness: 200, damping: 30 });
    const id = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(id);
  }, [filter, measure, x]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (viewport.current) ro.observe(viewport.current);
    return () => ro.disconnect();
  }, [measure]);

  useMotionValueEvent(x, "change", (v) => setProgress(bounds.min ? v / bounds.min : 0));

  const step = (dir: 1 | -1) => {
    const card = track.current?.firstElementChild as HTMLElement | null;
    const w = (card?.offsetWidth ?? 280) + 16;
    animate(x, clamp(x.get() - dir * w * 2, bounds.min, 0), { type: "spring", stiffness: 220, damping: 30 });
  };

  return (
    <section id="partners" data-nav="light" className="theme-light relative px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="06" eyebrow="Clients and MOU partners" title={partners.headline} intro={partners.intro}
          aside={
            <>
              <button onClick={() => step(-1)} disabled={progress <= 0.001} className="btn-ghost grid h-12 w-12 place-items-center rounded-full text-cream disabled:opacity-30" aria-label="Previous partners">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={() => step(1)} disabled={progress >= 0.999 || bounds.min === 0} className="btn-ghost grid h-12 w-12 place-items-center rounded-full text-cream disabled:opacity-30" aria-label="Next partners">
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          }
        />

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Filter partners">
            {filters.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={cn("relative rounded-full px-4 py-2 text-sm font-medium transition-colors", filter === f ? "text-on-accent" : "text-sand/80 hover:text-cream")}
              >
                {filter === f && <motion.span layoutId="partner-filter" className="absolute inset-0 rounded-full bg-accent" />}
                <span className="relative">
                  {f} <span className="opacity-60">({f === "All" ? partners.items.length : partners.items.filter((p) => p.group === f).length})</span>
                </span>
              </button>
            ))}
          </div>
        </Reveal>
      </div>

      <div ref={viewport} className="mx-auto mt-10 max-w-[90rem] overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
        <motion.div
          ref={track}
          drag="x"
          dragConstraints={{ left: bounds.min, right: 0 }}
          dragElastic={0.12}
          style={{ x }}
          className="flex w-max cursor-grab gap-4 py-4 active:cursor-grabbing"
        >
          {list.map((p, i) => (
            <motion.div
              key={p.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileHover={{ y: -6 }}
              className="glass group relative flex h-48 w-[16rem] shrink-0 select-none flex-col justify-between overflow-hidden rounded-md p-6"
            >
              <div aria-hidden="true" className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange/0 transition-colors duration-500 group-hover:bg-orange/30" />
              <div className="flex items-start justify-between">
                {p.logo ? (
                  <span className="relative block h-16 w-20">
                    <Image src={p.logo} alt={`${p.name} logo`} fill sizes="80px" className="object-contain object-left opacity-80 grayscale transition duration-500 group-hover:opacity-100 group-hover:grayscale-0" draggable={false} />
                  </span>
                ) : (
                  <span className="grid h-14 w-14 place-items-center rounded-md border border-line bg-white/[0.05] font-brand text-lg font-semibold tracking-wider text-grad">
                    {initials(p.name)}
                  </span>
                )}
                <span className={cn("rounded-full px-2.5 py-1 font-mono text-[0.6rem] uppercase tracking-[0.15em]", p.group === "Our clients" ? "bg-amber/15 text-amber" : "bg-cream/10 text-sand")}>
                  {p.group === "Our clients" ? "Client" : "MOU partner"}
                </span>
              </div>
              <div>
                <p className="font-display text-xl font-semibold leading-tight text-cream">{p.name}</p>
                {p.note && <p className="mt-1 text-xs text-muted">{p.note}</p>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mx-auto mt-6 flex max-w-[90rem] items-center gap-4">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
          <motion.div className="h-full origin-left bg-accent" style={{ scaleX: Math.max(0.04, progress) }} />
        </div>
        <span className="flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted">
          <GripHorizontal className="h-3.5 w-3.5" aria-hidden="true" /> Drag
        </span>
      </div>
    </section>
  );
}
