"use client";

/** Gráfico de área "orçamentos × fechados" — usado no dashboard. */

import React from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, ChartTooltip } from "./chart-tooltip";

export interface QuotesAreaPoint {
  month: string;
  orcamentos: number;
  fechados: number;
}

export function QuotesAreaChart({
  data,
  labels,
  height = 280,
}: {
  data: QuotesAreaPoint[];
  /** Rótulos traduzidos por dataKey (ex.: { orcamentos: "Orçamentos", fechados: "Fechados" }). */
  labels: Record<string, string>;
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <defs>
            <linearGradient id="kg-area-quotes" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.28} />
              <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="kg-area-closed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.deep} stopOpacity={0.22} />
              <stop offset="100%" stopColor={CHART_COLORS.deep} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeWidth={1} vertical={false} />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            dy={6}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: CHART_COLORS.axis, fontSize: 12 }}
            allowDecimals={false}
          />
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
            content={<ChartTooltip nameFormatter={(key) => labels[key] ?? key} />}
          />
          <Area
            type="monotone"
            dataKey="orcamentos"
            stroke={CHART_COLORS.green}
            strokeWidth={2}
            fill="url(#kg-area-quotes)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#0B0F0C" }}
          />
          <Area
            type="monotone"
            dataKey="fechados"
            stroke={CHART_COLORS.deep}
            strokeWidth={2}
            fill="url(#kg-area-closed)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2, stroke: "#0B0F0C" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
