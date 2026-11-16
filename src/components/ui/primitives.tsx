"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, type HTMLMotionProps } from "motion/react";
import { useRef, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/utils";

/** Fade + rise into view once. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  ...rest
}: { children: ReactNode; delay?: number; y?: number; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Split "*accent*" markers into words, flagging the italic-serif ones. */
function tokens(text: string) {
  const out: { w: string; serif: boolean }[] = [];
  text.split(/(\*[^*]+\*)/).forEach((chunk) => {
    const serif = chunk.startsWith("*") && chunk.endsWith("*");
    chunk
      .replace(/\*/g, "")
      .split(" ")
      .filter(Boolean)
      .forEach((w) => out.push({ w, serif }));
  });
  return out;
}
export const plain = (text: string) => text.replace(/\*/g, "");

/** Headline that reveals word by word. The in-view trigger sits on the wrapper:
 *  the words start clipped, so observing them directly would never fire. */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = tokens(text);
  return (
    <motion.span
      className={cn("inline", className)}
      aria-label={plain(text)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: delay } } }}
    >
      {words.map((t, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden="true">
          <motion.span
            className={cn("inline-block", t.serif && "serif-i")}
            variants={{ hidden: { y: "110%" }, show: { y: "0%" } }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            {t.w}
            {i < words.length - 1 ? "\u00a0" : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/**
 * Editorial section opener: a hairline rule, a numbered label on the left,
 * a big condensed headline and a short intro set in the right-hand columns.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  index,
  className,
  aside,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  index?: string;
  align?: "left" | "center";
  className?: string;
  aside?: ReactNode;
}) {
  return (
    <div className={cn("border-t border-line pt-6", className)}>
      <div className="grid gap-6 lg:grid-cols-12">
        <Reveal className="lg:col-span-3">
          <p className="eyebrow flex gap-3">
            {index && <span className="text-amber">{index}</span>}
            <span>{eyebrow}</span>
          </p>
        </Reveal>
        <div className="lg:col-span-9">
          <h2 className="section-title text-[clamp(2.8rem,7.2vw,6.6rem)] text-cream">
            <WordReveal text={title} />
          </h2>
          {(intro || aside) && (
            <div className="mt-8 grid gap-6 md:grid-cols-9">
              {intro && (
                <Reveal delay={0.1} className="md:col-span-5">
                  <p className="text-lg leading-relaxed text-sand">{intro}</p>
                </Reveal>
              )}
              {aside && (
                <Reveal delay={0.15} className="flex flex-wrap items-end gap-3 md:col-span-4 md:justify-end">
                  {aside}
                </Reveal>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Flat card with a soft cursor-following highlight and optional 3D tilt.
 * Adapted from Magic UI's MagicCard (distributed on 21st.dev), restyled flat.
 */
export function SpotlightCard({
  children,
  className,
  tilt = false,
  as = "div",
  ...rest
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  glow?: string;
  as?: "div" | "article";
} & Omit<HTMLMotionProps<"div">, "children">) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-400);
  const my = useMotionValue(-400);
  const rx = useSpring(0, { stiffness: 180, damping: 18 });
  const ry = useSpring(0, { stiffness: 180, damping: 18 });
  const bg = useMotionTemplate`radial-gradient(360px circle at ${mx}px ${my}px, color-mix(in oklab, var(--accent) 14%, transparent), transparent 70%)`;

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    mx.set(x);
    my.set(y);
    if (tilt && e.pointerType === "mouse") {
      ry.set((x / r.width - 0.5) * 8);
      rx.set(-(y / r.height - 0.5) * 8);
    }
  };
  const onLeave = () => {
    mx.set(-400);
    my.set(-400);
    rx.set(0);
    ry.set(0);
  };
  const Comp = as === "article" ? motion.article : motion.div;

  return (
    <Comp
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={tilt ? { rotateX: rx, rotateY: ry, transformPerspective: 900 } : undefined}
      className={cn("glass group/spot relative overflow-hidden rounded-md transition-colors duration-300 hover:border-cream/40", className)}
      {...rest}
    >
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/spot:opacity-100" style={{ background: bg }} />
      <div className="relative">{children}</div>
    </Comp>
  );
}

/** Button that leans toward the cursor. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 220, damping: 15 });
  const y = useSpring(0, { stiffness: 220, damping: 15 });
  return (
    <motion.div
      ref={ref}
      className={cn("inline-block", className)}
      style={{ x, y }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = ref.current?.getBoundingClientRect();
    if (!r) return;
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border border-line px-3 py-1 text-[0.75rem] font-medium text-sand",
        className
      )}
    >
      {children}
    </span>
  );
}
