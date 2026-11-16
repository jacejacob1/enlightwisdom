"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useSpring } from "motion/react";
import { MapPin, Phone, Mail, Copy, Check, Send, MessageCircle, Pencil, ExternalLink } from "lucide-react";
import { contact, site } from "@/lib/content";
import { Reveal, WordReveal } from "@/components/ui/primitives";
import { cn, type EnquiryDetail } from "@/lib/utils";

type Form = { name: string; org: string; phone: string; interest: string; message: string };
const empty: Form = { name: "", org: "", phone: "", interest: "", message: "" };

/** Little robot that watches you fill in the form. */
function Watcher({ target, typing, peek }: { target: { x: number; y: number }; typing: number; peek: boolean }) {
  const ex = useSpring(0, { stiffness: 200, damping: 18 });
  const ey = useSpring(0, { stiffness: 200, damping: 18 });
  useEffect(() => {
    ex.set(Math.max(-6, Math.min(6, target.x * 6)));
    ey.set(Math.max(-4, Math.min(4, target.y * 4)));
  }, [target, ex, ey]);
  return (
    <svg viewBox="0 0 100 80" className="h-16 w-20" aria-hidden="true">
      <line x1="50" y1="10" x2="50" y2="2" stroke="#a8977f" strokeWidth="2" />
      <circle cx="50" cy="3" r="3" fill="#ffb22e">
        <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <rect x="14" y="10" width="72" height="54" rx="16" fill="#f4ede4" />
      <rect x="22" y="20" width="56" height="30" rx="10" fill="#14100c" />
      <rect x="6" y="28" width="8" height="16" rx="3" fill="#f28c0f" />
      <rect x="86" y="28" width="8" height="16" rx="3" fill="#f28c0f" />
      {peek ? (
        // covering its eyes while you type your phone number
        <g fill="#f28c0f">
          <rect x="24" y="26" width="24" height="16" rx="6" />
          <rect x="52" y="26" width="24" height="16" rx="6" />
        </g>
      ) : (
        <motion.g style={{ x: ex, y: ey }} fill="#ffb22e">
          <rect x="36" y="30" width="7" height="10" rx="3.5" />
          <rect x="57" y="30" width="7" height="10" rx="3.5" />
        </motion.g>
      )}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.rect
          key={i}
          x={40 + i * 4.5}
          width="2.5"
          rx="1"
          fill="#ff8a1a"
          animate={{ height: typing ? [2, 4 + ((i * 7 + typing) % 5), 2] : 2, y: typing ? [55, 53 - ((i * 7 + typing) % 5) / 2, 55] : 55 }}
          transition={{ duration: 0.25 }}
        />
      ))}
    </svg>
  );
}

function CopyBtn({ value, label }: { value: string; label: string }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1600);
        } catch {
          /* clipboard blocked: ignore */
        }
      }}
      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-sand transition-colors hover:bg-white/[0.12] hover:text-cream"
      aria-label={ok ? `${label} copied` : `Copy ${label}`}
    >
      {ok ? <Check className="h-4 w-4 text-amber" /> : <Copy className="h-4 w-4" />}
    </button>
  );
}

