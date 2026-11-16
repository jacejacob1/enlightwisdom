"use client";

import { ArrowUp } from "lucide-react";
import { footer, nav, site, education } from "@/lib/content";
import { enquire, scrollToId } from "@/lib/utils";

export default function Footer() {
  const social = site.social.filter((s) => s.href);
  return (
    <footer data-nav="dark" className="theme-dark relative overflow-hidden px-5 pb-10 pt-24 sm:px-8">
      <div className="mx-auto max-w-[90rem]">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <img src="/brand/ew-logo.png" alt="Enlight Wisdom — Enlighting to shine" className="w-40" />
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-sand/75">{footer.text}</p>
          </div>

          <nav aria-label="Footer: explore">
            <p className="eyebrow mb-4">Explore</p>
            <ul className="space-y-2.5 text-sm">
              {[{ id: "about", label: "About" }, ...nav, { id: "proof", label: "Why Enlight Wisdom" }].map((n) => (
                <li key={n.id}>
                  <button onClick={() => scrollToId(n.id)} className="text-sand/75 transition-colors hover:text-amber">
                    {n.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer: get started">
            <p className="eyebrow mb-4">Get started</p>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => enquire({ interest: "Automation services for my business" })} className="text-sand/75 hover:text-amber">
                  Automate my business
                </button>
              </li>
              <li>
                <button onClick={() => enquire({ interest: "A product demo" })} className="text-sand/75 hover:text-amber">
                  Book a product demo
                </button>
              </li>
              <li>
                <button onClick={() => enquire({ interest: education.schools.interest })} className="text-sand/75 hover:text-amber">
                  Programmes for schools
                </button>
              </li>
              <li>
                <button onClick={() => enquire({ interest: education.colleges.interest })} className="text-sand/75 hover:text-amber">
                  Programmes for colleges
                </button>
              </li>
              <li>
                <button onClick={() => enquire({ interest: "Internships" })} className="text-sand/75 hover:text-amber">
                  Internships
                </button>
              </li>
              <li>
                <button onClick={() => enquire({ interest: "Becoming a partner centre" })} className="text-sand/75 hover:text-amber">
                  Become a partner centre
                </button>
              </li>
            </ul>
          </nav>

          <div>
            <p className="eyebrow mb-4">Reach us</p>
            <ul className="space-y-2.5 text-sm text-sand/75">
              <li>
                <a href={`tel:+${site.phoneRaw}`} className="hover:text-amber">
                  {site.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${site.email}`} className="break-all hover:text-amber">
                  {site.email}
                </a>
              </li>
              <li className="leading-relaxed">{site.address}</li>
              {social.map((s) => (
                <li key={s.name}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-amber">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p aria-hidden="true" className="display mt-24 select-none text-[clamp(4rem,15.5vw,15rem)] leading-[0.82] text-brand">
          Enlighting <span className="serif-i text-paper">to</span> shine
        </p>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-line pt-8 text-xs text-muted sm:flex-row">
          <p>
            © 2026 {site.name}. {footer.line}
          </p>
          <button onClick={() => scrollToId("top")} className="group inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sand transition-colors hover:border-amber/50 hover:text-cream">
            Back to top <ArrowUp className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </footer>
  );
}
