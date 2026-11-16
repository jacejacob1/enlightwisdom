"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Layout = "warehouse" | "household";
const COLS = 24;
const ROWS = 14;

type Block = { x: number; y: number; w: number; h: number; label?: string; kind: "shelf" | "furniture" | "wall" };

const layouts: Record<Layout, Block[]> = {
  warehouse: [
    ...[2, 6, 10, 14, 18].map((x) => ({ x, y: 2, w: 2, h: 4, kind: "shelf" as const, label: "" })),
    ...[2, 6, 10, 14, 18].map((x) => ({ x, y: 8, w: 2, h: 4, kind: "shelf" as const, label: "" })),
    { x: 21, y: 0, w: 3, h: 2, kind: "furniture", label: "Dock" },
  ],
  household: [
    { x: 8, y: 0, w: 1, h: 5, kind: "wall" },
    { x: 8, y: 8, w: 1, h: 6, kind: "wall" },
    { x: 16, y: 0, w: 1, h: 4, kind: "wall" },
    { x: 16, y: 7, w: 1, h: 7, kind: "wall" },
    { x: 1, y: 1, w: 5, h: 2, kind: "furniture", label: "Sofa" },
    { x: 2, y: 9, w: 3, h: 3, kind: "furniture", label: "Table" },
    { x: 10, y: 10, w: 5, h: 3, kind: "furniture", label: "Bed" },
    { x: 11, y: 1, w: 3, h: 2, kind: "furniture", label: "Desk" },
    { x: 18, y: 1, w: 5, h: 2, kind: "furniture", label: "Kitchen" },
    { x: 19, y: 9, w: 3, h: 2, kind: "furniture", label: "Fridge" },
  ],
};

function makeGrid(layout: Layout) {
  const g: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (const b of layouts[layout]) for (let y = b.y; y < b.y + b.h; y++) for (let x = b.x; x < b.x + b.w; x++) if (g[y]) g[y][x] = true;
  return g;
}

/** A* on an 8-connected grid without corner cutting. */
function astar(grid: boolean[][], s: [number, number], t: [number, number]): [number, number][] | null {
  const key = (x: number, y: number) => y * COLS + x;
  const open = new Map<number, { x: number; y: number; g: number; f: number }>();
  const came = new Map<number, number>();
  const gScore = new Map<number, number>();
  const h = (x: number, y: number) => {
    const dx = Math.abs(x - t[0]);
    const dy = Math.abs(y - t[1]);
    return dx + dy + (Math.SQRT2 - 2) * Math.min(dx, dy);
  };
  open.set(key(...s), { x: s[0], y: s[1], g: 0, f: h(...s) });
  gScore.set(key(...s), 0);
  const closed = new Set<number>();
  while (open.size) {
    let cur: { x: number; y: number; g: number; f: number } | null = null;
    for (const n of open.values()) if (!cur || n.f < cur.f) cur = n;
    if (!cur) break;
    const ck = key(cur.x, cur.y);
    if (cur.x === t[0] && cur.y === t[1]) {
      const path: [number, number][] = [[cur.x, cur.y]];
      let k = ck;
      while (came.has(k)) {
        k = came.get(k)!;
        path.unshift([k % COLS, Math.floor(k / COLS)]);
      }
      return path;
    }
    open.delete(ck);
    closed.add(ck);
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = cur.x + dx;
        const ny = cur.y + dy;
        if (nx < 0 || ny < 0 || nx >= COLS || ny >= ROWS || grid[ny][nx]) continue;
        if (dx && dy && (grid[cur.y][nx] || grid[ny][cur.x])) continue;
        const nk = key(nx, ny);
        if (closed.has(nk)) continue;
        const g = cur.g + (dx && dy ? Math.SQRT2 : 1);
        if (g < (gScore.get(nk) ?? Infinity)) {
          gScore.set(nk, g);
          came.set(nk, ck);
          open.set(nk, { x: nx, y: ny, g, f: g + h(nx, ny) });
        }
      }
  }
  return null;
}

