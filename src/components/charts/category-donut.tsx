"use client";

/** Donut de distribuição por categoria — rampa verde + legenda com percentuais. */

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ChartTooltip, DONUT_COLORS } from "./chart-tooltip";

export interface DonutSlice {
  name: string;
  value: number;
}

export function CategoryDonut({ data, height = 200 }: { data: DonutSlice[]; height?: number }) {
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:justify-center">
      <div style={{ height, width: height }} className="relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={
                <ChartTooltip
                  valueFormatter={(value) => `${Math.round((value / total) * 100)}%`}
                />
              }
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="66%"
              outerRadius="96%"
              paddingAngle={2}
              stroke="#0B0F0C"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
            >
              {data.map((slice, i) => (
                <Cell key={slice.name} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda com valores — identidade nunca depende só da cor */}
      <ul className="w-full max-w-[220px] space-y-2.5">
        {data.map((slice, i) => (
          <li key={slice.name} className="flex items-center gap-2.5">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[4px]"
              style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
            />
            <span className="flex-1 truncate text-sm text-kyber-gray">{slice.name}</span>
            <span className="text-sm font-semibold tabular-nums text-kyber-white">
              {Math.round((slice.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
