"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "motion/react";
import { ArrowRight, Zap, Factory, GraduationCap, ChevronsLeftRight } from "lucide-react";
import { divisions } from "@/lib/content";
import { SectionHeader, Reveal } from "@/components/ui/primitives";
import { clamp, cn, scrollToId } from "@/lib/utils";

function ConveyorArt() {
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id="dv-g" x1="0" x2="1">
          <stop offset="0" stopColor="#ffc04a" />
          <stop offset="1" stopColor="#d0570f" />
        </linearGradient>
      </defs>
      <rect x="10" y="150" width="380" height="14" rx="7" fill="#2b2520" />
      {Array.from({ length: 12 }).map((_, i) => (
        <circle key={i} cx={22 + i * 32} cy="157" r="4" fill="#4a3f36">
          <animateTransform attributeName="transform" type="rotate" from={`0 ${22 + i * 32} 157`} to={`360 ${22 + i * 32} 157`} dur="1.2s" repeatCount="indefinite" />
        </circle>
      ))}
      {[0, 1, 2].map((i) => (
        <rect key={i} y="122" width="34" height="28" rx="4" fill="url(#dv-g)" opacity="0.9">
          <animate attributeName="x" from="-40" to="400" dur="6s" begin={`${i * 2}s`} repeatCount="indefinite" />
        </rect>
      ))}
      {/* robot arm */}
      <g transform="translate(250 40)">
        <rect x="-18" y="70" width="36" height="12" rx="4" fill="#2b2520" />
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-20 0 70; 25 0 70; -20 0 70" dur="3s" repeatCount="indefinite" />
          <rect x="-6" y="10" width="12" height="62" rx="6" fill="#f4ede4" />
          <circle cx="0" cy="10" r="9" fill="#f28c0f" />
          <g>
            <animateTransform attributeName="transform" type="rotate" values="40 0 10; -10 0 10; 40 0 10" dur="3s" repeatCount="indefinite" />
            <rect x="-5" y="-38" width="10" height="50" rx="5" fill="#f4ede4" />
            <path d="M-9 -40 l-6 -12 M9 -40 l6 -12" stroke="#f28c0f" strokeWidth="5" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
}

function ClassroomArt() {
  const glyphs = ["if (x)", "AI", "f(x)", "</>", "∑", "ROS", "IoT", "π"];
  return (
    <svg viewBox="0 0 400 200" className="h-full w-full" aria-hidden="true">
      <rect x="40" y="20" width="320" height="140" rx="10" fill="#1d241d" stroke="#3a3128" strokeWidth="6" />
      {glyphs.map((g, i) => (
        <text key={g} x={70 + (i % 4) * 75} y={60 + Math.floor(i / 4) * 55} fill="#fff3e4" opacity="0.75" fontFamily="monospace" fontSize="20">
          {g}
          <animate attributeName="opacity" values="0.15;0.85;0.15" dur={`${3 + (i % 3)}s`} begin={`${i * 0.4}s`} repeatCount="indefinite" />
        </text>
      ))}
      <g transform="translate(200 175)">
        <polygon points="-50,0 0,-18 50,0 0,18" fill="#f28c0f" />
        <rect x="-22" y="2" width="44" height="16" rx="3" fill="#d0570f" />
        <line x1="40" y1="2" x2="40" y2="22" stroke="#ffb22e" strokeWidth="3">
          <animateTransform attributeName="transform" type="rotate" values="-12 40 2; 12 40 2; -12 40 2" dur="2.4s" repeatCount="indefinite" />
        </line>
      </g>
    </svg>
  );
}

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
      <motion.div style={{ opacity: artOpacity }} className={cn("pointer-events-none absolute bottom-6 h-64 w-[26rem]", left ? "right-8" : "left-8")}>
        {left ? <ConveyorArt /> : <ClassroomArt />}
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
                <div className="mt-6 h-44">{s === "left" ? <ConveyorArt /> : <ClassroomArt />}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
