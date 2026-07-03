"use client";

/** Sparkline de área compacto — usado em cards de desempenho. */

import React from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS, ChartTooltip } from "./chart-tooltip";

export interface MiniPoint {
  label: string;
  value: number;
}

export function MiniAreaChart({
  data,
  height = 56,
  seriesLabel,
}: {
  data: MiniPoint[];
  height?: number;
  seriesLabel: string;
}) {
  // Id estável por instância (SSR-safe) para o gradiente não colidir entre sparklines
  const gradientId = `kg-mini-${React.useId().replace(/[^a-zA-Z0-9]/g, "")}`;

  return (
    <div style={{ height }} className="w-full min-w-0 overflow-hidden">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.green} stopOpacity={0.3} />
              <stop offset="100%" stopColor={CHART_COLORS.green} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
            content={<ChartTooltip nameFormatter={() => seriesLabel} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.green}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 3.5, strokeWidth: 2, stroke: "#0B0F0C" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
