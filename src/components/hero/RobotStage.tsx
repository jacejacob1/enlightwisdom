"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Robot, Mode } from "./robot";
import type { RobotMode } from "@/lib/utils";
import { cn } from "@/lib/utils";

const modes: { id: Mode; label: string }[] = [
  { id: "idle", label: "Hello" },
  { id: "automate", label: "Industry" },
  { id: "teach", label: "Classroom" },
];

export default function RobotStage({ scrollProgress }: { scrollProgress: { get: () => number; on: (e: "change", cb: (v: number) => void) => () => void } }) {
  const mount = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const robot = useRef<Robot | null>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speech, setSpeech] = useState<{ id: number; text: string } | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const hideTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const pinnedMode = useRef<Mode>("idle");

  useEffect(() => {
    let cancelled = false;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    import("./robot")
      .then(({ Robot }) => {
        if (cancelled || !mount.current) return;
        try {
          robot.current = new Robot(mount.current, {
            bubble: bubbleRef.current,
            reducedMotion: reduced,
            onSay: (text) => {
              setSpeech({ id: Date.now(), text });
              clearTimeout(hideTimer.current);
              hideTimer.current = setTimeout(() => setSpeech(null), 3400);
            },
          });
          setReady(true);
          // greet once the page settles
          setTimeout(() => !cancelled && robot.current?.poke(), 1400);
        } catch {
          setFailed(true);
        }
      })
      .catch(() => setFailed(true));

    const onMode = (e: Event) => {
      const m = (e as CustomEvent<RobotMode>).detail;
      // hovering a CTA previews a mode; leaving returns to the mode picked with the switch
      const next = m === "idle" ? pinnedMode.current : m;
      robot.current?.setMode(next);
      setMode(next);
    };
    window.addEventListener("ew:robot-mode", onMode);
    const unsub = scrollProgress.on("change", (v) => robot.current?.setScroll(v));
    return () => {
      cancelled = true;
      window.removeEventListener("ew:robot-mode", onMode);
      unsub();
      clearTimeout(hideTimer.current);
      robot.current?.dispose();
      robot.current = null;
    };
  }, [scrollProgress]);

  const pick = (m: Mode) => {
    pinnedMode.current = m;
    setMode(m);
    robot.current?.setMode(m);
    if (m === "idle") robot.current?.poke();
  };

  return (
    <div className="relative h-full w-full">
      <div
        ref={mount}
        className={cn("absolute inset-0 transition-opacity duration-1000", ready ? "opacity-100" : "opacity-0")}
        role="img"
        aria-label="Spark, the Enlight Wisdom robot. Click to say hi, drag sideways to spin."
      />

      {!ready && !failed && (
        <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div className="relative h-24 w-24">
            <span className="absolute inset-0 animate-pulse-ring rounded-full border border-amber/60" />
            <span className="absolute inset-6 rounded-full bg-accent" />
          </div>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 grid place-items-center p-8 text-center text-sand/70">
          <img src="/brand/ew-logo.png" alt="Enlight Wisdom" className="w-56 animate-float" />
        </div>
      )}

      {/* speech bubble — positioned every frame above Spark's head */}
      <div ref={bubbleRef} className="pointer-events-none absolute left-0 top-0 z-10 will-change-transform">
        <AnimatePresence mode="wait">
          {speech && (
            <motion.div
              key={speech.id}
              initial={{ opacity: 0, scale: 0.6, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -6 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="glass-strong relative max-w-[15rem] origin-bottom-left rounded-[3px] px-4 py-2.5 text-[0.9rem] font-medium leading-snug text-cream after:absolute after:-bottom-[7px] after:left-5 after:h-3 after:w-3 after:rotate-45 after:border-b after:border-r after:border-[#17130f] after:bg-[#faf6ee]"
              role="status"
              aria-live="polite"
            >
              {speech.text}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* mode switch: works on touch where hover doesn't exist */}
      {ready && (
        <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2">
          <div className="flex items-center gap-1 rounded-full border border-line bg-[#141110]/80 p-1" role="radiogroup" aria-label="Choose Spark's mode">
            {modes.map((m) => (
              <button
                key={m.id}
                role="radio"
                aria-checked={mode === m.id}
                onClick={() => pick(m.id)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-[0.16em] transition-colors",
                  mode === m.id ? "text-on-accent" : "text-sand/80 hover:text-cream"
                )}
              >
                {mode === m.id && (
                  <motion.span layoutId="spark-mode" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative">{m.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-[0.68rem] font-medium tracking-wide text-muted">Click Spark to say hi · drag to spin</p>
        </div>
      )}
    </div>
  );
}
