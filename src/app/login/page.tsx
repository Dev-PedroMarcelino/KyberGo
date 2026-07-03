"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sleep } from "@/lib/utils";

export default function LoginPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = t("auth.errors_invalidEmail");
    if (!password) next.password = t("auth.errors_requiredField");
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    // Em produção: supabase.auth.signInWithPassword({ email, password })
    await sleep(1100);
    toast("success", t("auth.successLogin"));
    router.push("/app");
  };

  return (
    <AuthShell>
      <h1 className="font-display text-3xl font-bold tracking-tight text-kyber-white">
        {t("auth.welcomeBack")}
      </h1>
      <p className="mt-2 text-sm text-kyber-gray">{t("auth.loginSubtitle")}</p>

      <form onSubmit={submit} className="mt-8 space-y-5" noValidate>
        <Input
          type="email"
          label={t("auth.email")}
          placeholder={t("auth.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          icon={<Mail className="h-4 w-4" />}
          autoComplete="email"
        />
        <div>
          <Input
            type={showPassword ? "text" : "password"}
            label={t("auth.password")}
            placeholder={t("auth.passwordPlaceholder")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={<Lock className="h-4 w-4" />}
            autoComplete="current-password"
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:text-kyber-soft"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            }
          />
          <div className="mt-2 text-right">
            <Link href="/recuperar-senha" className="text-xs text-kyber-green hover:underline">
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? t("auth.signingIn") : t("auth.signIn")}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-kyber-gray">
        {t("auth.noAccount")}{" "}
        <Link href="/cadastro" className="font-medium text-kyber-green hover:underline">
          {t("auth.createAccount")}
        </Link>
      </p>
    </AuthShell>
  );
}
