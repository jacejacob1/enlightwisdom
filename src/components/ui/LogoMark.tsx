"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { logoVectors } from "@/lib/logos";
import { cn } from "@/lib/utils";

/**
 * A partner logo that draws itself in: the traced outline is inked like a pen stroke,
 * the shapes fill, and on hover the original full-colour logo blooms in on top.
 */
export default function LogoMark({ id, name, className, replayKey }: { id: string; name: string; className?: string; replayKey?: string }) {
  const v = logoVectors[id];
  if (!v) return null;
  const stroke = Math.max(v.w, v.h) / 170;
  return (
    <motion.span
      key={replayKey}
      className={cn("group/logo relative block", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
    >
      <svg viewBox={`0 0 ${v.w} ${v.h}`} className="h-full w-full overflow-visible text-cream transition-opacity duration-500 group-hover/logo:opacity-0" role="img" aria-label={`${name} logo`}>
        {/* pen stroke */}
        <motion.path
          d={v.d}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinejoin="round"
          variants={{ hidden: { pathLength: 0, opacity: 1 }, show: { pathLength: 1, opacity: 0 } }}
          transition={{ pathLength: { duration: 1.8, ease: [0.65, 0, 0.35, 1] }, opacity: { duration: 0.5, delay: 1.7 } }}
        />
        {/* ink fill */}
        <motion.path
          d={v.d}
          fill="currentColor"
          fillRule="evenodd"
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          transition={{ duration: 0.7, delay: 1.25 }}
        />
      </svg>
      {/* original colours on hover */}
      <Image
        src={`/photos/partners/${id}.png`}
        alt=""
        aria-hidden="true"
        fill
        sizes="120px"
        draggable={false}
        className="scale-95 object-contain opacity-0 transition duration-500 group-hover/logo:scale-100 group-hover/logo:opacity-100"
      />
    </motion.span>
  );
}
