"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Store zones in a 100 x 62 coordinate space
type Zone = { id: string; name: string; x: number; y: number; w: number; h: number };
const zones: Zone[] = [
  { id: "entry", name: "Entrance", x: 2, y: 46, w: 18, h: 14 },
  { id: "a", name: "Aisle A · Grocery", x: 26, y: 6, w: 12, h: 36 },
  { id: "b", name: "Aisle B · Home", x: 44, y: 6, w: 12, h: 36 },
  { id: "c", name: "Aisle C · Electronics", x: 62, y: 6, w: 12, h: 36 },
  { id: "bill", name: "Billing counters", x: 26, y: 48, w: 48, h: 12 },
  { id: "help", name: "Help desk", x: 2, y: 6, w: 18, h: 16 },
  { id: "stock", name: "Stockroom", x: 80, y: 6, w: 18, h: 54 },
];

type Agent = { x: number; y: number; tx: number; ty: number; zone: string; staff: boolean; wait: number };

const pickIn = (z: Zone) => ({ x: z.x + 2 + Math.random() * (z.w - 4), y: z.y + 2 + Math.random() * (z.h - 4) });
const zoneAt = (x: number, y: number) => zones.find((z) => x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h);

function nextZone(staff: boolean, from: string) {
  if (staff) {
    const opts = ["a", "b", "c", "bill", "help", "stock", "bill"];
    return opts[Math.floor(Math.random() * opts.length)];
  }
  const flow: Record<string, string[]> = {
    entry: ["a", "b", "c", "help"],
    a: ["b", "bill", "c"],
    b: ["c", "bill", "a"],
    c: ["bill", "bill", "help"],
    help: ["a", "c"],
    bill: ["entry"],
    stock: ["a"],
  };
  const o = flow[from] ?? ["a"];
  return o[Math.floor(Math.random() * o.length)];
}

