"use client";

/**
 * Funil de conversão em barras horizontais animadas.
 * No modo detalhado (relatórios) mostra também a queda percentual entre etapas.
 */

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FunnelStage {
  stage: string;
  value: number;
}

export function FunnelBars({
  stages,
  detailed = false,
  dropLabel,
  className,
}: {
  stages: FunnelStage[];
  /** Exibe a queda % entre etapas (usado nos relatórios). */
  detailed?: boolean;
  /** Texto do rótulo de queda, com {{pct}} já interpolado pelo chamador. */
  dropLabel?: (pct: number) => string;
  className?: string;
}) {
  const max = stages.length > 0 ? stages[0].value : 0;

  return (
    <div className={cn("space-y-1", className)}>
      {stages.map((stage, i) => {
        const pct = max > 0 ? Math.round((stage.value / max) * 100) : 0;
        const prev = i > 0 ? stages[i - 1].value : null;
        const drop = prev && prev > 0 ? Math.round(((prev - stage.value) / prev) * 100) : 0;

        return (
          <React.Fragment key={stage.stage}>
            {detailed && i > 0 && drop > 0 && (
              <div className="flex items-center gap-1.5 py-0.5 pl-1 text-[11px] text-kyber-dim">
                <ArrowDown className="h-3 w-3 text-red-400/70" />
                {dropLabel ? dropLabel(drop) : `-${drop}%`}
              </div>
            )}
            <div className="py-1.5">
              <div className="mb-1.5 flex items-baseline justify-between gap-3">
                <span className="truncate text-sm text-kyber-gray">{stage.stage}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums text-kyber-white">
                  {stage.value.toLocaleString("pt-BR")}
                  <span className="ml-1.5 text-xs font-medium text-kyber-dim">{pct}%</span>
                </span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${pct}%` }}
                  viewport={{ once: true, margin: "-20px" }}
                  transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full rounded-full bg-gradient-green"
                  style={{ opacity: 1 - i * 0.12 }}
                />
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
