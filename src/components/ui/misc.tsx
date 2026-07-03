"use client";

/**
 * Componentes utilitários do design system:
 * Tabs, Accordion, Tooltip, Progress, Stepper, Skeleton, EmptyState,
 * Switch, Avatar, MetricCard, Dropdown.
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn, initials } from "@/lib/utils";

/* ---------------- Tabs ---------------- */

export interface TabItem {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export function Tabs({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex flex-wrap gap-1 rounded-xl border border-border bg-white/[0.03] p-1", className)}>
      {items.map((item) => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            "focus-ring relative flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
            value === item.value ? "text-kyber-black" : "text-kyber-gray hover:text-kyber-soft"
          )}
        >
          {value === item.value && (
            <motion.span
              layoutId="tab-pill"
              className="absolute inset-0 rounded-lg bg-gradient-green"
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-1.5">
            {item.icon}
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------------- Accordion ---------------- */

export function Accordion({ title, children, defaultOpen }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen ?? false);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-white/[0.03]">
      <button
        onClick={() => setOpen((o) => !o)}
        className="focus-ring flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-medium text-kyber-white">{title}</span>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-kyber-gray transition-transform duration-300", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="px-5 pb-4 text-sm leading-relaxed text-kyber-gray">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------- Tooltip ---------------- */

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className="pointer-events-none absolute -top-9 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-kyber-elevated px-2.5 py-1 text-xs text-kyber-soft opacity-0 shadow-card transition-all duration-200 group-hover/tt:-top-10 group-hover/tt:opacity-100">
        {content}
      </span>
    </span>
  );
}

/* ---------------- Progress ---------------- */

export function Progress({ value, className, tone = "green" }: { value: number; className?: string; tone?: "green" | "yellow" | "red" }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clamped}%` }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "h-full rounded-full",
          tone === "green" && "bg-gradient-green",
          tone === "yellow" && "bg-amber-400",
          tone === "red" && "bg-red-500"
        )}
      />
    </div>
  );
}

/* ---------------- Stepper ---------------- */

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="flex w-full items-center gap-2">
      {steps.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step} className="flex flex-1 flex-col items-center gap-2">
            <div className="flex w-full items-center">
              <div className={cn("h-0.5 flex-1", i === 0 ? "bg-transparent" : done || active ? "bg-kyber-green/60" : "bg-white/10")} />
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition-all duration-300",
                  done && "border-kyber-green bg-kyber-green text-kyber-black",
                  active && "border-kyber-green bg-kyber-green/15 text-kyber-green shadow-glow-sm",
                  !done && !active && "border-white/15 text-kyber-dim"
                )}
              >
                {i + 1}
              </span>
              <div className={cn("h-0.5 flex-1", i === steps.length - 1 ? "bg-transparent" : done ? "bg-kyber-green/60" : "bg-white/10")} />
            </div>
            <span className={cn("hidden text-center text-[11px] leading-tight sm:block", active ? "text-kyber-soft" : "text-kyber-dim")}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* ---------------- Skeleton ---------------- */

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} />;
}

/* ---------------- EmptyState ---------------- */

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-kyber-green/10 text-kyber-green shadow-glow-sm">
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-kyber-white">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-kyber-gray">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}

/* ---------------- Switch ---------------- */

export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <label className={cn("inline-flex cursor-pointer select-none items-center gap-3", disabled && "cursor-not-allowed opacity-50")}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          // inline-flex + px posiciona o círculo por layout (não por static position),
          // garantindo que o thumb nunca escape da trilha do switch.
          "focus-ring relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors duration-300",
          checked ? "bg-kyber-green" : "bg-white/15"
        )}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className="block h-5 w-5 shrink-0 rounded-full bg-white shadow"
        />
      </button>
      {label && <span className="text-sm text-kyber-soft">{label}</span>}
    </label>
  );
}

/* ---------------- Avatar ---------------- */

export function Avatar({ name, className, src }: { name: string; className?: string; src?: string | null }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className={cn("h-9 w-9 rounded-full object-cover", className)} />
  ) : (
    <span
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-gradient-green text-xs font-bold text-kyber-black",
        className
      )}
    >
      {initials(name)}
    </span>
  );
}

/* ---------------- MetricCard ---------------- */

export function MetricCard({
  label,
  value,
  delta,
  icon,
  footer,
}: {
  label: string;
  value: React.ReactNode;
  delta?: number;
  icon?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="glass-card p-5 transition-shadow duration-300 hover:shadow-card-hover"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-kyber-gray">{label}</p>
        {icon && <span className="rounded-lg bg-kyber-green/10 p-2 text-kyber-green">{icon}</span>}
      </div>
      <p className="mt-2 font-display text-3xl font-bold tracking-tight text-kyber-white">{value}</p>
      {delta !== undefined && (
        <p className={cn("mt-1 text-xs font-medium", delta >= 0 ? "text-kyber-green" : "text-red-400")}>
          {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% vs. mês anterior
        </p>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </motion.div>
  );
}

/* ---------------- Dropdown ---------------- */

export function Dropdown({
  trigger,
  children,
  align = "right",
  className,
}: {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-border bg-kyber-elevated p-1.5 shadow-card",
              align === "right" ? "right-0" : "left-0",
              className
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DropdownItem({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "focus-ring flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-kyber-soft transition-colors hover:bg-white/5",
        className
      )}
      {...props}
    />
  );
}