export default function ErgoDemo() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [heat, setHeat] = useState(true);
  const heatRef = useRef(true);
  const [hover, setHover] = useState<{ zone: Zone; x: number; y: number; w: number } | null>(null);
  const [counts, setCounts] = useState<Record<string, { c: number; s: number }>>({});
  const sim = useRef<{ agents: Agent[]; heat: Float32Array }>({ agents: [], heat: new Float32Array(50 * 31) });

  useEffect(() => {
    heatRef.current = heat;
  }, [heat]);

  useEffect(() => {
    const s = sim.current;
    const entry = zones[0];
    s.agents = [
      ...Array.from({ length: 22 }).map(() => {
        const z = zones[1 + Math.floor(Math.random() * 4)];
        const p = pickIn(z);
        return { ...p, tx: p.x, ty: p.y, zone: z.id, staff: false, wait: Math.random() * 3 };
      }),
      ...["a", "b", "bill", "bill", "help", "stock"].map((id) => {
        const z = zones.find((q) => q.id === id)!;
        const p = pickIn(z);
        return { ...p, tx: p.x, ty: p.y, zone: id, staff: true, wait: 2 + Math.random() * 4 };
      }),
    ];
    void entry;

    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    const heatCanvas = document.createElement("canvas");
    heatCanvas.width = 50;
    heatCanvas.height = 31;
    const heatCtx = heatCanvas.getContext("2d")!;
    const heatImg = heatCtx.createImageData(50, 31);
    let raf = 0;
    let last = performance.now();
    let tick = 0;
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
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const W = c.width / Math.min(devicePixelRatio, 2);
      const H = c.height / Math.min(devicePixelRatio, 2);
      const sc = Math.min(W / 100, H / 62);
      const ox = (W - sc * 100) / 2;
      const oy = (H - sc * 62) / 2;
      (c as HTMLCanvasElement & { _m?: object })._m = { sc, ox, oy };

      // simulate
      for (const a of s.agents) {
        const dx = a.tx - a.x;
        const dy = a.ty - a.y;
        const d = Math.hypot(dx, dy);
        if (d < 0.6) {
          a.wait -= dt;
          if (a.wait <= 0) {
            const nz = nextZone(a.staff, a.zone);
            const z = zones.find((q) => q.id === nz)!;
            const p = pickIn(z);
            a.tx = p.x;
            a.ty = p.y;
            a.zone = nz;
            a.wait = a.staff ? 3 + Math.random() * 5 : nz === "bill" ? 3 + Math.random() * 4 : 1 + Math.random() * 3;
            if (!a.staff && a.zone === "entry" && Math.random() < 0.5) {
              // shopper leaves and a new one walks in
              const e = pickIn(zones[0]);
              a.x = e.x;
              a.y = e.y;
            }
          }
        } else {
          const sp = (a.staff ? 9 : 7) * dt;
          a.x += (dx / d) * Math.min(sp, d);
          a.y += (dy / d) * Math.min(sp, d);
        }
        if (!a.staff) {
          const hx = Math.floor(a.x / 2);
          const hy = Math.floor(a.y / 2);
          if (hx >= 0 && hx < 50 && hy >= 0 && hy < 31) s.heat[hy * 50 + hx] = Math.min(1, s.heat[hy * 50 + hx] + dt * 0.25);
        }
      }
      for (let i = 0; i < s.heat.length; i++) s.heat[i] *= 1 - dt * 0.04;

      tick += dt;
      if (tick > 0.5) {
        tick = 0;
        const cc: Record<string, { c: number; s: number }> = {};
        for (const z of zones) cc[z.id] = { c: 0, s: 0 };
        for (const a of s.agents) {
          const z = zoneAt(a.x, a.y);
          if (z && a.staff) cc[z.id].s++;
          else if (z) cc[z.id].c++;
        }
        setCounts(cc);
      }

      // draw
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#14100c";
      ctx.beginPath();
      ctx.roundRect(ox, oy, 100 * sc, 62 * sc, 14);
      ctx.fill();

      if (heatRef.current) {
        const px = heatImg.data;
        for (let i = 0; i < s.heat.length; i++) {
          const v = s.heat[i];
          px[i * 4] = 255;
          px[i * 4 + 1] = 190 - v * 120;
          px[i * 4 + 2] = 40 - v * 30;
          px[i * 4 + 3] = Math.min(255, v * 200);
        }
        heatCtx.putImageData(heatImg, 0, 0);
        ctx.save();
        ctx.imageSmoothingEnabled = true;
        ctx.filter = `blur(${Math.round(sc * 2.2)}px)`;
        ctx.drawImage(heatCanvas, ox, oy, 100 * sc, 62 * sc);
        ctx.restore();
      }

      for (const z of zones) {
        ctx.strokeStyle = "rgba(244,237,228,0.22)";
        ctx.fillStyle = "rgba(244,237,228,0.035)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(ox + z.x * sc, oy + z.y * sc, z.w * sc, z.h * sc, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(255,243,228,0.55)";
        ctx.font = `600 ${Math.max(8, sc * 1.9)}px ui-monospace, monospace`;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(z.name.split(" · ")[0], ox + (z.x + 1.2) * sc, oy + (z.y + 1.2) * sc);
      }
      // counters inside billing
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = "rgba(200,98,42,0.6)";
        ctx.fillRect(ox + (30 + i * 11) * sc, oy + 55 * sc, 7 * sc, 2 * sc);
      }

      for (const a of s.agents) {
        ctx.beginPath();
        ctx.arc(ox + a.x * sc, oy + a.y * sc, (a.staff ? 1.25 : 0.85) * sc, 0, Math.PI * 2);
        if (a.staff) {
          ctx.fillStyle = "#ffb22e";
          ctx.shadowColor = "rgba(255,178,46,0.9)";
          ctx.shadowBlur = 10;
        } else {
          ctx.fillStyle = "rgba(244,237,228,0.75)";
          ctx.shadowBlur = 0;
        }
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

  const onMove = (e: React.PointerEvent) => {
    const c = canvas.current as HTMLCanvasElement & { _m?: { sc: number; ox: number; oy: number } };
    if (!c._m) return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left - c._m.ox) / c._m.sc;
    const y = (e.clientY - r.top - c._m.oy) / c._m.sc;
    const z = zoneAt(x, y);
    setHover(z ? { zone: z, x: e.clientX - r.left, y: e.clientY - r.top, w: r.width } : null);
  };

  const insight = (z: Zone) => {
    const k = counts[z.id] ?? { c: 0, s: 0 };
    if (z.id === "bill") return k.c > 4 && k.s < 3 ? `Queue building: ${k.c} waiting, ${k.s} staff. Suggest opening another counter.` : `Flowing well: ${k.c} at billing, ${k.s} staff on counters.`;
    if (z.id === "stock") return k.s ? `${k.s} team member restocking.` : "Quiet. No one restocking right now.";
    if (z.id === "entry") return `${k.c} shoppers arriving or leaving.`;
    if (k.c > 3 && k.s === 0) return `${k.c} shoppers, no staff nearby. Send help to ${z.name.split(" · ")[0]}.`;
    return `${k.c} shoppers · ${k.s} staff. Coverage looks fine.`;
  };

  const bill = counts.bill ?? { c: 0, s: 0 };
  const staffOnFloor = Object.entries(counts).reduce((n, [id, v]) => n + (id === "stock" ? 0 : v.s), 0);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex gap-4 font-mono text-[0.68rem] text-muted">
          <span>
            Staff on floor <span className="text-amber">{staffOnFloor}</span>
          </span>
          <span>
            Billing queue <span className={cn(bill.c > 4 ? "text-copper" : "text-amber")}>{bill.c}</span>
          </span>
        </div>
        <button
          onClick={() => setHeat((h) => !h)}
          aria-pressed={heat}
          className={cn("rounded-full px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.15em] transition-colors", heat ? "bg-accent text-on-accent" : "bg-white/[0.06] text-sand/70 hover:text-cream")}
        >
          Heatmap {heat ? "on" : "off"}
        </button>
      </div>
      <div ref={wrap} className="relative min-h-0 flex-1" onPointerMove={onMove} onPointerLeave={() => setHover(null)}>
        <canvas ref={canvas} className="absolute inset-0 h-full w-full" aria-label="Store floor plan with live activity. Hover a zone for details." />
        {hover && (
          <div
            className="glass-strong pointer-events-none absolute z-10 w-56 rounded p-3 text-xs"
            style={{ left: Math.min(hover.x + 12, hover.w - 232), top: Math.max(8, hover.y - 80) }}
          >
            <p className="font-semibold text-cream">{hover.zone.name}</p>
            <p className="mt-1 leading-snug text-sand/80">{insight(hover.zone)}</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 pt-3 font-mono text-[0.68rem] text-sand/70">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber" /> Staff
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cream/75" /> Shoppers
        </span>
        <span className="ml-auto">Hover a zone for an insight</span>
      </div>
    </div>
  );
}
