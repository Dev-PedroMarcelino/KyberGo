"use client";

/**
 * Crescimento da plataforma (admin): empresas e MRR são escalas diferentes,
 * então cada métrica ganha o próprio gráfico (small multiples) — nunca eixo duplo.
 */

import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { CHART_COLORS, ChartTooltip } from "./chart-tooltip";

export interface GrowthPoint {
  month: string;
  empresas: number;
  mrr: number;
}

function SingleGrowthChart({
  data,
  dataKey,
  label,
  color,
  gradientId,
  currency,
  height,
}: {
  data: GrowthPoint[];
  dataKey: "empresas" | "mrr";
  label: string;
  color: string;
  gradientId: string;
  currency?: boolean;
  height: number;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-0.5 w-3.5 rounded-full" style={{ backgroundColor: color }} />
        <p className="text-xs font-medium text-kyber-gray">{label}</p>
      </div>
      <div style={{ height }} className="w-full min-w-0 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeWidth={1} vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
              interval="preserveStartEnd"
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: CHART_COLORS.axis, fontSize: 11 }}
              tickFormatter={(value: number) => (currency ? formatCompact(value) : String(value))}
              width={currency ? 52 : 36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
              content={
                <ChartTooltip
                  nameFormatter={() => label}
                  valueFormatter={(value) => (currency ? formatCurrency(value) : value.toLocaleString("pt-BR"))}
                />
              }
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: "#0B0F0C" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function GrowthAreaChart({
  data,
  labels,
  height = 200,
}: {
  data: GrowthPoint[];
  /** Rótulos traduzidos: { empresas: "Empresas ativas", mrr: "MRR" }. */
  labels: { empresas: string; mrr: string };
  height?: number;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <SingleGrowthChart
        data={data}
        dataKey="empresas"
        label={labels.empresas}
        color={CHART_COLORS.green}
        gradientId="kg-growth-companies"
        height={height}
      />
      <SingleGrowthChart
        data={data}
        dataKey="mrr"
        label={labels.mrr}
        color={CHART_COLORS.deep}
        gradientId="kg-growth-mrr"
        currency
        height={height}
      />
    </div>
  );
}
