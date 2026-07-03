"use client";

/**
 * Wizard de onboarding pós-cadastro — 8 etapas com estado local.
 * Página pública (sem o layout do app), com header próprio e fundo hero.
 */

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, SkipForward } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { KyberLogo } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stepper } from "@/components/ui/misc";
import { sleep } from "@/lib/utils";
import { ConfettiBurst } from "@/components/onboarding/confetti";
import { StepIdentity } from "@/components/onboarding/step-identity";
import { StepWhatsapp } from "@/components/onboarding/step-whatsapp";
import { StepMode } from "@/components/onboarding/step-mode";
import { StepCriteria } from "@/components/onboarding/step-criteria";
import { StepPdf } from "@/components/onboarding/step-pdf";
import { StepPipeline } from "@/components/onboarding/step-pipeline";
import { StepAutomations } from "@/components/onboarding/step-automations";
import { StepReview } from "@/components/onboarding/step-review";
import { DEFAULT_ONBOARDING, type OnboardingData } from "@/components/onboarding/types";

const STEP_COUNT = 8;
/** Etapas que podem ser puladas (índice zero-based): WhatsApp, Critérios, PDF, Pipeline e Automações. */
const SKIPPABLE_STEPS = new Set([1, 3, 4, 5, 6]);

export default function OnboardingPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(DEFAULT_ONBOARDING);
  const [skipped, setSkipped] = useState<Record<number, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activating, setActivating] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  const update = useCallback((patch: Partial<OnboardingData>) => {
    setData((current) => ({ ...current, ...patch }));
  }, []);

  const stepLabels = Array.from({ length: STEP_COUNT }, (_, i) => t(`onboarding.stepLabel${i + 1}`));

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!data.companyName.trim()) next.companyName = t("onboarding.errorRequired");
      if (!data.segment) next.segment = t("onboarding.errorRequired");
      if (!data.phone.trim()) next.phone = t("onboarding.errorRequired");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setSkipped((current) => ({ ...current, [step]: false }));
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const skipStep = () => {
    setSkipped((current) => ({ ...current, [step]: true }));
    toast("info", t("onboarding.skipToast"), t("onboarding.skipToastDescription"));
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const activate = async () => {
    setActivating(true);
    setCelebrate(true);
    toast("success", t("onboarding.activatedToastTitle"), t("onboarding.activatedToastDescription"));
    // Em produção: persistência do onboarding + onboardingStatus="completed" na camada de serviços.
    await sleep(2200);
    router.push("/app");
  };

  return (
    <div className="relative min-h-dvh overflow-hidden bg-kyber-black bg-gradient-hero">
      {/* Fundo decorativo */}
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,black,transparent)]" />
      <div className="glow-orb left-[-12%] top-[-6%] h-[420px] w-[420px]" />
      <div className="glow-orb bottom-[-14%] right-[-8%] h-[360px] w-[360px] opacity-60" />

      {/* Barra de progresso no topo */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-green shadow-glow-sm"
          initial={false}
          animate={{ width: `${((step + 1) / STEP_COUNT) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {celebrate && <ConfettiBurst />}

      {/* Header próprio */}
      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
        <KyberLogo />
        <Badge tone="green">{t("onboarding.stepOf", { current: step + 1, total: STEP_COUNT })}</Badge>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-20 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="font-display text-2xl font-bold tracking-tight text-kyber-white sm:text-3xl">
            {t("onboarding.title")}
          </h1>
          <p className="mt-1.5 text-sm text-kyber-gray">{t("onboarding.subtitle")}</p>

          <div className="mt-7">
            <Stepper steps={stepLabels} current={step} />
          </div>
        </motion.div>

        {/* Conteúdo da etapa */}
        <div className="glass-card mt-7 p-5 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -28 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && <StepIdentity data={data} update={update} errors={errors} />}
              {step === 1 && <StepWhatsapp data={data} update={update} />}
              {step === 2 && <StepMode data={data} update={update} />}
              {step === 3 && <StepCriteria data={data} update={update} />}
              {step === 4 && <StepPdf data={data} update={update} />}
              {step === 5 && <StepPipeline data={data} update={update} />}
              {step === 6 && <StepAutomations data={data} update={update} />}
              {step === 7 && (
                <StepReview data={data} skipped={skipped} onActivate={activate} activating={activating} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navegação */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {step > 0 && (
            <Button variant="secondary" size="lg" onClick={prevStep} disabled={activating}>
              <ArrowLeft className="h-4 w-4" />
              {t("common.back")}
            </Button>
          )}
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {SKIPPABLE_STEPS.has(step) && (
              <Button variant="ghost" size="lg" onClick={skipStep}>
                <SkipForward className="h-4 w-4" />
                {t("onboarding.skipStep")}
              </Button>
            )}
            {step < STEP_COUNT - 1 && (
              <Button size="lg" onClick={nextStep}>
                {t("common.next")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-kyber-dim">{t("onboarding.footerNote")}</p>
      </main>
    </div>
  );
}
