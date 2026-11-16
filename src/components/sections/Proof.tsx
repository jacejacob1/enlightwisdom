"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { Award } from "lucide-react";
import { proof } from "@/lib/content";
import { NumberTicker } from "@/components/ui/number-ticker";
import { Reveal, SectionHeader, Photo } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";

const GRID = 10;

/** 100-dot field. Each lit dot = 100 people (or 1 solution). Reacts to the cursor. */
function DotField({ lit }: { lit: number }) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const litRef = useRef(lit);
  const changedAt = useRef(0);
  const mouse = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    litRef.current = lit;
    changedAt.current = performance.now();
  }, [lit]);

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const vals = new Float32Array(GRID * GRID);
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(c);
    const resize = () => {
      const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
      const dpr = Math.min(devicePixelRatio, 2);
      c.width = r.width * dpr;
      c.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap.current!);

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const W = c.width / Math.min(devicePixelRatio, 2);
      const H = c.height / Math.min(devicePixelRatio, 2);
      const size = Math.min(W, H);
      const gap = size / GRID;
      const ox = (W - size) / 2 + gap / 2;
      const oy = (H - size) / 2 + gap / 2;
      ctx.clearRect(0, 0, W, H);
      const since = now - changedAt.current;
      for (let i = 0; i < GRID * GRID; i++) {
        const row = Math.floor(i / GRID);
        const col = i % GRID;
        // snake order so the fill reads like a counter
        const order = row * GRID + (row % 2 ? GRID - 1 - col : col);
        const target = order < litRef.current && since > order * 12 ? 1 : 0;
        vals[i] += (target - vals[i]) * 0.12;
        const x = ox + col * gap;
        const y = oy + row * gap;
        let boost = 0;
        if (mouse.current) {
          const d = Math.hypot(mouse.current.x - x, mouse.current.y - y);
          boost = Math.max(0, 1 - d / (gap * 2.6));
        }
        const v = vals[i];
        const r = gap * (0.16 + v * 0.16 + boost * 0.14);
        if (v > 0.05) {
          ctx.shadowColor = "rgba(255,160,40,0.8)";
          ctx.shadowBlur = 14 * v;
        }
        ctx.fillStyle = v > 0.05 ? `rgba(${255},${Math.round(178 - 60 * (order / 100))},${Math.round(46 - 30 * (order / 100))},${0.25 + v * 0.75})` : `rgba(255,236,214,${0.08 + boost * 0.2})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <div
      ref={wrap}
      className="relative aspect-square w-full"
      onPointerMove={(e) => {
        const r = wrap.current?.getBoundingClientRect();
    if (!r) return;
        mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top };
      }}
      onPointerLeave={() => (mouse.current = null)}
    >
      <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-hidden="true" />
    </div>
  );
}

export default function Proof() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-20%" });
  const s = proof.stats[active];

  useEffect(() => {
    if (!auto || !inView) return;
    const id = setInterval(() => setActive((a) => (a + 1) % proof.stats.length), 3800);
    return () => clearInterval(id);
  }, [auto, inView]);

  return (
    <section id="proof" data-nav="dark" className="theme-dark relative px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="07" eyebrow={proof.label} title={proof.headline} intro={proof.intro} />

        <div ref={ref} className="mt-16 grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-3 sm:grid-cols-2">
            {proof.stats.map((st, i) => (
              <Reveal key={st.label} delay={i * 0.06}>
                <button
                  onClick={() => {
                    setActive(i);
                    setAuto(false);
                  }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") {
                      setActive(i);
                      setAuto(false);
                    }
                  }}
                  aria-pressed={active === i}
                  className={cn("relative h-full w-full overflow-hidden rounded-md border p-6 text-left transition-all duration-300", active === i ? "border-cream/60 bg-panel" : "border-line hover:border-cream/40")}
                >
                  {active === i && <motion.span layoutId="stat-bar" className="absolute inset-x-0 top-0 h-[3px] bg-accent" />}
                  <p className="font-display text-5xl font-bold tracking-tight text-cream sm:text-6xl">
                    <NumberTicker value={st.n} className={active === i ? "text-grad" : "text-cream"} />
                    <span className="text-amber">{st.suffix}</span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-sand/80">{st.label}</p>
                </button>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.1}>
            <div className="glass mx-auto max-w-md rounded-md p-6 sm:p-8">
              <DotField lit={Math.round(s.n / s.per)} />
              <div className="mt-4 flex items-center justify-between font-mono text-[0.68rem] uppercase tracking-[0.15em] text-muted">
                <span>
                  1 dot = {s.per === 1 ? "1 solution" : `${s.per} ${s.unit}`}
                </span>
                <span className="text-amber">
                  {Math.round(s.n / s.per)} lit
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {proof.points.map((p, i) => (
            <Reveal key={p.t} delay={i * 0.06}>
              <div className="h-full border-l-2 border-amber/40 pl-5">
                <p className="font-display text-lg font-semibold text-cream">{p.t}</p>
                <p className="mt-1.5 text-sm leading-relaxed text-sand/75">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-16 grid items-stretch gap-6 border-t border-line pt-10 lg:grid-cols-12">
          <Photo src="/photos/recognition.jpg" alt="The Enlight Wisdom team receiving an award on stage" className="aspect-[4/3] rounded-md lg:col-span-5" position="center 40%" />
          <Reveal delay={0.1} className="flex flex-col justify-between gap-8 lg:col-span-7 lg:pl-6">
            <div>
              <Award className="h-8 w-8 text-amber" aria-hidden="true" />
              <p className="mt-6 text-2xl leading-snug text-cream sm:text-3xl">{proof.recognition}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {proof.badges.map((b) => (
                <span key={b} className="rounded-full border border-line px-3 py-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-sand">
                  {b}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
