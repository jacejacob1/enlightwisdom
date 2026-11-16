"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { team } from "@/lib/content";
import { Reveal, SectionHeader } from "@/components/ui/primitives";

function RobotFace({ seed }: { seed: number }) {
  const head = ["rect", "round", "dome"][seed % 3];
  const eyes = ["dot", "bar", "ring"][(seed + 1) % 3];
  const antenna = seed % 2 === 0;
  return (
    <svg viewBox="0 0 120 120" className="h-28 w-28" aria-hidden="true">
      {antenna && (
        <g>
          <line x1="60" y1="18" x2="60" y2="6" stroke="#a8977f" strokeWidth="3" />
          <circle cx="60" cy="6" r="4.5" fill="#ffb22e">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.6s" repeatCount="indefinite" />
          </circle>
        </g>
      )}
      {!antenna && <path d="M40 22 l-6 -12 M80 22 l6 -12" stroke="#a8977f" strokeWidth="3" strokeLinecap="round" />}
      {head === "rect" && <rect x="20" y="18" width="80" height="70" rx="16" fill="#f4ede4" />}
      {head === "round" && <ellipse cx="60" cy="54" rx="42" ry="38" fill="#f4ede4" />}
      {head === "dome" && <path d="M18 88 V52 a42 38 0 0 1 84 0 V88 Z" fill="#f4ede4" />}
      <rect x="30" y="38" width="60" height="32" rx="12" fill="#14100c" />
      {eyes === "dot" && (
        <g fill="#ffb22e">
          <circle cx="47" cy="54" r="5" />
          <circle cx="73" cy="54" r="5" />
        </g>
      )}
      {eyes === "bar" && (
        <g fill="#ffb22e">
          <rect x="40" y="51" width="14" height="6" rx="3" />
          <rect x="66" y="51" width="14" height="6" rx="3" />
        </g>
      )}
      {eyes === "ring" && (
        <g fill="none" stroke="#ffb22e" strokeWidth="3">
          <circle cx="47" cy="54" r="5" />
          <circle cx="73" cy="54" r="5" />
        </g>
      )}
      <rect x="10" y="44" width="10" height="20" rx="4" fill="#f28c0f" />
      <rect x="100" y="44" width="10" height="20" rx="4" fill="#f28c0f" />
      <rect x="44" y="92" width="32" height="10" rx="3" fill="#2b2520" />
      <path d="M30 120 q30 -26 60 0" fill="#d0570f" />
    </svg>
  );
}

const initials = (name: string) =>
  name
    .replace(/\(.*\)/, "")
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("");

export default function Team() {
  const [open, setOpen] = useState<number | null>(null);
  const [touched, setTouched] = useState<Set<number>>(new Set());
  const lastPointer = useRef<string>("");

  const reveal = (i: number | null) => {
    setOpen(i);
    if (i !== null) setTouched((t) => new Set(t).add(i));
  };

  return (
    <section id="team" data-nav="light" className="theme-light relative overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="08" eyebrow="Team" title={team.headline} intro={team.intro}
          aside={
            <>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
                Hover or tap a robot to meet the human · <span className="text-amber">{touched.size}/{team.members.length} met</span>
              </p>
            </>
          }
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {team.members.map((m, i) => {
            const isOpen = open === i;
            return (
              <Reveal key={m.name} delay={(i % 3) * 0.08}>
                <button
                  onPointerEnter={(e) => e.pointerType === "mouse" && reveal(i)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && reveal(null)}
                  onFocus={(e) => e.currentTarget.matches(":focus-visible") && reveal(i)}
                  onBlur={() => isOpen && reveal(null)}
                  onPointerDown={(e) => (lastPointer.current = e.pointerType)}
                  onClick={() => reveal(lastPointer.current === "mouse" ? i : isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-label={`${m.name}, ${m.role}`}
                  className="glass relative block h-72 w-full overflow-hidden rounded-md text-left"
                >
                  {/* the human */}
                  <div className="absolute inset-0 flex flex-col justify-between p-7">
                    <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,rgb(242_140_15/0.25),transparent_60%)]" />
                    <span className="relative font-brand text-7xl font-semibold leading-none tracking-wider text-grad">{initials(m.name)}</span>
                    <div className="relative">
                      <p className="font-display text-2xl font-bold tracking-tight text-cream">{m.name}</p>
                      <p className="mt-1 text-sm font-medium text-amber">{m.role}</p>
                      <p className="mt-3 inline-block rounded-full border border-line px-3 py-1 font-mono text-[0.68rem] tracking-wide text-sand">{m.profile}</p>
                    </div>
                  </div>

                  {/* the robot visor that lifts away */}
                  <motion.div
                    animate={{ y: isOpen ? "-102%" : "0%" }}
                    transition={{ type: "spring", stiffness: 140, damping: 20 }}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-md border-b-2 border-amber/60 bg-[linear-gradient(160deg,#211a14,#120e0a)]"
                  >
                    <motion.div animate={{ rotate: isOpen ? -8 : 0 }} className="relative">
                      <RobotFace seed={i} />
                    </motion.div>
                    <p className="relative font-mono text-[0.68rem] uppercase tracking-[0.25em] text-muted">
                      {m.role.split(" ")[0]} unit · <span className="text-amber">tap to reveal</span>
                    </p>
                  </motion.div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
