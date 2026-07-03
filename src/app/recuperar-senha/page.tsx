"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, MailCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sleep } from "@/lib/utils";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("auth.errors_invalidEmail"));
      return;
    }
    setError(undefined);
    setLoading(true);
    // Em produção: supabase.auth.resetPasswordForEmail(email)
    await sleep(1100);
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell>
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.1 }}
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-kyber-green/15 text-kyber-green shadow-glow-sm"
          >
            <MailCheck className="h-8 w-8" />
          </motion.span>
          <h1 className="mt-6 font-display text-2xl font-bold text-kyber-white">{t("auth.recoverySent")}</h1>
          <p className="mt-3 text-sm leading-relaxed text-kyber-gray">
            {t("auth.recoverySentDescription", { email })}
          </p>
          <Link href="/login" className="mt-8 inline-block">
            <Button variant="secondary" size="lg">
              <ArrowLeft className="h-4 w-4" />
              {t("auth.backToLogin")}
            </Button>
          </Link>
        </motion.div>
      ) : (
        <>
          <h1 className="font-display text-3xl font-bold tracking-tight text-kyber-white">
            {t("auth.recoverTitle")}
          </h1>
          <p className="mt-2 text-sm text-kyber-gray">{t("auth.recoverSubtitle")}</p>

          <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
            <Input
              type="email"
              label={t("auth.email")}
              placeholder={t("auth.emailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              icon={<Mail className="h-4 w-4" />}
              autoComplete="email"
            />
            <Button type="submit" size="lg" className="w-full" loading={loading}>
              {loading ? t("auth.sending") : t("auth.sendRecoveryLink")}
            </Button>
          </form>

          <Link
            href="/login"
            className="mt-8 flex items-center justify-center gap-1.5 text-sm text-kyber-green hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("auth.backToLogin")}
          </Link>
        </>
      )}
    </AuthShell>
  );
}
