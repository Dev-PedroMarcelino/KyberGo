"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_LABELS } from "@/lib/i18n/locales";
import { useToast } from "@/components/ui/toast";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Stepper, Switch } from "@/components/ui/misc";
import { MOCK_PLANS } from "@/lib/mock/data";
import { cn, formatCurrency, sleep } from "@/lib/utils";

interface FormState {
  name: string;
  email: string;
  password: string;
  companyName: string;
  segment: string;
  whatsapp: string;
  language: string;
  planId: string;
  trial: boolean;
}

export default function RegisterPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    companyName: "",
    segment: "",
    whatsapp: "",
    language: "pt-BR",
    planId: "plan_professional",
    trial: true,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const segmentOptions = [
    { value: "calhas", label: t("auth.segOptGutters") },
    { value: "ar", label: t("auth.segOptAc") },
    { value: "marcenaria", label: t("auth.segOptCarpentry") },
    { value: "gesso", label: t("auth.segOptPlaster") },
    { value: "manutencao", label: t("auth.segOptMaintenance") },
    { value: "instalacao", label: t("auth.segOptInstallation") },
    { value: "outro", label: t("auth.segOptOther") },
  ];

  const validateStep = (): boolean => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!form.name.trim()) next.name = t("auth.errors_requiredField");
      if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = t("auth.errors_invalidEmail");
      if (form.password.length < 8) next.password = t("auth.errors_passwordLength");
    }
    if (step === 1) {
      if (!form.companyName.trim()) next.companyName = t("auth.errors_requiredField");
      if (!form.segment) next.segment = t("auth.errors_requiredField");
      if (!form.whatsapp.trim()) next.whatsapp = t("auth.errors_requiredField");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep((s) => s + 1);
  };

  const submit = async () => {
    setLoading(true);
    // Em produção: supabase.auth.signUp + criação de company/subscription via route handler.
    await sleep(1300);
    toast("success", t("auth.successRegister"));
    router.push("/onboarding");
  };

  return (
    <AuthShell>
      <h1 className="font-display text-3xl font-bold tracking-tight text-kyber-white">
        {t("auth.createTitle")}
      </h1>
      <p className="mt-2 text-sm text-kyber-gray">{t("auth.createSubtitle")}</p>

      <div className="mt-7">
        <Stepper steps={[t("auth.step1"), t("auth.step2"), t("auth.step3")]} current={step} />
      </div>

      <div className="mt-7 min-h-[320px]">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <Input
                label={t("auth.fullName")}
                placeholder={t("auth.fullNamePlaceholder")}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                error={errors.name}
                icon={<User className="h-4 w-4" />}
              />
              <Input
                type="email"
                label={t("auth.email")}
                placeholder={t("auth.emailPlaceholder")}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                error={errors.email}
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                type={showPassword ? "text" : "password"}
                label={t("auth.password")}
                placeholder={t("auth.passwordPlaceholder")}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                error={errors.password}
                icon={<Lock className="h-4 w-4" />}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                    className="focus-ring rounded-lg p-1.5 text-kyber-dim hover:text-kyber-soft"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-5"
            >
              <Input
                label={t("auth.companyName")}
                placeholder={t("auth.companyNamePlaceholder")}
                value={form.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                error={errors.companyName}
                icon={<Building2 className="h-4 w-4" />}
              />
              <Select
                label={t("auth.segment")}
                placeholder={t("auth.segmentPlaceholder")}
                options={segmentOptions}
                value={form.segment}
                onChange={(e) => set("segment", e.target.value)}
                error={errors.segment}
              />
              <Input
                label={t("auth.whatsappNumber")}
                placeholder={t("auth.whatsappPlaceholder")}
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                error={errors.whatsapp}
                icon={<Phone className="h-4 w-4" />}
              />
              <Select
                label={t("auth.preferredLanguage")}
                options={LOCALES.map((loc) => ({ value: loc, label: LOCALE_LABELS[loc] }))}
                value={form.language}
                onChange={(e) => set("language", e.target.value)}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <p className="text-sm font-medium text-kyber-soft">{t("auth.desiredPlan")}</p>
              <div className="grid grid-cols-2 gap-3">
                {MOCK_PLANS.filter((p) => p.slug !== "enterprise").map((plan) => (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => set("planId", plan.id)}
                    className={cn(
                      "focus-ring relative rounded-xl border p-4 text-left transition-all duration-200",
                      form.planId === plan.id
                        ? "border-kyber-green/60 bg-kyber-green/10 shadow-glow-sm"
                        : "border-border bg-white/[0.03] hover:border-white/25"
                    )}
                  >
                    {form.planId === plan.id && (
                      <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-kyber-green">
                        <Check className="h-3 w-3 text-kyber-black" />
                      </span>
                    )}
                    <p className="text-sm font-semibold text-kyber-white">{plan.name}</p>
                    <p className="mt-1 font-display text-lg font-bold text-kyber-green">
                      {formatCurrency(plan.monthlyPrice)}
                      <span className="text-xs font-normal text-kyber-dim">{t("common.perMonth")}</span>
                    </p>
                  </button>
                ))}
              </div>
              <div className="rounded-xl border border-border bg-white/[0.03] p-4">
                <Switch
                  checked={form.trial}
                  onChange={(v) => set("trial", v)}
                  label={t("auth.startTrial")}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" size="lg" onClick={() => setStep((s) => s - 1)} className="flex-1">
            {t("common.back")}
          </Button>
        )}
        {step < 2 ? (
          <Button size="lg" onClick={nextStep} className="flex-1">
            {t("common.next")}
          </Button>
        ) : (
          <Button size="lg" onClick={submit} loading={loading} className="flex-1">
            {loading ? t("auth.registering") : t("auth.register")}
          </Button>
        )}
      </div>

      <p className="mt-8 text-center text-sm text-kyber-gray">
        {t("auth.haveAccount")}{" "}
        <Link href="/login" className="font-medium text-kyber-green hover:underline">
          {t("auth.signInLink")}
        </Link>
      </p>
    </AuthShell>
  );
}
