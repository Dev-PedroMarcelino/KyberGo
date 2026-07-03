"use client";

/** Etapa 3 — Modo de orçamento: três cartões selecionáveis. */

import React from "react";
import { Check, Layers, PencilRuler, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { StepHeader } from "./shared";
import type { OnboardingQuoteMode, StepProps } from "./types";

export function StepMode({ data, update }: StepProps) {
  const { t } = useI18n();

  const modes: Array<{
    value: OnboardingQuoteMode;
    icon: React.ReactNode;
    title: string;
    description: string;
    recommended?: boolean;
  }> = [
    {
      value: "intelligent",
      icon: <Sparkles className="h-5 w-5" />,
      title: t("onboarding.modeSmartTitle"),
      description: t("onboarding.modeSmartDescription"),
    },
    {
      value: "simple",
      icon: <PencilRuler className="h-5 w-5" />,
      title: t("onboarding.modeSimpleTitle"),
      description: t("onboarding.modeSimpleDescription"),
    },
    {
      value: "both",
      icon: <Layers className="h-5 w-5" />,
      title: t("onboarding.modeBothTitle"),
      description: t("onboarding.modeBothDescription"),
      recommended: true,
    },
  ];

  return (
    <div>
      <StepHeader title={t("onboarding.modeTitle")} subtitle={t("onboarding.modeSubtitle")} />

      <div className="grid gap-4 sm:grid-cols-3">
        {modes.map((mode) => {
          const selected = data.quoteMode === mode.value;
          return (
            <button
              key={mode.value}
              type="button"
              onClick={() => update({ quoteMode: mode.value })}
              className={cn(
                "focus-ring relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-200",
                selected
                  ? "border-kyber-green/60 bg-kyber-green/10 shadow-glow-sm"
                  : "border-border bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.05]"
              )}
            >
              {selected && (
                <span className="absolute right-4 top-4 flex h-5 w-5 items-center justify-center rounded-full bg-kyber-green">
                  <Check className="h-3 w-3 text-kyber-black" />
                </span>
              )}
              <span
                className={cn(
                  "flex h-11 w-11 items-center justify-center rounded-xl transition-colors",
                  selected ? "bg-kyber-green text-kyber-black shadow-glow-sm" : "bg-kyber-green/10 text-kyber-green"
                )}
              >
                {mode.icon}
              </span>
              <span className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-display text-base font-semibold text-kyber-white">{mode.title}</span>
                {mode.recommended && <Badge tone="green">{t("onboarding.modeRecommended")}</Badge>}
              </span>
              <span className="mt-2 text-xs leading-relaxed text-kyber-gray">{mode.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
