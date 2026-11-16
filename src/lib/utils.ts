import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type LenisLike = { scrollTo: (t: Element | number, o?: { offset?: number; duration?: number }) => void };

/** Smooth-scroll to a section id, using Lenis when it is running. */
export function scrollToId(id: string) {
  if (typeof window === "undefined") return;
  const el = id === "top" ? 0 : document.getElementById(id);
  if (el === null) return;
  const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
  if (lenis) lenis.scrollTo(el, { offset: id === "top" ? 0 : -24, duration: 1.4 });
  else if (el === 0) window.scrollTo({ top: 0, behavior: "smooth" });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export type EnquiryDetail = { interest?: string; message?: string };

/** Pre-fill the contact form from anywhere on the page, then scroll to it. */
export function enquire(detail: EnquiryDetail) {
  window.dispatchEvent(new CustomEvent<EnquiryDetail>("ew:enquire", { detail }));
  scrollToId("contact");
}

export type RobotMode = "idle" | "automate" | "teach";
export function setRobotMode(mode: RobotMode) {
  window.dispatchEvent(new CustomEvent<RobotMode>("ew:robot-mode", { detail: mode }));
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
