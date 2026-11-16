"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import Image from "next/image";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Zap, Factory, GraduationCap, ChevronsLeftRight } from "lucide-react";
import { divisions } from "@/lib/content";
import { SectionHeader, Reveal } from "@/components/ui/primitives";
import { clamp, cn, scrollToId } from "@/lib/utils";

function PanelPhoto({ src, alt, position = "center" }: { src: string; alt: string; position?: string }) {
  return (
    <div className="group/photo relative h-full w-full overflow-hidden rounded-[4px] bg-ink">
      <Image src={src} alt={alt} fill sizes="420px" style={{ objectPosition: position }} className="photo-grade object-cover transition-[filter,transform] duration-700 group-hover/photo:scale-[1.04]" />
      <div aria-hidden="true" className="photo-tint pointer-events-none absolute inset-0 transition-opacity duration-700" />
    </div>
  );
}
const AutomationPhoto = () => <PanelPhoto src="/photos/robot-car.jpg" alt="A robot car built in the Enlight Wisdom lab" />;
const EducationPhoto = () => <PanelPhoto src="/photos/class/class-9.jpg" alt="A trainer guiding a young student through a robotics build" position="center 35%" />;

type PanelProps = {
  side: "left" | "right";
  share: MotionValue<number>;
};

function AutomationContent({ detail }: { detail?: MotionValue<number> }) {
  const d = divisions.automation;
  return (
    <>
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md bg-accent text-on-accent">
        <Factory className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="display text-[2.6rem] text-cream sm:text-5xl">{d.name}</h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-sand/85">{d.body}</p>
      <motion.ul style={detail ? { opacity: detail } : undefined} className="mt-6 space-y-3">
        {d.points.map((p) => (
          <li key={p.k} className="flex gap-3 text-sm text-sand">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
            <span>
              <strong className="text-cream">{p.k}:</strong> {p.v}
            </span>
          </li>
        ))}
      </motion.ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => scrollToId("services")} className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
          See services <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <button onClick={() => scrollToId("products")} className="btn-ghost inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold text-cream">
          See products
        </button>
      </div>
    </>
  );
}

