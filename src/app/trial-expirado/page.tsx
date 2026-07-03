"use client";

/** Trial expirado — página focada em conversão: conquistas do trial + grade de planos. */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock3, FileText, Hourglass, ShieldCheck, UsersRound } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { KyberLogo } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnimatedCounter, Reveal, StaggerContainer, staggerItem } from "@/components/motion";
import { MOCK_COMPANY, MOCK_PLANS } from "@/lib/mock/data";
import { cn, formatCurrency } from "@/lib/utils";

/** Conquistas do período de teste (métricas mock). */
const TRIAL_STATS = [
  { key: "statQuotes", value: 18, suffix: "", icon: <FileText className="h-5 w-5" /> },
  { key: "statLeads", value: 27, suffix: "", icon: <UsersRound className="h-5 w-5" /> },
  { key: "statHours", value: 12, suffix: "h", icon: <Clock3 className="h-5 w-5" /> },
];

export default function TrialExpiredPage() {
  const { t } = useI18n();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-kyber-black bg-gradient-hero">
      {/* Fundo decorativo */}
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      <div className="glow-orb left-[-10%] top-[-8%] h-[420px] w-[420px]" />
      <div className="glow-orb bottom-[-14%] right-[-8%] h-[360px] w-[360px] opacity-60" />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <KyberLogo />
        <Badge tone="yellow" dot>
          <Hourglass className="h-3 w-3" />
          {t("states.trialBadge")}
        </Badge>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6">
        {/* Hero persuasivo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl pt-8 text-center sm:pt-12"
        >
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-kyber-white sm:text-4xl">
            {t("states.trialTitle")}
          </h1>
          <p className="mt-4 text-sm text-kyber-gray sm:text-base">
            {t("states.trialSubtitle", { company: MOCK_COMPANY.name })}
          </p>
        </motion.div>

        {/* Conquistas do trial */}
        <StaggerContainer className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
          {TRIAL_STATS.map((stat) => (
            <motion.div key={stat.key} variants={staggerItem} className="glass-card p-6 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green">
                {stat.icon}
              </span>
              <p className="mt-3 font-display text-4xl font-bold tracking-tight text-kyber-white">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-1 text-xs text-kyber-gray">{t(`states.${stat.key}`)}</p>
            </motion.div>
          ))}
        </StaggerContainer>

        {/* Planos */}
        <Reveal className="mt-16 text-center">
          <h2 className="font-display text-2xl font-bold tracking-tight text-kyber-white sm:text-3xl">
            {t("states.plansTitle")}
          </h2>
          <p className="mt-2 text-sm text-kyber-gray">{t("states.plansSubtitle")}</p>
        </Reveal>

        <StaggerContainer className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {MOCK_PLANS.map((plan) => {
            const isEnterprise = plan.slug === "enterprise";
            return (
              <motion.div
                key={plan.id}
                variants={staggerItem}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-6",
                  plan.highlight
                    ? "border-kyber-green/50 bg-kyber-green/[0.06] shadow-glow"
                    : "glass-card border-border"
                )}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge tone="neon">{t("states.planPopular")}</Badge>
                  </span>
                )}
                <p className="font-display text-lg font-semibold text-kyber-white">{plan.name}</p>
                <p className="mt-3 font-display text-3xl font-bold tracking-tight text-kyber-white">
                  {isEnterprise ? (
                    <span className="text-gradient">{t("states.planCustomPrice")}</span>
                  ) : (
                    <>
                      <span className={plan.highlight ? "text-kyber-green" : undefined}>
                        {formatCurrency(plan.monthlyPrice)}
                      </span>
                      <span className="text-sm font-normal text-kyber-dim">{t("common.perMonth")}</span>
                    </>
                  )}
                </p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs leading-relaxed text-kyber-gray">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kyber-green" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link href="/app/assinatura" className="mt-6">
                  <Button
                    variant={plan.highlight ? "glow" : "secondary"}
                    size="lg"
                    className="w-full"
                  >
                    {isEnterprise ? t("states.planCtaEnterprise") : t("states.planCta")}
                    {!isEnterprise && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </StaggerContainer>

        {/* Garantia */}
        <Reveal className="mx-auto mt-10 max-w-3xl">
          <div className="flex flex-col items-start gap-3 rounded-2xl border border-kyber-green/25 bg-kyber-green/5 p-5 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kyber-green/15 text-kyber-green">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-kyber-white">{t("states.guaranteeTitle")}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-kyber-gray">
                {t("states.guaranteeDescription")} {t("states.keepData")}
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-kyber-dim">
            <a href="mailto:vendas@kybergo.com.br" className="transition-colors hover:text-kyber-green">
              {t("states.trialSupport")}
            </a>
          </p>
        </Reveal>
      </main>
    </div>
  );
}
