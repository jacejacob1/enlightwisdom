"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { School, Building2, Check, Plus, ArrowRight, Compass, Briefcase, Handshake, Sparkles } from "lucide-react";
import { education } from "@/lib/content";
import { Reveal, SectionHeader, SpotlightCard, Photo } from "@/components/ui/primitives";
import ClassroomStrip from "./ClassroomStrip";
import { cn, enquire } from "@/lib/utils";

type Aud = "schools" | "colleges";
const alsoIcons = [Compass, Briefcase, Handshake];

export default function Education() {
  const [aud, setAud] = useState<Aud>("schools");
  const [picked, setPicked] = useState<Record<Aud, string[]>>({ schools: [], colleges: [] });
  const data = education[aud];
  const sel = picked[aud];

  const toggle = (c: string) =>
    setPicked((p) => ({ ...p, [aud]: p[aud].includes(c) ? p[aud].filter((x) => x !== c) : [...p[aud], c] }));

  const send = () => {
    const who = aud === "schools" ? "our school" : "our college";
    const message = sel.length
      ? `We'd like a programme for ${who} covering: ${sel.join(", ")}.`
      : `We'd like to explore future technology programmes for ${who}.`;
    enquire({ interest: data.interest, message });
  };

  return (
    <section id="education" data-nav="orange" className="theme-orange relative overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="05" eyebrow={education.label} title={education.headline} intro={education.intro}
          aside={
            <>
              <div className="glass relative flex shrink-0 rounded-full p-1.5" role="tablist" aria-label="Audience">
                {(["schools", "colleges"] as Aud[]).map((a) => {
                  const Icon = a === "schools" ? School : Building2;
                  return (
                    <button
                      key={a}
                      role="tab"
                      aria-selected={aud === a}
                      onClick={() => setAud(a)}
                      className={cn("relative flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-colors", aud === a ? "text-on-accent" : "text-sand/80 hover:text-cream")}
                    >
                      {aud === a && <motion.span layoutId="aud-pill" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 380, damping: 30 }} />}
                      <Icon className="relative h-4 w-4" aria-hidden="true" />
                      <span className="relative">{education[a].title}</span>
                    </button>
                  );
                })}
              </div>
            </>
          }
        />

        <AnimatePresence mode="wait">
          <motion.div key={aud} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>
            <div className="mt-14 grid items-end gap-8 lg:grid-cols-12">
              <div className="lg:col-span-5">
                <p className="display text-6xl text-cream sm:text-7xl">{data.title}.</p>
                <p className="serif-i mt-3 text-3xl leading-tight text-cream/80 sm:text-4xl">{data.sub}</p>
              </div>
              <Photo
                src={data.photo}
                alt={aud === "schools" ? "School students building a robot car together" : "College students assembling a robot in a lab"}
                className="aspect-[16/9] rounded-md lg:col-span-7"
                sizes="(min-width: 1024px) 55vw, 100vw"
              />
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.formats.map((f, i) => (
                <motion.div key={f.t} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}>
                  <SpotlightCard tilt className="h-full p-6">
                    <span className="font-mono text-xs text-amber">0{i + 1}</span>
                    <p className="mt-4 font-display text-xl font-semibold text-cream">{f.t}</p>
                    <p className="mt-2 text-sm leading-relaxed text-sand/75">{f.d}</p>
                  </SpotlightCard>
                </motion.div>
              ))}
            </div>

            {/* course builder */}
            <div className="glass mt-6 rounded-md p-6 sm:p-9">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="eyebrow flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Build your programme
                  </p>
                  <p className="mt-2 text-sm text-sand/75">Tap the courses you want. We&apos;ll attach them to your enquiry.</p>
                </div>
                <div className="flex items-center gap-3">
                  {sel.length > 0 && (
                    <button onClick={() => setPicked((p) => ({ ...p, [aud]: [] }))} className="text-xs text-muted underline-offset-4 hover:text-cream hover:underline">
                      Clear
                    </button>
                  )}
                  <button onClick={send} className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold">
                    {data.cta}
                    {sel.length > 0 && (
                      <motion.span key={sel.length} initial={{ scale: 0.4 }} animate={{ scale: 1 }} className="grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-xs text-amber">
                        {sel.length}
                      </motion.span>
                    )}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>

              <div className="mt-8 space-y-7">
                {data.courseGroups.map((g) => (
                  <div key={g.name}>
                    {data.courseGroups.length > 1 && <p className="mb-3 font-mono text-[0.68rem] uppercase tracking-[0.18em] text-muted">{g.name}</p>}
                    <div className="flex flex-wrap gap-2.5">
                      {g.courses.map((c) => {
                        const on = sel.includes(c);
                        return (
                          <motion.button
                            key={c}
                            layout
                            whileTap={{ scale: 0.92 }}
                            onClick={() => toggle(c)}
                            aria-pressed={on}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200",
                              on ? "border-transparent bg-accent text-on-accent" : "border-line bg-white/[0.03] text-sand hover:border-amber/50 hover:text-cream"
                            )}
                          >
                            {on ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Plus className="h-3.5 w-3.5 text-amber" aria-hidden="true" />}
                            {c}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {data.gains && <p className="mt-8 border-t border-line pt-6 text-sm leading-relaxed text-sand/80">{data.gains}</p>}
            </div>
          </motion.div>
        </AnimatePresence>

        <ClassroomStrip />

        {/* also offered */}
        <div className="mt-20">
          <Reveal>
            <h3 className="display text-4xl text-cream sm:text-5xl">{education.alsoTitle}</h3>
          </Reveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {education.also.map((a, i) => {
              const Icon = alsoIcons[i];
              return (
                <Reveal key={a.t} delay={i * 0.08}>
                  <button onClick={() => enquire({ interest: a.interest, message: a.msg })} className="group block h-full w-full text-left">
                    <SpotlightCard className="h-full p-6">
                      <Icon className="h-6 w-6 text-amber" aria-hidden="true" />
                      <p className="mt-5 font-display text-xl font-semibold text-cream">{a.t}</p>
                      <p className="mt-2 text-sm leading-relaxed text-sand/75">{a.d}</p>
                      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-amber">
                        Ask about {a.t.toLowerCase()}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                    </SpotlightCard>
                  </button>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