export default function Contact() {
  const [form, setForm] = useState<Form>(empty);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState(0);
  const [typing, setTyping] = useState(0);
  const [focus, setFocus] = useState<keyof Form | null>(null);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const formRef = useRef<HTMLFormElement>(null);
  const watcherRef = useRef<HTMLDivElement>(null);

  // other sections pre-fill the form
  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<EnquiryDetail>).detail;
      setDone(false);
      setForm((f) => ({ ...f, interest: d.interest ?? f.interest, message: d.message ?? f.message }));
      setErrors({});
      setFlash((n) => n + 1);
    };
    window.addEventListener("ew:enquire", on);
    return () => window.removeEventListener("ew:enquire", on);
  }, []);

  const lookAt = (clientX: number, clientY: number) => {
    const r = watcherRef.current?.getBoundingClientRect();
    if (!r) return;
    setLook({ x: (clientX - (r.left + r.width / 2)) / 300, y: (clientY - (r.top + r.height / 2)) / 300 });
  };

  const onField = (k: keyof Form, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setTyping((t) => t + 1);
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
    const r = e.target.getBoundingClientRect();
    lookAt(r.left + Math.min(r.width, 12 + e.target.value.length * 8), r.top + r.height / 2);
  };

  const validate = () => {
    const er: typeof errors = {};
    if (form.name.trim().length < 2) er.name = "Please tell us your name.";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) er.phone = "Enter a phone number with at least 10 digits.";
    if (!form.interest) er.interest = "Pick what you're interested in.";
    if (form.message.trim().length < 5) er.message = "A line or two helps us reply properly.";
    setErrors(er);
    return Object.keys(er).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) setDone(true);
    else formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
  };

  const summary = [
    `Hello Enlight Wisdom,`,
    ``,
    form.message.trim(),
    ``,
    `Name: ${form.name.trim()}`,
    form.org.trim() ? `Organisation: ${form.org.trim()}` : null,
    `Phone: ${form.phone.trim()}`,
    `Interested in: ${form.interest}`,
  ]
    .filter((l): l is string => l !== null)
    .join("\n");
  const wa = `https://wa.me/${site.phoneRaw}?text=${encodeURIComponent(summary)}`;
  const mail = `mailto:${site.email}?subject=${encodeURIComponent(`Enquiry: ${form.interest} — ${form.name.trim()}`)}&body=${encodeURIComponent(summary)}`;

  const field = "w-full rounded-md border bg-sunk px-4 py-3.5 text-cream placeholder:text-muted/70 outline-none transition-[border-color,box-shadow] focus:border-amber/70 focus:";
  const social = site.social.filter((s) => s.href);

  return (
    <section id="contact" data-nav="light" className="theme-light relative overflow-hidden px-5 py-28 sm:px-8 lg:py-36">
      <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <Reveal>
            <p className="eyebrow mb-6 flex gap-3 border-t border-line pt-6">
              <span className="text-amber">09</span> Talk to us
            </p>
          </Reveal>
          <h2 className="section-title text-[clamp(2.4rem,5.4vw,4.4rem)] text-cream">
            <WordReveal text={contact.headline} />
          </h2>
          <Reveal delay={0.1}>
            <p className="mt-6 text-lg text-sand/85">{contact.sub}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <ul className="mt-10 space-y-3">
              <li className="flex items-center gap-4 rounded-md border border-line bg-white/[0.02] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-accent text-on-accent">
                  <Phone className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Phone and WhatsApp</p>
                  <a href={`tel:+${site.phoneRaw}`} className="font-semibold text-cream hover:text-amber">
                    {site.phoneDisplay}
                  </a>
                </div>
                <a href={`https://wa.me/${site.phoneRaw}`} target="_blank" rel="noopener noreferrer" className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.06] text-sand hover:bg-white/[0.12] hover:text-cream" aria-label="Chat on WhatsApp">
                  <MessageCircle className="h-4 w-4" />
                </a>
                <CopyBtn value={site.phoneDisplay} label="phone number" />
              </li>
              <li className="flex items-center gap-4 rounded-md border border-line bg-white/[0.02] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-white/[0.07] text-amber">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Email</p>
                  <a href={`mailto:${site.email}`} className="text-[0.9rem] font-semibold text-cream hover:text-amber sm:text-base">
                    {site.email}
                  </a>
                </div>
                <CopyBtn value={site.email} label="email address" />
              </li>
              <li className="flex items-center gap-4 rounded-md border border-line bg-white/[0.02] p-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-white/[0.07] text-amber">
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Address</p>
                  <p className="text-sm font-medium leading-snug text-cream">{site.address}</p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(site.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/[0.06] text-sand hover:bg-white/[0.12] hover:text-cream"
                  aria-label="Open address in Google Maps"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </li>
            </ul>
          </Reveal>
          {social.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {social.map((s) => (
                <a key={s.name} href={s.href} target="_blank" rel="noopener noreferrer" className="btn-ghost rounded-full px-4 py-2 text-sm text-cream">
                  {s.name}
                </a>
              ))}
            </div>
          )}
        </div>

        <Reveal delay={0.1}>
          <motion.div
            key={flash}
            initial={flash ? { scale: 0.98 } : false}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
            className="glass relative overflow-hidden rounded-md p-6 sm:p-9"
            onPointerMove={(e) => lookAt(e.clientX, e.clientY)}
          >
            {flash > 0 && !done && (
              <motion.div initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} transition={{ duration: 1.2 }} className="pointer-events-none absolute inset-0 bg-amber/20" aria-hidden="true" />
            )}
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="font-display text-2xl font-bold text-cream">Send an enquiry</p>
                <p className="text-sm text-muted">{done ? "Choose how you'd like to send it." : "Takes under a minute."}</p>
              </div>
              <div ref={watcherRef}>
                <Watcher target={look} typing={typing} peek={focus === "phone"} />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!done ? (
                <motion.form key="form" ref={formRef} onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-sand">Your name *</span>
                      <input value={form.name} onChange={(e) => onField("name", e)} onFocus={() => setFocus("name")} onBlur={() => setFocus(null)} autoComplete="name" aria-invalid={!!errors.name} className={cn(field, errors.name ? "border-copper" : "border-line")} placeholder="Full name" />
                      {errors.name && <span className="mt-1 block text-xs text-copper">{errors.name}</span>}
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-sm font-medium text-sand">Organisation</span>
                      <input value={form.org} onChange={(e) => onField("org", e)} onFocus={() => setFocus("org")} onBlur={() => setFocus(null)} autoComplete="organization" className={cn(field, "border-line")} placeholder="Company, school or college" />
                    </label>
                  </div>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-sand">Phone *</span>
                    <input value={form.phone} onChange={(e) => onField("phone", e)} onFocus={() => setFocus("phone")} onBlur={() => setFocus(null)} type="tel" inputMode="tel" autoComplete="tel" aria-invalid={!!errors.phone} className={cn(field, errors.phone ? "border-copper" : "border-line")} placeholder="+91 98765 43210" />
                    {errors.phone ? <span className="mt-1 block text-xs text-copper">{errors.phone}</span> : focus === "phone" && <span className="mt-1 block text-xs text-muted">Don&apos;t worry, the robot isn&apos;t looking.</span>}
                  </label>

                  <fieldset>
                    <legend className="mb-2 text-sm font-medium text-sand">I am interested in *</legend>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-invalid={!!errors.interest} tabIndex={errors.interest ? -1 : undefined}>
                      {contact.interests.map((it) => (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={form.interest === it}
                          key={it}
                          onClick={() => {
                            setForm((f) => ({ ...f, interest: it }));
                            setErrors((er) => ({ ...er, interest: undefined }));
                          }}
                          className={cn("rounded-full border px-3.5 py-2 text-[0.82rem] font-medium transition-colors", form.interest === it ? "border-transparent bg-accent text-on-accent" : "border-line bg-white/[0.03] text-sand hover:border-amber/50 hover:text-cream")}
                        >
                          {it}
                        </button>
                      ))}
                    </div>
                    {errors.interest && <span className="mt-1.5 block text-xs text-copper">{errors.interest}</span>}
                  </fieldset>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-sand">How can we help? *</span>
                    <textarea value={form.message} onChange={(e) => onField("message", e)} onFocus={() => setFocus("message")} onBlur={() => setFocus(null)} rows={4} aria-invalid={!!errors.message} className={cn(field, "resize-none", errors.message ? "border-copper" : "border-line")} placeholder="Tell us about the process you want to automate or the students you want to inspire." />
                    {errors.message && <span className="mt-1 block text-xs text-copper">{errors.message}</span>}
                  </label>

                  <button type="submit" className="btn-primary group inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">
                    Continue
                    <Send className="h-4 w-4 transition-transform group-hover:-rotate-12 group-hover:translate-x-1" aria-hidden="true" />
                  </button>
                </motion.form>
              ) : (
                <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
                  <div className="rounded-md border border-line bg-sunk p-5">
                    <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">Your message</p>
                    <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-sand">{summary}</pre>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <a href={wa} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold">
                      <MessageCircle className="h-5 w-5" aria-hidden="true" /> Send on WhatsApp
                    </a>
                    <a href={mail} className="btn-ghost inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-semibold text-cream">
                      <Mail className="h-5 w-5" aria-hidden="true" /> Send by email
                    </a>
                  </div>
                  <button onClick={() => setDone(false)} className="inline-flex items-center gap-2 text-sm text-muted hover:text-cream">
                    <Pencil className="h-4 w-4" aria-hidden="true" /> Edit details
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </Reveal>
      </div>
    </section>
  );
}
