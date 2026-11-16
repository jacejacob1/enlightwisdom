"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDownRight } from "lucide-react";
import RobotStage from "./RobotStage";
import { hero } from "@/lib/content";
import { scrollToId, setRobotMode } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;

function Line({ children, delay, className }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <motion.span className={`block ${className ?? ""}`} initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 1.1, delay, ease }}>
        {children}
      </motion.span>
    </span>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const textY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <section ref={ref} id="top" data-nav="dark" className="theme-dark relative isolate overflow-hidden">
      {/* grainy, painterly colour field — slowly drifting */}
      <div aria-hidden="true" className="hero-field absolute inset-0 -z-10" />
      <div aria-hidden="true" className="hero-grain absolute inset-0 -z-10" />

      <div className="mx-auto grid min-h-[100svh] max-w-[90rem] grid-rows-[1fr_auto] px-5 pt-24 sm:px-8">
        <div className="relative grid items-center gap-2 lg:grid-cols-12">
          <motion.div style={{ y: textY }} className="relative z-10 lg:col-span-7">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.1 }} className="eyebrow mb-8 flex flex-wrap gap-x-6 gap-y-1 text-sand">
              <span>Robotics &amp; AI automation</span>
              <span className="text-muted">Est. Chennai, India</span>
            </motion.p>

            <h1 className="text-cream">
              <Line delay={0.15} className="display text-[clamp(3.4rem,9.6vw,9.4rem)]">
                {hero.headlineA}
              </Line>
              <Line delay={0.32} className="serif-i -mt-1 text-[clamp(2.6rem,6vw,6.2rem)] leading-[0.95] text-amber">
                {hero.headlineB}
              </Line>
            </h1>

            <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.8, ease }} className="mt-8 max-w-lg text-lg leading-relaxed text-sand">
              {hero.sub}
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 1, ease }} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={() => scrollToId("services")}
                onPointerEnter={() => setRobotMode("automate")}
                onPointerLeave={() => setRobotMode("idle")}
                onFocus={() => setRobotMode("automate")}
                onBlur={() => setRobotMode("idle")}
                className="btn-primary group inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.1em]"
              >
                {hero.ctaBusiness}
                <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-45deg]" aria-hidden="true" />
              </button>
              <button
                onClick={() => scrollToId("education")}
                onPointerEnter={() => setRobotMode("teach")}
                onPointerLeave={() => setRobotMode("idle")}
                onFocus={() => setRobotMode("teach")}
                onBlur={() => setRobotMode("idle")}
                className="btn-ghost group inline-flex items-center justify-center gap-3 rounded-full px-7 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-cream"
              >
                {hero.ctaStudents}
                <ArrowDownRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-[-45deg]" aria-hidden="true" />
              </button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.6, delay: 0.4 }}
            className="relative h-[520px] sm:h-[600px] lg:col-span-5 lg:h-[min(780px,calc(100svh-9rem))]"
          >
            <RobotStage scrollProgress={scrollYProgress} />
          </motion.div>
        </div>

        {/* footer strip of the hero: three plain statements, like a printed colophon */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 1.3 }} className="grid grid-cols-2 gap-4 border-t border-line py-5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-sand md:grid-cols-4">
          <span>Robotics &amp; AI for business</span>
          <span>Courses for schools &amp; colleges</span>
          <span className="hidden md:block">Accreditation No. AA00222</span>
          <button onClick={() => scrollToId("divisions")} className="link-u justify-self-start text-left text-cream md:justify-self-end">
            Scroll to explore ↓
          </button>
        </motion.div>
      </div>
    </section>
  );
}
