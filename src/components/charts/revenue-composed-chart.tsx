"use client";

/** Receita mensal (barras com gradiente verde) + linha de previsão — relatórios. */

import React from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCompact, formatCurrency } from "@/lib/utils";
import { CHART_COLORS, ChartTooltip } from "./chart-tooltip";

export interface RevenuePoint {
  label: string;
  receita: number;
  previsao: number;
}

export function RevenueComposedChart({
  data,
  labels,
  height = 300,
}: {
  data: RevenuePoint[];
  /** Rótulos traduzidos por dataKey (ex.: { receita: "Receita", previsao: "Previsão" }). */
  labels: Record<string, string>;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: -4, bottom: 0 }}>
          <defs>
            <linearGradient id="kg-revenue-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.9} />
              <stop offset="100%" stopColor={CHART_COLORS.deep} stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            tickFormatter={(value: number) => formatCompact(value)}
            width={52}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            content={
              <ChartTooltip
                nameFormatter={(key) => labels[key] ?? key}
                valueFormatter={(value) => formatCurrency(value)}
              />
            }
          />
          <Bar dataKey="receita" fill="url(#kg-revenue-bar)" radius={[4, 4, 0, 0]} maxBarSize={24} />
          {/* Tracejado é semântico aqui: a linha representa projeção, não medição */}
          <Line
            type="monotone"
            dataKey="previsao"
            stroke={CHART_COLORS.neon}
            strokeWidth={2}
            strokeDasharray="6 4"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#0B0F0C" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
