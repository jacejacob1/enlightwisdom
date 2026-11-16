"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform, useMotionValueEvent } from "motion/react";
import { ArrowUpRight, CalendarCheck, Bot } from "lucide-react";
import { services } from "@/lib/content";
import { Reveal, SectionHeader, Tag } from "@/components/ui/primitives";
import ServiceArt from "./ServiceArt";
import { cn, enquire } from "@/lib/utils";

function Process() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 20 });
  const left = useTransform(p, (v) => `${v * 100}%`);
  const [step, setStep] = useState(0);
  useMotionValueEvent(p, "change", (v) => setStep(Math.min(4, Math.floor(v * 4.999))));

  return (
    <div ref={ref} className="mt-28">
      <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="display text-4xl text-cream sm:text-5xl">{services.processTitle}</h3>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Step <span className="text-amber">0{step + 1}</span> / 05 · keep scrolling
          </p>
        </div>
      </Reveal>

      {/* track (desktop) */}
      <div className="relative mt-14 hidden md:block">
        <div className="absolute left-0 right-0 top-6 h-[3px] rounded-full bg-white/10" />
        <motion.div className="absolute left-0 top-6 h-[3px] origin-left rounded-full bg-accent" style={{ scaleX: p, width: "100%" }} />
        <motion.div style={{ left }} className="absolute top-6 z-10 -ml-6 -mt-6">
          <div className="grid h-12 w-12 place-items-center rounded-md bg-accent text-on-accent">
            <Bot className="h-6 w-6" aria-hidden="true" />
          </div>
        </motion.div>
      </div>

      <ol className="relative mt-6 grid gap-4 md:mt-24 md:grid-cols-5">
        {services.process.map((s, i) => {
          const on = i <= step;
          return (
            <li key={s.t} className={cn("rounded-md border p-5 transition-all duration-500", on ? "border-amber/40 bg-white/[0.05] md:-translate-y-1" : "border-line bg-white/[0.015] opacity-60")}>
              <span className={cn("font-mono text-xs", on ? "text-amber" : "text-muted")}>0{i + 1}</span>
              <p className="mt-2 font-display text-xl font-semibold text-cream">{s.t}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-sand/75">{s.d}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function Services() {
  const [active, setActive] = useState(0);
  const s = services.items[active];

  return (
    <section id="services" data-nav="dark" className="theme-dark relative px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="03" eyebrow={services.label} title={services.headline} intro={services.intro}
          aside={
            <>
              <button
                onClick={() => enquire({ interest: "Automation services for my business", message: "I'd like to book a consultation about automating part of our work." })}
                className="btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3.5 font-semibold"
              >
                <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                {services.cta}
              </button>
            </>
          }
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-[1fr_1.1fr]">
          {/* service list */}
          <Reveal className="order-2 lg:order-1">
            <ul className="divide-y divide-line border-y border-line" role="tablist" aria-label="Services" aria-orientation="vertical">
              {services.items.map((it, i) => (
                <li key={it.name}>
                  <button
                    role="tab"
                    aria-selected={active === i}
                    aria-controls="service-panel"
                    onClick={() => setActive(i)}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    className="group relative flex w-full items-center gap-5 py-5 text-left"
                  >
                    {active === i && <motion.span layoutId="svc-bar" className="absolute -left-4 top-3 bottom-3 w-[3px] rounded-full bg-accent" />}
                    <span className={cn("font-mono text-xs transition-colors", active === i ? "text-amber" : "text-muted")}>0{i + 1}</span>
                    <span className={cn("flex-1 font-display text-xl font-semibold tracking-tight transition-all duration-300 sm:text-2xl", active === i ? "translate-x-1 text-cream" : "text-sand/55 group-hover:text-sand")}>
                      {it.name}
                    </span>
                    <ArrowUpRight className={cn("h-5 w-5 transition-all duration-300", active === i ? "rotate-45 text-amber" : "text-muted opacity-0 group-hover:opacity-100")} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* detail panel */}
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <div id="service-panel" role="tabpanel" className="glass relative overflow-hidden rounded-md p-6 sm:p-8 lg:sticky lg:top-28">
              <div className="relative h-52 overflow-hidden rounded-md border border-line bg-sunk sm:h-60">
                <AnimatePresence mode="wait">
                  <motion.div key={s.icon} initial={{ opacity: 0, scale: 0.92, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, scale: 1.05, filter: "blur(8px)" }} transition={{ duration: 0.4 }} className="absolute inset-0 p-4">
                    <ServiceArt icon={s.icon} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={s.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                  <h3 className="mt-7 font-display text-3xl font-bold tracking-tight text-cream">{s.name}</h3>
                  <p className="mt-3 text-base leading-relaxed text-sand/85">{s.d}</p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                  <button
                    onClick={() => enquire({ interest: "Automation services for my business", message: `I'd like to talk about ${s.name}.` })}
                    className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-amber transition-colors hover:text-cream"
                  >
                    Discuss {s.name.split(" (")[0].toLowerCase()} with an engineer <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>
        </div>

        <Process />
      </div>
    </section>
  );
}
