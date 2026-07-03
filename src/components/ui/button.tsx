"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "glow";
type Size = "sm" | "md" | "lg" | "xl" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-green text-kyber-black font-semibold hover:shadow-glow hover:brightness-110 active:scale-[0.98]",
  glow: "bg-gradient-green text-kyber-black font-semibold shadow-glow-sm hover:shadow-glow-lg hover:brightness-110 active:scale-[0.98] animate-pulse-glow",
  secondary:
    "bg-kyber-elevated text-kyber-soft border border-border hover:bg-kyber-surface hover:border-kyber-green/30 active:scale-[0.98]",
  outline:
    "border border-kyber-green/40 text-kyber-green hover:bg-kyber-green/10 hover:border-kyber-green active:scale-[0.98]",
  ghost: "text-kyber-gray hover:text-kyber-soft hover:bg-white/5 active:scale-[0.98]",
  danger: "bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
  md: "h-10 px-4 text-sm rounded-xl gap-2",
  lg: "h-12 px-6 text-base rounded-xl gap-2",
  xl: "h-14 px-8 text-base rounded-2xl gap-2.5",
  icon: "h-10 w-10 rounded-xl",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "focus-ring inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
);
Button.displayName = "Button";
