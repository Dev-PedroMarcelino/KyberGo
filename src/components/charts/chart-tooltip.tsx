"use client";

/**
 * Primitivas compartilhadas dos gráficos (recharts):
 * paleta da marca, tooltip dark customizado e legenda com chaves de linha.
 */

import React from "react";
import { cn } from "@/lib/utils";

/** Cores oficiais dos gráficos — sempre passadas via props aos componentes recharts. */
export const CHART_COLORS = {
  green: "#00E676",
  deep: "#00A85A",
  neon: "#39FF88",
  grid: "rgba(255,255,255,0.1)",
  axis: "#6B746E",
} as const;

/** Rampa verde monotônica (claro → escuro) para o donut de categorias. */
export const DONUT_COLORS = ["#39FF88", "#00E676", "#00A85A", "#0E6B3C"] as const;

interface TooltipEntry {
  name?: string | number;
  value?: number | string;
  color?: string;
  stroke?: string;
  fill?: string;
  dataKey?: string | number;
}

export interface ChartTooltipProps {
  active?: boolean;
  label?: string | number;
  payload?: TooltipEntry[];
  /** Formata o valor exibido (ex.: moeda). Recebe o valor numérico e o dataKey. */
  valueFormatter?: (value: number, dataKey: string) => string;
  /** Traduz o dataKey da série para um rótulo legível. */
  nameFormatter?: (dataKey: string) => string;
}

/** Tooltip dark padrão dos gráficos — valores em destaque, rótulos secundários. */
export function ChartTooltip({ active, label, payload, valueFormatter, nameFormatter }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-kyber-elevated px-3.5 py-2.5 shadow-card">
      {label !== undefined && label !== "" && (
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wider text-kyber-dim">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry, i) => {
          const key = String(entry.dataKey ?? entry.name ?? i);
          const raw = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
          const color = entry.color ?? entry.stroke ?? entry.fill ?? CHART_COLORS.green;
          return (
            <div key={`${key}-${i}`} className="flex items-center gap-2.5">
              <span className="h-0.5 w-3 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm font-semibold text-kyber-white">
                {valueFormatter ? valueFormatter(raw, key) : raw.toLocaleString("pt-BR")}
              </span>
              <span className="text-xs text-kyber-gray">
                {nameFormatter ? nameFormatter(key) : String(entry.name ?? key)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface LegendItem {
  label: string;
  color: string;
  /** "line" desenha um traço (séries de linha), "rect" um retângulo (barras/áreas). */
  shape?: "line" | "rect";
}

/** Legenda compacta — identidade pela marca colorida ao lado do texto, nunca no texto. */
export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-4 gap-y-1.5", className)}>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5 text-xs text-kyber-gray">
          {item.shape === "line" ? (
            <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: item.color }} />
          ) : (
            <span className="h-2.5 w-2.5 rounded-[4px]" style={{ backgroundColor: item.color }} />
          )}
          {item.label}
        </span>
      ))}
    </div>
  );
}
