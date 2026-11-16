"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ScanLine, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const teeth = [
  { x: 40, w: 44, h: 70 },
  { x: 88, w: 42, h: 78 },
  { x: 134, w: 40, h: 88 },
  { x: 178, w: 46, h: 96 },
  { x: 228, w: 46, h: 96 },
  { x: 278, w: 40, h: 88 },
  { x: 322, w: 42, h: 78 },
];
const spots = [
  { id: 1, tooth: 2, cx: 152, cy: 98, r: 6, conf: 91, label: "Early enamel lesion" },
  { id: 2, tooth: 4, cx: 246, cy: 120, r: 8, conf: 87, label: "Possible caries" },
  { id: 3, tooth: 6, cx: 340, cy: 92, r: 5, conf: 78, label: "Early enamel lesion" },
];
const toothPath = (x: number, w: number, h: number) => {
  const top = 40;
  return `M${x} ${top} q0 -8 ${w / 2} -8 q${w / 2} 0 ${w / 2} 8 L${x + w - 3} ${top + h - 16} q-${w / 2 - 3} 22 -${w - 6} 0 Z`;
};

export default function CariskDemo() {
  const svg = useRef<SVGSVGElement>(null);
  const [lens, setLens] = useState({ x: 200, y: 100 });
  const [found, setFound] = useState<number[]>([]);
  const [scanning, setScanning] = useState(false);
  const dwell = useRef<Record<number, number>>({});
  const scanRaf = useRef(0);

  const lensRef = useRef(lens);
  const scanningRef = useRef(scanning);
  useEffect(() => {
    lensRef.current = lens;
    scanningRef.current = scanning;
  }, [lens, scanning]);

  // detection: the lens must rest on a spot briefly (instant while auto-scanning)
  useEffect(() => {
    const id = setInterval(() => {
      const now = performance.now();
      const l = lensRef.current;
      for (const s of spots) {
        if (Math.hypot(l.x - s.cx, l.y - s.cy) < 34) {
          dwell.current[s.id] ??= now;
          if (now - dwell.current[s.id] >= (scanningRef.current ? 0 : 350)) setFound((f) => (f.includes(s.id) ? f : [...f, s.id]));
        } else delete dwell.current[s.id];
      }
    }, 60);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => cancelAnimationFrame(scanRaf.current), []);

  const toSvg = (e: React.PointerEvent) => {
    const el = svg.current;
    if (!el) return lensRef.current;
    const pt = el.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = el.getScreenCTM();
    if (!ctm) return lensRef.current;
    const p = pt.matrixTransform(ctm.inverse());
    return { x: Math.max(20, Math.min(380, p.x)), y: Math.max(30, Math.min(170, p.y)) };
  };

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    const start = performance.now();
    const dur = 3200;
    const step = (t: number) => {
      const k = Math.min(1, (t - start) / dur);
      const x = 30 + k * 340;
      const y = 100 + Math.sin(k * Math.PI * 6) * 18;
      setLens({ x, y });
      if (k < 1) scanRaf.current = requestAnimationFrame(step);
      else setScanning(false);
    };
    scanRaf.current = requestAnimationFrame(step);
  };

  const reset = () => {
    cancelAnimationFrame(scanRaf.current);
    setScanning(false);
    setFound([]);
    setLens({ x: 200, y: 100 });
  };

  const scene = (ai: boolean) => (
    <g>
      <rect x="0" y="0" width="400" height="200" fill={ai ? "#0f0b08" : "#3a1f1c"} />
      {/* gum line */}
      <path d="M20 40 Q200 10 380 40 L380 0 L20 0 Z" fill={ai ? "#2a1d16" : "#b4565a"} />
      {teeth.map((t, i) => (
        <path key={i} d={toothPath(t.x, t.w, t.h)} fill={ai ? "#2a2420" : "#f3ead9"} stroke={ai ? "#ffb22e" : "#d8cbb2"} strokeOpacity={ai ? 0.5 : 1} strokeWidth="1.5" />
      ))}
      {spots.map((s) => (
        <circle key={s.id} cx={s.cx} cy={s.cy} r={s.r} fill={ai ? "#ff7a1a" : "#b89a6e"} opacity={ai ? 0.95 : 0.55} />
      ))}
      {ai && (
        <g opacity="0.25">
          {Array.from({ length: 20 }).map((_, i) => (
            <line key={i} x1={i * 20} y1="0" x2={i * 20} y2="200" stroke="#ffb22e" strokeWidth="0.5" />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line key={i} x1="0" y1={i * 20} x2="400" y2={i * 20} stroke="#ffb22e" strokeWidth="0.5" />
          ))}
        </g>
      )}
    </g>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <span className="font-mono text-[0.68rem] text-muted">
          Areas flagged: <span className="text-amber">{found.length}</span> / {spots.length}
        </span>
        <div className="flex gap-2">
          <button onClick={scan} disabled={scanning} className={cn("inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.15em]", scanning ? "bg-white/10 text-sand/50" : "bg-accent text-on-accent")}>
            <ScanLine className="h-3.5 w-3.5" /> {scanning ? "Scanning…" : "Scan"}
          </button>
          <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.15em] text-sand/80 hover:text-cream">
            <RotateCcw className="h-3.5 w-3.5" /> Reset
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden rounded-md border border-line">
        <svg
          ref={svg}
          viewBox="0 0 400 200"
          preserveAspectRatio="xMidYMid slice"
          className="h-full w-full cursor-none touch-none"
          onPointerMove={(e) => !scanning && setLens(toSvg(e))}
          onPointerDown={(e) => !scanning && setLens(toSvg(e))}
          aria-label="Illustrated teeth. Move the scanner to look for early signs of decay."
        >
          <defs>
            <clipPath id="ck-lens">
              <circle cx={lens.x} cy={lens.y} r="44" />
            </clipPath>
          </defs>
          {scene(false)}
          <g clipPath="url(#ck-lens)">{scene(true)}</g>
          {/* detections */}
          {spots
            .filter((s) => found.includes(s.id))
            .map((s) => (
              <g key={s.id}>
                <rect x={s.cx - s.r - 8} y={s.cy - s.r - 8} width={(s.r + 8) * 2} height={(s.r + 8) * 2} rx="3" fill="none" stroke="#ffb22e" strokeWidth="1.5" strokeDasharray="4 2">
                  <animate attributeName="stroke-dashoffset" from="12" to="0" dur="0.8s" repeatCount="indefinite" />
                </rect>
                <rect x={s.cx - s.r - 8} y={s.cy - s.r - 22} width="34" height="12" rx="2" fill="#ffb22e" />
                <text x={s.cx - s.r - 5} y={s.cy - s.r - 13} fontSize="8.5" fontFamily="monospace" fontWeight="700" fill="#1a0d03">
                  {s.conf}%
                </text>
              </g>
            ))}
          {/* scanner lens */}
          <circle cx={lens.x} cy={lens.y} r="44" fill="none" stroke="#ffb22e" strokeWidth="2" />
          <circle cx={lens.x} cy={lens.y} r="48" fill="none" stroke="#ffb22e" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 5">
            <animateTransform attributeName="transform" type="rotate" from={`0 ${lens.x} ${lens.y}`} to={`360 ${lens.x} ${lens.y}`} dur="6s" repeatCount="indefinite" />
          </circle>
          <line x1={lens.x - 44} y1={lens.y} x2={lens.x + 44} y2={lens.y} stroke="#ffb22e" strokeOpacity="0.5" />
          <text x={lens.x} y={lens.y + 60} textAnchor="middle" fontSize="8" fontFamily="monospace" fill="#ffb22e">
            AI VIEW
          </text>
        </svg>
      </div>

      <ul className="mt-3 min-h-[3.2rem] space-y-1 text-xs" aria-live="polite">
        {found.length === 0 && <li className="text-sand/60">Nothing flagged yet. Illustrative demo, not a diagnosis.</li>}
        <AnimatePresence initial={false}>
          {spots
            .filter((s) => found.includes(s.id))
            .map((s) => (
              <motion.li key={s.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between text-sand">
                <span>
                  Tooth {s.tooth} · {s.label}
                </span>
                <span className="font-mono text-amber">{s.conf}% · refer for check-up</span>
              </motion.li>
            ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}
