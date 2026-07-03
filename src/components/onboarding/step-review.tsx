"use client";

/** Etapa 8 — Revisão final: checklist animado, porcentagem de conclusão e ativação. */

import React from "react";
import { motion } from "framer-motion";
import { Check, Clock4, Rocket } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/misc";
import { AnimatedCounter } from "@/components/motion";
import { cn } from "@/lib/utils";
import { StepHeader, buildPdfStyleLabels, buildSegmentOptions } from "./shared";
import type { OnboardingData } from "./types";

interface ReviewItem {
  key: string;
  label: string;
  detail: string;
  done: boolean;
}

export function StepReview({
  data,
  skipped,
  onActivate,
  activating,
}: {
  data: OnboardingData;
  skipped: Record<number, boolean>;
  onActivate: () => void;
  activating: boolean;
}) {
  const { t } = useI18n();

  const segmentLabel =
    buildSegmentOptions(t).find((option) => option.value === data.segment)?.label ?? data.segment;
  const styleLabel = buildPdfStyleLabels(t)[data.pdfStyle] ?? data.pdfStyle;
  const modeLabel =
    data.quoteMode === "intelligent"
      ? t("onboarding.modeSmartTitle")
      : data.quoteMode === "simple"
        ? t("onboarding.modeSimpleTitle")
        : t("onboarding.modeBothTitle");

  const identityDone = Boolean(data.companyName.trim() && data.segment && data.phone.trim());
  const criteriaDone = !skipped[3] && Boolean(data.quoteTypeName.trim()) && data.criteria.length > 0;

  const items: ReviewItem[] = [
    {
      key: "identity",
      label: t("onboarding.checkIdentity"),
      done: identityDone,
      detail: identityDone ? `${data.companyName} · ${segmentLabel}` : t("onboarding.reviewPendingHint"),
    },
    {
      key: "whatsapp",
      label: t("onboarding.checkWhatsapp"),
      done: data.whatsappStatus === "connected",
      detail:
        data.whatsappStatus === "connected"
          ? t("onboarding.reviewWaConnected")
          : t("onboarding.reviewWaPending"),
    },
    {
      key: "mode",
      label: t("onboarding.checkMode"),
      done: true,
      detail: modeLabel,
    },
    {
      key: "criteria",
      label: t("onboarding.checkCriteria"),
      done: criteriaDone,
      detail: criteriaDone
        ? t("onboarding.reviewCriteria", { count: data.criteria.length, name: data.quoteTypeName })
        : t("onboarding.reviewPendingHint"),
    },
    {
      key: "pdf",
      label: t("onboarding.checkPdf"),
      done: !skipped[4],
      detail: !skipped[4] ? t("onboarding.reviewPdf", { style: styleLabel }) : t("onboarding.reviewPendingHint"),
    },
    {
      key: "pipeline",
      label: t("onboarding.checkPipeline"),
      done: !skipped[5] && data.stages.length >= 2,
      detail:
        !skipped[5] && data.stages.length >= 2
          ? t("onboarding.reviewPipeline", { count: data.stages.length })
          : t("onboarding.reviewPendingHint"),
    },
    {
      key: "automations",
      label: t("onboarding.checkAutomations"),
      done: !skipped[6],
      detail: skipped[6]
        ? t("onboarding.reviewPendingHint")
        : data.autoMessages
          ? t("onboarding.reviewAutomations", { interval: data.maintenanceInterval })
          : t("onboarding.reviewAutomationsOff"),
    },
  ];

  const doneCount = items.filter((item) => item.done).length;
  const percent = Math.round((doneCount / items.length) * 100);

  return (
    <div>
      <StepHeader title={t("onboarding.reviewTitle")} subtitle={t("onboarding.reviewSubtitle")} />

      {/* Porcentagem de conclusão */}
      <div className="rounded-xl border border-border bg-white/[0.03] p-5">
        <div className="flex items-end justify-between gap-4">
          <p className="text-sm font-medium text-kyber-soft">{t("onboarding.completionLabel")}</p>
          <p className="font-display text-3xl font-bold text-kyber-green">
            <AnimatedCounter value={percent} suffix="%" />
          </p>
        </div>
        <Progress value={percent} className="mt-3" />
        {percent < 100 && <p className="mt-3 text-xs text-kyber-dim">{t("onboarding.reviewIncompleteHint")}</p>}
      </div>

      {/* Checklist animado */}
      <motion.ul
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="mt-5 space-y-2.5"
      >
        {items.map((item) => (
          <motion.li
            key={item.key}
            variants={{
              hidden: { opacity: 0, x: -16 },
              visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
            }}
            className={cn(
              "flex items-center gap-3.5 rounded-xl border p-4",
              item.done ? "border-kyber-green/25 bg-kyber-green/[0.06]" : "border-border bg-white/[0.02]"
            )}
          >
            {item.done ? (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 20, delay: 0.15 }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-kyber-green shadow-glow-sm"
              >
                <Check className="h-4 w-4 text-kyber-black" />
              </motion.span>
            ) : (
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10">
                <Clock4 className="h-3.5 w-3.5 text-amber-300" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-kyber-white">{item.label}</p>
              <p className="mt-0.5 truncate text-xs text-kyber-gray">{item.detail}</p>
            </div>
          </motion.li>
        ))}
      </motion.ul>

      {/* Ativação */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8"
      >
        <Button variant="glow" size="xl" onClick={onActivate} loading={activating} className="w-full">
          {!activating && <Rocket className="h-5 w-5" />}
          {activating ? t("onboarding.activating") : t("onboarding.activate")}
        </Button>
      </motion.div>
    </div>
  );
}
