"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "motion/react";
import { MonitorCheck, Navigation, Store, Smile, Play, MousePointerClick } from "lucide-react";
import { products, type ProductId } from "@/lib/content";
import { Reveal, SectionHeader, Tag } from "@/components/ui/primitives";
import { cn, enquire } from "@/lib/utils";

const Loading = () => <div className="grid h-full place-items-center font-mono text-xs text-muted">Booting simulation…</div>;
const demos: Record<ProductId, React.ComponentType> = {
  shiken: dynamic(() => import("@/components/demos/ShikenDemo"), { ssr: false, loading: Loading }),
  amr: dynamic(() => import("@/components/demos/AmrDemo"), { ssr: false, loading: Loading }),
  ergotrack: dynamic(() => import("@/components/demos/ErgoDemo"), { ssr: false, loading: Loading }),
  carisk: dynamic(() => import("@/components/demos/CariskDemo"), { ssr: false, loading: Loading }),
};
const icons: Record<ProductId, typeof MonitorCheck> = { shiken: MonitorCheck, amr: Navigation, ergotrack: Store, carisk: Smile };

export default function Products() {
  const [active, setActive] = useState<ProductId>("amr");
  const p = products.items.find((x) => x.id === active)!;
  const Demo = demos[active];

  return (
    <section id="products" data-nav="light" className="theme-light relative px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto max-w-[90rem]">
        <SectionHeader index="04" eyebrow={products.label} title={products.headline} intro={products.intro} />

        <Reveal delay={0.1}>
          <div className="no-scrollbar -mx-5 mt-14 flex gap-3 overflow-x-auto px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0" role="tablist" aria-label="Products">
            {products.items.map((it) => {
              const Icon = icons[it.id];
              const on = it.id === active;
              return (
                <button
                  key={it.id}
                  role="tab"
                  aria-selected={on}
                  aria-controls="product-panel"
                  onClick={() => setActive(it.id)}
                  className={cn(
                    "group relative min-w-[13rem] overflow-hidden rounded-md border p-4 text-left transition-all duration-300 sm:min-w-0",
                    on ? "border-cream bg-panel" : "border-line hover:border-cream/40"
                  )}
                >
                  {on && <motion.span layoutId="prod-bar" className="absolute inset-x-0 top-0 h-[3px] bg-accent" />}
                  <div className="flex items-center gap-3">
                    <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded transition-colors", on ? "bg-accent text-on-accent" : "bg-white/[0.06] text-amber")}>
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold leading-tight text-cream">{it.name}</p>
                      <p className="truncate text-xs text-muted">{it.what}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div id="product-panel" role="tabpanel" className="glass mt-4 grid overflow-hidden rounded-md lg:grid-cols-[0.85fr_1.15fr]">
            <div className="relative p-7 sm:p-10">
              <AnimatePresence mode="wait">
                <motion.div key={p.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.35 }}>
                  <p className="eyebrow">{p.what}</p>
                  <h3 className="mt-3 font-display text-4xl font-bold tracking-tight text-cream sm:text-5xl">{p.name}</h3>
                  <p className="mt-5 text-base leading-relaxed text-sand/85">{p.d}</p>
                  <div className="mt-6 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <Tag key={t}>{t}</Tag>
                    ))}
                  </div>
                  <div className="mt-8 flex items-start gap-3 rounded-md border border-dashed border-amber/30 bg-amber/[0.05] p-4 text-sm text-sand">
                    <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
                    <span>
                      <strong className="text-cream">Try it:</strong> {p.demoHint}
                    </span>
                  </div>
                  <button
                    onClick={() => enquire({ interest: "A product demo", message: `I'd like a demo of ${p.name}.` })}
                    className="btn-primary mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3.5 font-semibold"
                  >
                    <Play className="h-4 w-4" fill="currentColor" aria-hidden="true" /> Request a {p.name} demo
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="relative border-t border-line bg-sunk p-4 sm:p-6 lg:border-l lg:border-t-0">
              <div className="mb-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-amber">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" /> Live simulation
                </span>
                <span className="font-mono text-[0.65rem] text-muted">Illustrative preview</span>
              </div>
              <div className={cn(active === "shiken" ? "h-[760px] sm:h-[500px]" : "h-[440px] sm:h-[480px]")}>
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.3 }} className="h-full">
                    <Demo />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
