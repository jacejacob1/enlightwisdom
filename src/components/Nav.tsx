"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { nav, site } from "@/lib/content";
import { cn, scrollToId } from "@/lib/utils";

type NavTheme = "light" | "dark" | "orange";

export default function Nav() {
  const [active, setActive] = useState<string>("");
  const [theme, setTheme] = useState<NavTheme>("dark");
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 25 });

  useEffect(() => {
    // The bar takes the colour of whichever section sits beneath it.
    const onScroll = () => {
      setSolid(window.scrollY > 40);
      const probe = 36;
      const els = document.querySelectorAll<HTMLElement>("[data-nav]");
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          setTheme(el.dataset.nav as NavTheme);
          break;
        }
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    const ids = [...nav.map((n) => n.id), "contact", "top", "divisions", "about", "proof"];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    return () => {
      window.removeEventListener("scroll", onScroll);
      io.disconnect();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    if (open) lenis?.stop();
    else lenis?.start();
  }, [open]);

  const go = (id: string) => {
    const wasOpen = open;
    setOpen(false);
    setTimeout(() => scrollToId(id), wasOpen ? 300 : 0);
  };

  const t = open ? "dark" : theme;

  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-brand" style={{ scaleX: progress }} aria-hidden="true" />
      <header
        className={cn(
          `theme-${t} fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-300`,
          solid || open ? "border-b border-line" : "border-b border-transparent !bg-transparent"
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[90rem] items-center justify-between px-5 sm:px-8" aria-label="Main">
          <button onClick={() => go("top")} className="group flex items-center gap-3" aria-label="Enlight Wisdom, back to top">
            <img src="/brand/ew-cap.png" alt="" className={cn("h-6 w-auto transition-transform duration-500 group-hover:-rotate-12", t === "orange" && "brightness-0")} />
            <span className="font-brand text-[1rem] font-semibold uppercase leading-none tracking-[0.14em]">Enlight Wisdom</span>
          </button>

          <ul className="hidden items-center gap-8 lg:flex">
            {nav.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => go(n.id)}
                  aria-current={active === n.id ? "true" : undefined}
                  className={cn("link-u py-1 text-[0.78rem] font-semibold uppercase tracking-[0.14em] transition-opacity", active === n.id ? "bg-[length:100%_1px] opacity-100" : "opacity-70 hover:opacity-100")}
                >
                  {n.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <a href={`tel:+${site.phoneRaw}`} className="hidden text-[0.78rem] font-semibold tracking-[0.06em] opacity-70 hover:opacity-100 xl:block">
              {site.phoneDisplay}
            </a>
            <button onClick={() => go("contact")} className="btn-primary hidden rounded-full px-5 py-2.5 text-[0.78rem] font-semibold uppercase tracking-[0.12em] sm:inline-flex">
              Talk to us
            </button>
            <button
              onClick={() => setOpen((o) => !o)}
              className="relative grid h-11 w-11 place-items-center lg:hidden"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className={cn("absolute h-[2px] w-6 bg-current transition-transform duration-300", open ? "rotate-45" : "-translate-y-[5px]")} />
              <span className={cn("absolute h-[2px] w-6 bg-current transition-transform duration-300", open ? "-rotate-45" : "translate-y-[5px]")} />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="theme-dark fixed inset-0 z-40 flex flex-col justify-between px-6 pb-10 pt-24 lg:hidden"
          >
            <ul>
              {[...nav, { id: "contact", label: "Talk to us" }].map((n, i) => (
                <motion.li key={n.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.05 }} className="border-b border-line">
                  <button onClick={() => go(n.id)} className="flex w-full items-baseline justify-between py-3 text-left">
                    <span className={cn("display text-5xl", n.id === "contact" && "text-amber")}>{n.label}</span>
                    <span className="text-xs font-semibold text-muted">0{i + 1}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
            <div className="space-y-1 text-sm text-sand">
              <a href={`tel:+${site.phoneRaw}`} className="block">
                {site.phoneDisplay}
              </a>
              <a href={`mailto:${site.email}`} className="block">
                {site.email}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
