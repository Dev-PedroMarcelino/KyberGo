"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Crown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn, formatCurrency } from "@/lib/utils";
import { MOCK_PLANS } from "@/lib/mock/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Reveal, StaggerContainer, staggerItem } from "@/components/motion";
import { LANDING_CONTENT } from "./content";

export function PricingSection() {
  const { locale, t } = useI18n();
  const content = LANDING_CONTENT[locale].pricing;
  const [annual, setAnnual] = useState(false);

  return (
    <section id="planos" className="relative overflow-hidden py-24">
      <div className="glow-orb left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-kyber-gray">{content.subtitle}</p>

          {/* Alternador mensal/anual */}
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-white/[0.03] p-1.5">
            <button
              onClick={() => setAnnual(false)}
              className={cn(
                "focus-ring relative rounded-full px-5 py-2 text-sm font-medium transition-colors",
                !annual ? "text-kyber-black" : "text-kyber-gray hover:text-kyber-soft"
              )}
            >
              {!annual && (
                <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-gradient-green" />
              )}
              <span className="relative z-10">{content.monthly}</span>
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={cn(
                "focus-ring relative flex items-center gap-2 rounded-full px-5 py-2 text-sm font-medium transition-colors",
                annual ? "text-kyber-black" : "text-kyber-gray hover:text-kyber-soft"
              )}
            >
              {annual && (
                <motion.span layoutId="billing-pill" className="absolute inset-0 rounded-full bg-gradient-green" />
              )}
              <span className="relative z-10">{content.annual}</span>
              <span
                className={cn(
                  "relative z-10 rounded-full px-2 py-0.5 text-[10px] font-bold",
                  annual ? "bg-kyber-black/20 text-kyber-black" : "bg-kyber-green/15 text-kyber-green"
                )}
              >
                {content.annualDiscount}
              </span>
            </button>
          </div>
        </Reveal>

        <StaggerContainer className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {MOCK_PLANS.map((plan) => {
            const isEnterprise = plan.slug === "enterprise";
            const price = annual ? plan.annualPrice / 12 : plan.monthlyPrice;
            return (
              <motion.div
                key={plan.id}
                variants={staggerItem}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 280, damping: 24 }}
                className={cn(
                  "relative flex flex-col rounded-2xl border p-7 backdrop-blur-xl transition-shadow duration-300",
                  plan.highlight
                    ? "border-kyber-green/50 bg-kyber-green/[0.06] shadow-glow hover:shadow-glow-lg"
                    : "border-border bg-glass hover:shadow-card-hover"
                )}
              >
                {plan.highlight && (
                  <Badge tone="neon" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Crown className="h-3 w-3" /> {t("landing.mostPopular")}
                  </Badge>
                )}
                <h3 className="font-display text-lg font-semibold text-kyber-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-1.5">
                  {isEnterprise ? (
                    <span className="font-display text-3xl font-bold text-kyber-white">
                      {t("landing.customPricing")}
                    </span>
                  ) : (
                    <>
                      <span className="font-display text-4xl font-bold tracking-tight text-kyber-white">
                        {formatCurrency(price)}
                      </span>
                      <span className="text-sm text-kyber-dim">{t("landing.perMonthShort")}</span>
                    </>
                  )}
                </div>
                {annual && !isEnterprise && (
                  <p className="mt-1 text-xs text-kyber-green">
                    {formatCurrency(plan.annualPrice)}{t("landing.perYearShort")}
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-kyber-gray">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-kyber-green" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link href="/cadastro" className="mt-7">
                  <Button variant={plan.highlight ? "primary" : "secondary"} size="lg" className="w-full">
                    {isEnterprise ? content.ctaEnterprise : content.cta}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </StaggerContainer>

        <Reveal delay={0.2}>
          <p className="mt-8 text-center text-sm text-kyber-dim">{content.trialNote}</p>
        </Reveal>
      </div>
    </section>
  );
}
