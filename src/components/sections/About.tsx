"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "motion/react";
import { useRef, type PointerEvent } from "react";
import { Hammer, Hand, BadgeCheck, Users, MapPin } from "lucide-react";
import { about } from "@/lib/content";
import { Reveal, SectionHeader } from "@/components/ui/primitives";
import CarScene from "./CarScene";

const whyIcons = [Hammer, Hand, BadgeCheck, Users];

/** Holographic "company ID" card: tilts and catches light as you move. */
function GlanceCard() {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 150, damping: 15 });
  const ry = useSpring(0, { stiffness: 150, damping: 15 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(30);
  const holo = useMotionTemplate`radial-gradient(circle at ${gx}% ${gy}%, rgb(238 122 12 / 0.16), transparent 45%)`;

  const move = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    gx.set(x * 100);
    gy.set(y * 100);
    if (e.pointerType === "mouse") {
      ry.set((x - 0.5) * 22);
      rx.set(-(y - 0.5) * 18);
    }
  };
  const leave = () => {
    rx.set(0);
    ry.set(0);
    gx.set(50);
    gy.set(30);
  };

  return (
    <div style={{ perspective: 1200 }} className="h-full w-full">
      <motion.div
        ref={ref}
        onPointerMove={move}
        onPointerLeave={leave}
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        className="relative flex h-full flex-col justify-between overflow-hidden rounded-md border border-cream bg-panel p-7 sm:p-9"
      >
        <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: holo }} />
        <div className="relative flex items-start justify-between" style={{ transform: "translateZ(40px)" }}>
          <div>
            <p className="eyebrow">At a glance</p>
            <p className="mt-2 font-brand text-2xl font-semibold uppercase tracking-[0.12em] text-cream">
              Enlight <span className="text-grad">Wisdom</span>
            </p>
          </div>
          <img src="/brand/ew-cap.png" alt="" className="h-10 w-auto drop-" />
        </div>
        <dl className="relative mt-8 divide-y divide-line" style={{ transform: "translateZ(25px)" }}>
          {about.glance.map((g) => (
            <div key={g.k} className="grid grid-cols-[8.5rem_1fr] gap-4 py-3.5 text-sm">
              <dt className="font-mono text-[0.7rem] uppercase tracking-[0.18em] text-muted">{g.k}</dt>
              <dd className="font-medium text-cream">
                {g.k === "Based in" && <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-amber" aria-hidden="true" />}
                {g.v}
              </dd>
            </div>
          ))}
        </dl>
        <div className="relative mt-6 flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted" style={{ transform: "translateZ(15px)" }}>
          <span>Chennai · India</span>
          <span className="flex gap-0.5" aria-hidden="true">
            {Array.from({ length: 22 }).map((_, i) => (
              <span key={i} className="inline-block h-5 bg-sand/60" style={{ width: i % 3 === 0 ? 3 : 1.5 }} />
            ))}
          </span>
        </div>
      </motion.div>
    </div>
  );
}

export default function About() {
  return (
    <section id="about" data-nav="light" className="theme-light relative overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="02" eyebrow={about.label} title={about.headline} intro={about.body} />

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <CarScene />
          </Reveal>
          <Reveal delay={0.15} className="lg:col-span-5">
            <GlanceCard />
          </Reveal>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="hidden lg:col-span-3 lg:block" />
          <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:col-span-9">
            {about.split.map((s, i) => (
              <Reveal key={s.t} delay={0.1 + i * 0.1} className="h-full bg-paper p-6">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber">{i === 0 ? "Division one" : "Division two"}</p>
                <p className="mt-3 text-xl font-semibold text-cream">{s.t}</p>
                <p className="mt-2 text-sm leading-relaxed text-sand">{s.d}</p>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-28 grid gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-3">
            <h3 className="display text-4xl text-cream sm:text-5xl">
              Why people <span className="serif-i">choose us</span>
            </h3>
          </Reveal>
          <div role="list" className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:col-span-9 lg:grid-cols-4">
            {about.why.map((w, i) => {
              const Icon = whyIcons[i];
              return (
                <Reveal key={w.t} delay={i * 0.08}>
                  <div role="listitem" className="group border-t-2 border-cream pt-5">
                    <div className="flex items-center justify-between">
                      <span className="serif-i text-4xl text-amber">{i + 1}.</span>
                      <Icon className="h-5 w-5 text-muted transition-transform duration-500 group-hover:-rotate-12 group-hover:text-cream" aria-hidden="true" />
                    </div>
                    <p className="mt-4 text-lg font-semibold leading-snug text-cream">{w.t}</p>
                    <p className="mt-2 text-sm leading-relaxed text-sand">{w.d}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
