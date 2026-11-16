"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { animate, motion, useInView, useMotionValue, useSpring, useTransform } from "motion/react";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Motion graphic built from the rover photo on enlightwisdom.com.
 * The car is cut out and its two visible rims are unwrapped into flat textures,
 * so the wheels genuinely spin. Around it: a rushing floor, speed lines,
 * ultrasonic "sonar" pings from its sensors, glowing LED lamps and live telemetry.
 * Hold "Boost" (or press and hold the car) to floor it.
 */

const CAR_W = 536;
const CAR_H = 308;
const wheels = [
  { id: "rear", cx: 35.5, cy: 175.8, R: 68, sx: 0.396, sy: 0.994, rot: 177 },
  { id: "front", cx: 145.3, cy: 200.5, R: 90, sx: 0.478, sy: 0.998, rot: 172.1 },
];
const sensors = [
  { x: 372, y: 166 },
  { x: 484, y: 136 },
];
const lamp = { x: 455, y: 190 };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

export default function CarScene() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "-15% 0px" });
  const [arrived, setArrived] = useState(false);
  const [boost, setBoost] = useState(false);
  const speed = useMotionValue(0); // 0..1
  const smooth = useSpring(speed, { stiffness: 60, damping: 16 });
  const kmh = useTransform(smooth, (v) => Math.round(v * 38));
  const [kmhText, setKmhText] = useState(0);
  const [dist, setDist] = useState(2.4);

  // wheel angle + floor offset driven by a single rAF loop, so speed changes feel physical
  const wheelAngle = useMotionValue(0);
  const floorX = useMotionValue(0);
  const shake = useMotionValue(0);

  // first time it scrolls into view: drive in fast, then settle to a cruise
  useEffect(() => {
    if (!inView || arrived) return;
    const t = setTimeout(() => setArrived(true), 1500);
    return () => clearTimeout(t);
  }, [inView, arrived]);

  useEffect(() => {
    speed.set(!arrived ? 1 : boost ? 1 : 0.35);
  }, [boost, arrived, speed]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let t = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!inView) return;
      t += dt;
      const v = smooth.get();
      wheelAngle.set(wheelAngle.get() + dt * (120 + v * 1500));
      floorX.set((floorX.get() - dt * (60 + v * 900)) % 80);
      shake.set(Math.sin(t * (18 + v * 40)) * (0.4 + v * 1.4));
    };
    raf = requestAnimationFrame(loop);
    const unsub = kmh.on("change", (v) => setKmhText(v));
    const id = setInterval(() => setDist((d) => Math.max(0.4, Math.min(3.8, d + (Math.random() - 0.5) * 0.6))), 700);
    return () => {
      cancelAnimationFrame(raf);
      unsub();
      clearInterval(id);
    };
  }, [inView, smooth, wheelAngle, floorX, shake, kmh]);

  const carX = useMotionValue(-130);
  useEffect(() => {
    if (inView && !arrived) animate(carX, 0, { duration: 1.5, ease: [0.16, 1, 0.3, 1] });
  }, [inView, arrived, carX]);
  const carXpct = useTransform(carX, (v) => `${v}%`);
  const boostNudge = useSpring(0, { stiffness: 120, damping: 14 });
  useEffect(() => {
    boostNudge.set(boost ? 4 : 0);
  }, [boost, boostNudge]);
  const nudge = useTransform(boostNudge, (v) => `${v}%`);
  const tilt = useTransform(smooth, (v) => -v * 2.2);
  const floorPos = useTransform(floorX, (v) => `${v}px 0px`);
  const blur = useTransform(smooth, (v) => `blur(${Math.max(0, v - 0.7) * 4}px)`);
  const lineOpacity = useTransform(smooth, [0.2, 1], [0.25, 1]);

  const start = () => setBoost(true);
  const stop = () => setBoost(false);

  return (
    <div
      ref={ref}
      className="theme-dark relative aspect-[4/3] w-full sm:aspect-[16/10] select-none overflow-hidden rounded-md"
      onPointerLeave={stop}
    >
      {/* sky glow */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(70%_60%_at_65%_40%,rgb(238_122_12/0.28),transparent_70%)]" />

      {/* rushing floor grid in perspective */}
      <div aria-hidden="true" className="absolute inset-x-[-20%] bottom-0 h-[46%] [perspective:420px]">
        <motion.div
          className="absolute inset-0 origin-top [transform:rotateX(62deg)]"
          style={{
            backgroundPosition: floorPos,
            backgroundImage:
              "linear-gradient(90deg, rgb(242 236 224 / 0.16) 1px, transparent 1px), linear-gradient(rgb(242 236 224 / 0.12) 1px, transparent 1px)",
            backgroundSize: "80px 80px, 80px 40px",
            maskImage: "linear-gradient(transparent, #000 30%)",
          }}
        />
      </div>

      {/* speed lines */}
      <motion.div aria-hidden="true" style={{ opacity: lineOpacity }} className="pointer-events-none absolute inset-0">
        {Array.from({ length: 14 }).map((_, i) => (
          <span
            key={i}
            className="speed-line absolute h-px bg-gradient-to-l from-transparent via-paper/70 to-transparent"
            style={{
              top: `${12 + ((i * 37) % 70)}%`,
              width: `${18 + ((i * 13) % 30)}%`,
              animationDuration: `${(boost ? 0.35 : 0.9) + ((i * 7) % 5) * (boost ? 0.06 : 0.18)}s`,
              animationDelay: `${-(i * 0.23)}s`,
            }}
          />
        ))}
      </motion.div>

      {/* the rover */}
      <motion.div
        className="absolute left-[10%] top-[24%] w-[78%] cursor-pointer touch-none sm:left-[12%] sm:top-[17%] sm:w-[72%]"
        style={{ x: carXpct, aspectRatio: `${CAR_W} / ${CAR_H}` }}
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
      >
        <motion.div className="absolute inset-0" style={{ x: nudge, y: shake, rotate: tilt, filter: blur }}>
          {/* contact shadow */}
          <div aria-hidden="true" className="absolute -bottom-[4%] left-[4%] h-[14%] w-[92%] rounded-[50%] bg-black/70 blur-md" />
          <Image src="/photos/car.webp" alt="A four-wheel rover with ultrasonic sensors and LED lamps, from the Enlight Wisdom lab" fill sizes="(min-width:1024px) 40vw, 90vw" className="object-contain" priority={false} />

          {/* spinning rims */}
          {wheels.map((w) => (
            <div
              key={w.id}
              aria-hidden="true"
              className="absolute"
              style={{
                left: pct(w.cx - w.R, CAR_W),
                top: pct(w.cy - w.R, CAR_H),
                width: pct(2 * w.R, CAR_W),
                height: pct(2 * w.R, CAR_H),
                transform: `rotate(${w.rot}deg) scale(${w.sx}, ${w.sy})`,
              }}
            >
              <motion.div className="absolute inset-0" style={{ rotate: wheelAngle }}>
                <Image src={`/photos/wheel-${w.id}.webp`} alt="" fill sizes="200px" className="object-contain" />
              </motion.div>
            </div>
          ))}

          {/* ultrasonic pings */}
          {sensors.map((s, i) => (
            <span key={i} aria-hidden="true" className="absolute" style={{ left: pct(s.x, CAR_W), top: pct(s.y, CAR_H) }}>
              {[0, 1, 2].map((k) => (
                <span
                  key={k}
                  className="sonar absolute left-0 top-0 h-16 w-16 rounded-full"
                  style={{ animationDelay: `${k * 0.6 + i * 0.3}s`, animationDuration: boost ? "1.1s" : "1.8s" }}
                />
              ))}
            </span>
          ))}

          {/* LED lamps */}
          <span aria-hidden="true" className="absolute" style={{ left: pct(lamp.x, CAR_W), top: pct(lamp.y, CAR_H) }}>
            <span className={cn("lamp absolute h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full", boost && "lamp-boost")} />
            <span className={cn("beam absolute left-0 top-0 h-24 w-[22rem] -translate-y-1/2 origin-left", boost && "opacity-90")} />
          </span>
        </motion.div>
      </motion.div>

      {/* telemetry HUD */}
      <div className="pointer-events-none absolute left-4 top-4 font-mono text-[0.64rem] uppercase tracking-[0.16em] text-sand sm:left-6 sm:top-6">
        <p className="text-amber">From our lab</p>
        <p className="mt-2">Speed <span className="tabular-nums text-cream">{String(kmhText).padStart(2, "0")} km/h</span></p>
        <p>Obstacle <span className="tabular-nums text-cream">{dist.toFixed(1)} m</span></p>
      </div>
      <div className="pointer-events-none absolute right-4 top-4 hidden text-right font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted sm:right-6 sm:top-6 sm:block">
        <p>Ultrasonic sensors ×2</p>
        <p>LED lamps</p>
        <p>4-wheel drive</p>
      </div>

      <button
        onPointerDown={start}
        onPointerUp={stop}
        onPointerCancel={stop}
        onKeyDown={(e) => (e.key === " " || e.key === "Enter") && start()}
        onKeyUp={stop}
        onBlur={stop}
        aria-pressed={boost}
        className={cn(
          "absolute bottom-4 right-4 inline-flex touch-none items-center gap-2 rounded-full px-4 py-2.5 text-[0.7rem] font-bold uppercase tracking-[0.14em] transition-colors sm:bottom-6 sm:right-6",
          boost ? "bg-brand text-ink" : "bg-paper text-ink hover:bg-white"
        )}
      >
        <Zap className="h-4 w-4" fill={boost ? "currentColor" : "none"} aria-hidden="true" />
        Hold to boost
      </button>
    </div>
  );
}
