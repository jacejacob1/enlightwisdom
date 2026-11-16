"use client";

import { useRef, useState } from "react";
import Image from "next/image";
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
                  className="group relative block w-full overflow-hidden rounded-md border border-line bg-panel text-left transition-colors hover:border-cream/40"
                >
                  {/* photo window: the human sits behind the robot visor */}
                  <div className="relative aspect-[5/6] overflow-hidden bg-ink">
                    {/* full photo: settles from a slight zoom as the visor lifts */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ scale: isOpen ? 1 : 1.12 }}
                      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <Image
                        src={m.photo}
                        alt={`Portrait of ${m.name}`}
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="object-cover object-top"
                      />
                    </motion.div>
                    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-black/25 to-transparent" />

                    <motion.div
                      animate={{ y: isOpen ? "-102%" : "0%" }}
                      transition={{ type: "spring", stiffness: 140, damping: 20 }}
                      className="absolute inset-0 flex flex-col items-center justify-center gap-4 border-b-2 border-brand bg-[linear-gradient(160deg,#211a14,#120e0a)]"
                    >
                      <motion.div animate={{ rotate: isOpen ? -8 : 0 }} className="relative">
                        <RobotFace seed={i} />
                      </motion.div>
                      <p className="relative text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#948878]">
                        {m.role.split(" ")[0]} unit · <span className="text-[#f59b40]">tap to reveal</span>
                      </p>
                    </motion.div>
                  </div>

                  <div className="flex items-start justify-between gap-4 p-5">
                    <div>
                      <p className="text-xl font-semibold leading-tight text-cream">{m.name}</p>
                      <p className="mt-1 text-sm text-sand">{m.role}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-[0.68rem] font-semibold text-muted">{m.profile}</span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