export default function AmrDemo() {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [layout, setLayout] = useState<Layout>("warehouse");
  const [status, setStatus] = useState("Click any open floor tile to send the robot.");
  const [trips, setTrips] = useState(0);
  const state = useRef({
    grid: makeGrid("warehouse"),
    pos: { x: 0.5, y: 6.5 },
    heading: 0,
    path: [] as [number, number][],
    target: null as [number, number] | null,
    lastAction: 0,
    trail: [] as { x: number; y: number }[],
    hover: null as [number, number] | null,
  });

  useEffect(() => {
    const st = state.current;
    st.grid = makeGrid(layout);
    st.pos = layout === "warehouse" ? { x: 0.5, y: 6.5 } : { x: 4.5, y: 6.5 };
    st.path = [];
    st.target = null;
    st.trail = [];
  }, [layout]);

  const pickLayout = (l: Layout) => {
    setLayout(l);
    setStatus(l === "warehouse" ? "SIARC in the warehouse. Click an aisle to deliver goods." : "FIACC at home. Click a room to send it there.");
  };

  useEffect(() => {
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    let last = performance.now();
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

    const roundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, r);
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!visible) return;
      const st = state.current;
      const W = c.width / Math.min(devicePixelRatio, 2);
      const H = c.height / Math.min(devicePixelRatio, 2);
      const cs = Math.min(W / COLS, H / ROWS);
      const ox = (W - cs * COLS) / 2;
      const oy = (H - cs * ROWS) / 2;
      (c as HTMLCanvasElement & { _cell?: object })._cell = { cs, ox, oy };

      // autopilot when nobody is driving
      if (!st.path.length && now - st.lastAction > 3500) {
        for (let tries = 0; tries < 30; tries++) {
          const tx = Math.floor(Math.random() * COLS);
          const ty = Math.floor(Math.random() * ROWS);
          if (st.grid[ty][tx]) continue;
          const p = astar(st.grid, [Math.floor(st.pos.x), Math.floor(st.pos.y)], [tx, ty]);
          if (p && p.length > 6) {
            st.path = p.slice(1);
            st.target = [tx, ty];
            st.lastAction = now;
            break;
          }
        }
      }

      // drive
      if (st.path.length) {
        const [nx, ny] = st.path[0];
        const tx = nx + 0.5;
        const ty = ny + 0.5;
        const dx = tx - st.pos.x;
        const dy = ty - st.pos.y;
        const d = Math.hypot(dx, dy);
        const want = Math.atan2(dy, dx);
        let diff = want - st.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        st.heading += diff * Math.min(1, dt * 10);
        const speed = 5.5 * dt;
        if (d <= speed) {
          st.pos.x = tx;
          st.pos.y = ty;
          st.path.shift();
          if (!st.path.length) {
            st.target = null;
            st.lastAction = now;
            setTrips((n) => n + 1);
          }
        } else {
          st.pos.x += (dx / d) * speed;
          st.pos.y += (dy / d) * speed;
        }
        st.trail.push({ ...st.pos });
        if (st.trail.length > 60) st.trail.shift();
      }

      // ── draw ──
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#14100c";
      roundRect(ox, oy, cs * COLS, cs * ROWS, 14);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,236,214,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x <= COLS; x++) {
        ctx.beginPath();
        ctx.moveTo(ox + x * cs, oy);
        ctx.lineTo(ox + x * cs, oy + ROWS * cs);
        ctx.stroke();
      }
      for (let y = 0; y <= ROWS; y++) {
        ctx.beginPath();
        ctx.moveTo(ox, oy + y * cs);
        ctx.lineTo(ox + COLS * cs, oy + y * cs);
        ctx.stroke();
      }

      // hover tile
      if (st.hover) {
        const [hx, hy] = st.hover;
        ctx.fillStyle = st.grid[hy]?.[hx] ? "rgba(255,80,40,0.18)" : "rgba(255,178,46,0.15)";
        ctx.fillRect(ox + hx * cs, oy + hy * cs, cs, cs);
      }

      for (const b of layouts[layout]) {
        const x = ox + b.x * cs + 2;
        const y = oy + b.y * cs + 2;
        const w = b.w * cs - 4;
        const h = b.h * cs - 4;
        if (b.kind === "shelf") {
          ctx.fillStyle = "#3a2a1c";
          roundRect(x, y, w, h, 4);
          ctx.fill();
          for (let i = 0; i < b.h * 2; i++) {
            ctx.fillStyle = i % 3 === 0 ? "#f28c0f" : i % 3 === 1 ? "#c8622a" : "#a8977f";
            ctx.fillRect(x + 4, y + 4 + i * (h / (b.h * 2)), w - 8, h / (b.h * 2) - 4);
          }
        } else if (b.kind === "wall") {
          ctx.fillStyle = "#5a4c40";
          roundRect(x + cs * 0.25, y, w - cs * 0.5, h, 3);
          ctx.fill();
        } else {
          ctx.fillStyle = "rgba(244,237,228,0.1)";
          ctx.strokeStyle = "rgba(244,237,228,0.25)";
          roundRect(x, y, w, h, 8);
          ctx.fill();
          ctx.stroke();
          if (b.label) {
            ctx.fillStyle = "rgba(255,243,228,0.7)";
            ctx.font = `600 ${Math.max(9, cs * 0.38)}px ui-monospace, monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(b.label, x + w / 2, y + h / 2);
          }
        }
      }

      // planned path
      if (st.path.length) {
        ctx.setLineDash([4, 6]);
        ctx.lineDashOffset = -now / 40;
        ctx.strokeStyle = "rgba(255,178,46,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox + st.pos.x * cs, oy + st.pos.y * cs);
        for (const [px, py] of st.path) ctx.lineTo(ox + (px + 0.5) * cs, oy + (py + 0.5) * cs);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // target pin
      if (st.target) {
        const [tx, ty] = st.target;
        const px = ox + (tx + 0.5) * cs;
        const py = oy + (ty + 0.5) * cs;
        const pulse = (now / 900) % 1;
        ctx.strokeStyle = `rgba(255,178,46,${1 - pulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, cs * (0.3 + pulse * 0.6), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "#ffb22e";
        ctx.beginPath();
        ctx.arc(px, py, cs * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }

      // trail
      st.trail.forEach((p, i) => {
        ctx.fillStyle = `rgba(242,140,15,${(i / st.trail.length) * 0.35})`;
        ctx.beginPath();
        ctx.arc(ox + p.x * cs, oy + p.y * cs, cs * 0.12, 0, Math.PI * 2);
        ctx.fill();
      });

      // robot + LiDAR sweep
      const rx = ox + st.pos.x * cs;
      const ry = oy + st.pos.y * cs;
      const sweep = (now / 600) % (Math.PI * 2);
      const grd = ctx.createRadialGradient(rx, ry, 0, rx, ry, cs * 3.2);
      grd.addColorStop(0, "rgba(255,178,46,0.28)");
      grd.addColorStop(1, "rgba(255,178,46,0)");
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.arc(rx, ry, cs * 3.2, sweep, sweep + 0.7);
      ctx.closePath();
      ctx.fill();

      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(st.heading);
      ctx.shadowColor = "rgba(242,140,15,0.8)";
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#f4ede4";
      ctx.beginPath();
      ctx.arc(0, 0, cs * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#f28c0f";
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = "#1c1712";
      ctx.beginPath();
      ctx.moveTo(cs * 0.3, 0);
      ctx.lineTo(cs * 0.02, -cs * 0.17);
      ctx.lineTo(cs * 0.02, cs * 0.17);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
    };
  }, [layout]);

  const cellFromEvent = (e: React.PointerEvent): [number, number] | null => {
    const c = canvas.current as HTMLCanvasElement & { _cell?: { cs: number; ox: number; oy: number } };
    if (!c._cell) return null;
    const r = c.getBoundingClientRect();
    const { cs, ox, oy } = c._cell;
    const x = Math.floor((e.clientX - r.left - ox) / cs);
    const y = Math.floor((e.clientY - r.top - oy) / cs);
    if (x < 0 || y < 0 || x >= COLS || y >= ROWS) return null;
    return [x, y];
  };

  const onClick = (e: React.PointerEvent) => {
    const cell = cellFromEvent(e);
    if (!cell) return;
    const st = state.current;
    st.lastAction = performance.now();
    if (st.grid[cell[1]][cell[0]]) {
      setStatus("That tile is blocked. Pick open floor.");
      return;
    }
    const start: [number, number] = st.path.length ? st.path[0] : [Math.floor(st.pos.x), Math.floor(st.pos.y)];
    const p = astar(st.grid, start, cell);
    if (!p) {
      setStatus("No route there. Try another spot.");
      return;
    }
    st.path = p;
    st.target = cell;
    setStatus(`Route planned: ${p.length} tiles around ${layout === "warehouse" ? "the shelves" : "the furniture"}, zero collisions.`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3">
        <div className="flex rounded-full bg-white/[0.05] p-1" role="radiogroup" aria-label="Setting">
          {(["warehouse", "household"] as Layout[]).map((l) => (
            <button
              key={l}
              role="radio"
              aria-checked={layout === l}
              onClick={() => pickLayout(l)}
              className={cn("rounded-full px-3.5 py-1.5 font-mono text-[0.68rem] uppercase tracking-[0.15em] transition-colors", layout === l ? "bg-accent text-on-accent" : "text-sand/70 hover:text-cream")}
            >
              {l === "warehouse" ? "SIARC · Warehouse" : "FIACC · Household"}
            </button>
          ))}
        </div>
        <span className="font-mono text-[0.68rem] text-muted">Trips completed: <span className="text-amber">{trips}</span></span>
      </div>
      <div ref={wrap} className="relative min-h-0 flex-1">
        <canvas
          ref={canvas}
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onPointerUp={onClick}
          onPointerMove={(e) => (state.current.hover = cellFromEvent(e))}
          onPointerLeave={() => (state.current.hover = null)}
          aria-label="Floor plan. Click a tile to send the robot there."
        />
      </div>
      <p className="pt-3 font-mono text-[0.7rem] text-sand/70" aria-live="polite">› {status}</p>
    </div>
  );
}
