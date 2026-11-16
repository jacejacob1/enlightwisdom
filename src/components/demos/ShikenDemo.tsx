"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring, useTransform } from "motion/react";
import { ShieldCheck, ShieldAlert, Users, RotateCcw, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type Flag = { id: number; t: string; text: string };
const question = {
  q: "Q4 of 20 · Which sensor lets a mobile robot measure distance with laser light?",
  options: ["LiDAR", "Thermistor", "Hall-effect sensor", "Strain gauge"],
};

const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function ShikenDemo() {
  const root = useRef<HTMLDivElement>(null);
  const examPane = useRef<HTMLDivElement>(null);
  const cam = useRef<HTMLDivElement>(null);
  const [away, setAway] = useState(false);
  const [forcedAway, setForcedAway] = useState(false);
  const [second, setSecond] = useState(false);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [clock, setClock] = useState(0);
  const [answer, setAnswer] = useState<number | null>(null);
  const awaySince = useRef<number | null>(null);
  const flagged = useRef(false);
  const fx = useSpring(0, { stiffness: 120, damping: 14 });
  const fy = useSpring(0, { stiffness: 120, damping: 14 });
  const clockRef = useRef(0);
  // map -1..1 springs into offsets inside the 160x120 webcam viewBox
  const headX = useTransform(fx, [-1, 1], [-14, 14]);
  const headY = useTransform(fy, [-1, 1], [-6, 8]);
  const eyeX = useTransform(fx, [-1, 1], [-3, 3]);
  const eyeY = useTransform(fy, [-1, 1], [-1.5, 2]);

  const isAway = away || forcedAway;

  const addFlag = (text: string) => setFlags((f) => [{ id: Date.now() + Math.random(), t: fmt(clockRef.current), text }, ...f].slice(0, 4));

  useEffect(() => {
    const id = setInterval(() => {
      clockRef.current += 0.25;
      setClock(clockRef.current);
      if (isAway) {
        if (awaySince.current === null) awaySince.current = clockRef.current;
        if (!flagged.current && clockRef.current - awaySince.current >= 1.25) {
          flagged.current = true;
          addFlag("Candidate looked away from the screen");
        }
      } else {
        awaySince.current = null;
        flagged.current = false;
      }
    }, 250);
    return () => clearInterval(id);
  }, [isAway]);

  useEffect(() => {
    if (forcedAway) {
      fx.set(1);
      fy.set(0.2);
    }
  }, [forcedAway, fx, fy]);

  const onMove = (e: React.PointerEvent) => {
    if (forcedAway) return;
    const ex = examPane.current?.getBoundingClientRect();
    if (!ex) return;
    const inside = e.clientX >= ex.left && e.clientX <= ex.right && e.clientY >= ex.top && e.clientY <= ex.bottom;
    setAway(!inside);
    const c = cam.current?.getBoundingClientRect();
    if (!c) return;
    const dx = (e.clientX - (c.left + c.width / 2)) / 260;
    const dy = (e.clientY - (c.top + c.height / 2)) / 260;
    fx.set(Math.max(-1, Math.min(1, dx)));
    fy.set(Math.max(-1, Math.min(1, dy)));
  };

  const onLeave = () => {
    if (forcedAway) return;
    setAway(true);
    fx.set(1);
    fy.set(-0.3);
  };

  const toggleSecond = () => {
    if (!second) addFlag("A second person appeared on camera");
    setSecond(!second);
  };

  const reset = () => {
    setFlags([]);
    setSecond(false);
    setForcedAway(false);
    setAway(false);
    setAnswer(null);
    clockRef.current = 0;
    fx.set(0);
    fy.set(0);
  };

  const integrity = Math.max(0, 100 - flags.length * 18);

  return (
    <div ref={root} className="flex h-full flex-col" onPointerMove={onMove} onPointerLeave={onLeave}>
      <div className="grid min-h-0 flex-1 gap-3 sm:grid-cols-[1.25fr_1fr]">
        {/* exam window */}
        <div ref={examPane} className={cn("flex flex-col rounded-md border bg-sunk p-4 transition-colors", isAway ? "border-line" : "border-amber/40")}>
          <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.15em] text-muted">
            <span>Online exam · Robotics 101</span>
            <span className="text-amber">{fmt(clock)}</span>
          </div>
          <p className="mt-4 text-sm font-semibold leading-snug text-cream">{question.q}</p>
          <div className="mt-4 grid gap-2">
            {question.options.map((o, i) => (
              <button
                key={o}
                onClick={() => setAnswer(i)}
                className={cn(
                  "rounded border px-3 py-2 text-left text-sm transition-colors",
                  answer === i ? (i === 0 ? "border-amber bg-amber/15 text-cream" : "border-copper bg-copper/15 text-cream") : "border-line text-sand/80 hover:border-sand/40"
                )}
              >
                <span className="mr-2 font-mono text-xs text-muted">{String.fromCharCode(65 + i)}</span>
                {o}
                {answer === i && <span className="float-right font-mono text-[0.65rem] text-amber">{i === 0 ? "correct" : "try again"}</span>}
              </button>
            ))}
          </div>
          <p className="mt-auto pt-3 font-mono text-[0.62rem] text-muted">Keep your cursor in this window to stay “focused”.</p>
        </div>

        {/* proctor side */}
        <div className="flex min-h-0 flex-col gap-3">
          <div ref={cam} className={cn("relative aspect-[4/3] overflow-hidden rounded-md border bg-[#1a1511]", isAway || second ? "border-copper" : "border-line")}>
            <div className="absolute left-2 top-2 z-10 flex items-center gap-1.5 rounded-full bg-black/50 px-2 py-0.5 font-mono text-[0.6rem] text-cream">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" /> REC
            </div>
            <svg viewBox="0 0 160 120" className="h-full w-full" aria-label="Simulated candidate webcam">
              <rect width="160" height="120" fill="#1a1511" />
              <rect x="0" y="80" width="160" height="40" fill="#241d17" />
              <AnimatePresence>
                {second && (
                  <motion.g initial={{ opacity: 0, x: 30 }} animate={{ opacity: 0.85, x: 0 }} exit={{ opacity: 0, x: 30 }}>
                    <circle cx="132" cy="50" r="14" fill="#5a4c40" />
                    <path d="M108 120 q24 -46 48 0" fill="#5a4c40" />
                  </motion.g>
                )}
              </AnimatePresence>
              <path d="M44 120 q36 -56 72 0" fill="#c8622a" />
              <motion.g style={{ x: headX, y: headY }}>
                <ellipse cx="80" cy="52" rx="22" ry="26" fill="#d9a77e" />
                <path d="M58 46 q22 -30 44 0 q-4 -24 -22 -24 q-18 0 -22 24" fill="#2b2017" />
                <motion.g style={{ x: eyeX, y: eyeY }}>
                  <circle cx="72" cy="54" r="2.6" fill="#1c1712" />
                  <circle cx="88" cy="54" r="2.6" fill="#1c1712" />
                </motion.g>
                <path d="M74 66 q6 4 12 0" stroke="#7a4b30" strokeWidth="2" fill="none" strokeLinecap="round" />
              </motion.g>
              {/* face box drawn by the AI */}
              <motion.rect
                x="54"
                y="22"
                width="52"
                height="60"
                rx="4"
                fill="none"
                strokeWidth="1.5"
                strokeDasharray="6 3"
                style={{ x: headX, y: headY }}
                stroke={isAway ? "#d0570f" : "#ffb22e"}
              />
            </svg>
            <div className={cn("absolute inset-x-2 bottom-2 flex items-center gap-1.5 rounded-lg px-2 py-1 font-mono text-[0.62rem]", isAway || second ? "bg-copper/80 text-cream" : "bg-black/50 text-amber")}>
              {isAway || second ? <ShieldAlert className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
              {second ? "Second face detected" : isAway ? "Gaze off-screen" : "Focused on exam"}
            </div>
          </div>

          <div className="rounded-md border border-line bg-sunk p-3">
            <div className="flex items-center justify-between font-mono text-[0.62rem] uppercase tracking-[0.15em] text-muted">
              <span>Session integrity</span>
              <span className={integrity < 70 ? "text-copper" : "text-amber"}>{integrity}%</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <motion.div className="h-full bg-accent" animate={{ width: `${integrity}%` }} />
            </div>
            <ul className="mt-3 min-h-[3.6rem] space-y-1.5" aria-live="polite">
              {flags.length === 0 && <li className="text-xs text-sand/60">No flags yet. Invigilators see only what needs review.</li>}
              <AnimatePresence initial={false}>
                {flags.map((f) => (
                  <motion.li key={f.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex gap-2 text-xs text-sand">
                    <span className="font-mono text-amber">{f.t}</span>
                    {f.text}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-3">
        <button
          onClick={() => setForcedAway((v) => !v)}
          aria-pressed={forcedAway}
          className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.12em]", forcedAway ? "bg-accent text-on-accent" : "bg-white/[0.06] text-sand/80 hover:text-cream")}
        >
          <EyeOff className="h-3.5 w-3.5" /> Look away
        </button>
        <button
          onClick={toggleSecond}
          aria-pressed={second}
          className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.12em]", second ? "bg-accent text-on-accent" : "bg-white/[0.06] text-sand/80 hover:text-cream")}
        >
          <Users className="h-3.5 w-3.5" /> Second person
        </button>
        <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 font-mono text-[0.66rem] uppercase tracking-[0.12em] text-sand/80 hover:text-cream">
          <RotateCcw className="h-3.5 w-3.5" /> Reset
        </button>
      </div>
    </div>
  );
}