function EducationContent({ detail }: { detail?: MotionValue<number> }) {
  const d = divisions.education;
  return (
    <>
      <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-md bg-cream text-on-accent">
        <GraduationCap className="h-6 w-6" aria-hidden="true" />
      </div>
      <h3 className="display text-[2.6rem] text-cream sm:text-5xl">{d.name}</h3>
      <p className="mt-4 max-w-md text-base leading-relaxed text-sand/85">{d.body}</p>
      <motion.ul style={detail ? { opacity: detail } : undefined} className="mt-6 space-y-3">
        {d.points.map((p) => (
          <li key={p.v} className="flex gap-3 text-sm text-sand">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber" />
            <span>{p.v}</span>
          </li>
        ))}
      </motion.ul>
      <div className="mt-8">
        <button onClick={() => scrollToId("education")} className="btn-primary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold">
          See education programmes <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

function Panel({ side, share }: PanelProps) {
  // share = % of width this panel owns
  const width = useTransform(share, (v) => `${v}%`);
  const detail = useTransform(share, [42, 62], [0, 1]);
  const contentOpacity = useTransform(share, [14, 30], [0, 1]);
  const artOpacity = useTransform(share, [56, 78], [0, 1]);
  const left = side === "left";
  return (
    <motion.div style={{ width }} className={cn("relative h-full shrink-0 overflow-hidden", left ? "theme-dark" : "theme-orange")}>
      <motion.div style={{ opacity: artOpacity }} className={cn("absolute bottom-10 h-72 w-[24rem]", left ? "right-10" : "left-10")}>
        {left ? <AutomationPhoto /> : <EducationPhoto />}
      </motion.div>
      <motion.div
        style={{ opacity: contentOpacity }}
        className={cn("absolute top-0 flex h-full w-[min(34rem,46vw)] flex-col justify-center p-10 xl:p-14", left ? "left-0" : "right-0")}
      >
        {left ? <AutomationContent detail={detail} /> : <EducationContent detail={detail} />}
      </motion.div>
    </motion.div>
  );
}

export default function Divisions() {
  const box = useRef<HTMLDivElement>(null);
  const p = useMotionValue(50);
  const rightShare = useTransform(p, (v) => 100 - v);
  const handleX = useTransform(p, (v) => `${v}%`);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false);
  const [val, setVal] = useState(50);
  useMotionValueEvent(p, "change", (v) => setVal(Math.round(v)));

  const setFromPointer = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (!r) return;
    p.set(clamp(((clientX - r.left) / r.width) * 100, 16, 84));
  };
  // window listeners + a ref keep the drag reliable even if a frame is slow to re-render
  const draggingRef = useRef(false);
  useEffect(() => {
    const move = (e: globalThis.PointerEvent) => draggingRef.current && setFromPointer(e.clientX);
    const up = () => {
      draggingRef.current = false;
      setDragging(false);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  });
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    setTouched(true);
    setFromPointer(e.clientX);
  };
  const snap = (to: number) => {
    setTouched(true);
    animate(p, to, { type: "spring", stiffness: 160, damping: 22 });
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") snap(clamp(p.get() - 8, 16, 84));
    if (e.key === "ArrowRight") snap(clamp(p.get() + 8, 16, 84));
    if (e.key === "Home") snap(16);
    if (e.key === "End") snap(84);
  };

  return (
    <section id="divisions" data-nav="light" className="theme-light relative px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="01" eyebrow="Who we are" title={divisions.title} intro={divisions.intro} />

        {/* desktop: drag the spark to explore either division */}
        <Reveal delay={0.1} className="mt-16 hidden md:block">
          <div ref={box} className="relative h-[620px] select-none overflow-hidden rounded-md">
            <div className="flex h-full">
              <Panel side="left" share={p} />
              <Panel side="right" share={rightShare} />
            </div>

            {/* clickable gutters snap the split toward a side */}
            <button
              onClick={() => snap(val > 60 ? 50 : 76)}
              className="absolute left-3 top-4 z-10 rounded-full bg-paper px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-white"
            >
              {val > 60 ? "Show both" : "Expand automation"}
            </button>
            <button
              onClick={() => snap(val < 40 ? 50 : 24)}
              className="absolute right-3 top-4 z-10 rounded-full bg-paper px-3 py-1.5 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-ink hover:bg-white"
            >
              {val < 40 ? "Show both" : "Expand education"}
            </button>

            {/* the spark handle */}
            <motion.div style={{ left: handleX }} className="absolute inset-y-0 z-20 -ml-px w-0.5 bg-accentient-to-b from-transparent via-amber to-transparent">
              <div
                role="slider"
                tabIndex={0}
                aria-label="Drag to compare the two divisions"
                aria-valuemin={16}
                aria-valuemax={84}
                aria-valuenow={val}
                aria-valuetext={`${val}% automation, ${100 - val}% education`}
                onPointerDown={onDown}
                onKeyDown={onKey}
                className={cn(
                  "absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none place-items-center rounded-full border-2 border-ink bg-paper text-ink transition-transform",
                  dragging ? "scale-110 cursor-grabbing" : "hover:scale-105"
                )}
              >
                {!touched && <span className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-paper" />}
                <Zap className="h-7 w-7" fill="currentColor" aria-hidden="true" />
                <span className="absolute -bottom-9 flex items-center gap-1 whitespace-nowrap rounded-full bg-paper px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] text-ink">
                  <ChevronsLeftRight className="h-3 w-3" aria-hidden="true" /> drag
                </span>
              </div>
            </motion.div>
          </div>
        </Reveal>

        {/* mobile: stacked cards */}
        <div className="mt-12 space-y-4 md:hidden">
          {(["left", "right"] as const).map((s) => (
            <Reveal key={s}>
              <div className={cn("overflow-hidden rounded-md p-6", s === "left" ? "theme-dark" : "theme-orange")}>
                {s === "left" ? <AutomationContent /> : <EducationContent />}
                <div className="mt-6 h-52">{s === "left" ? <AutomationPhoto /> : <EducationPhoto />}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
