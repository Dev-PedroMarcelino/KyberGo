"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Tone = "green" | "gray" | "yellow" | "red" | "blue" | "purple" | "neon";

const tones: Record<Tone, string> = {
  green: "bg-kyber-green/15 text-kyber-green border-kyber-green/25",
  neon: "bg-kyber-neon/15 text-kyber-neon border-kyber-neon/30 shadow-glow-sm",
  gray: "bg-white/8 text-kyber-gray border-white/10",
  yellow: "bg-amber-400/15 text-amber-300 border-amber-400/25",
  red: "bg-red-500/15 text-red-400 border-red-500/25",
  blue: "bg-sky-400/15 text-sky-300 border-sky-400/25",
  purple: "bg-violet-400/15 text-violet-300 border-violet-400/25",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  dot?: boolean;
}

export function Badge({ className, tone = "gray", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
      {children}
    </span>
  );
}
