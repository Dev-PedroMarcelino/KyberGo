"use client";

/** Estado de conta bloqueada — assinatura suspensa por falta de pagamento. */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Database, Download, LifeBuoy, Lock, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { KyberLogo } from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function BlockedPage() {
  const { t } = useI18n();

  const safeItems = [
    { key: "blockedSafe1", icon: <Database className="h-4 w-4" /> },
    { key: "blockedSafe2", icon: <Download className="h-4 w-4" /> },
    { key: "blockedSafe3", icon: <Zap className="h-4 w-4" /> },
  ];

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-kyber-black bg-gradient-hero">
      {/* Fundo decorativo com glow vermelho suave */}
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_10%,black,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-[38%] h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />
      <div className="glow-orb bottom-[-12%] right-[-10%] h-[320px] w-[320px] opacity-40" />

      <header className="relative z-10 mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-5 sm:px-6">
        <KyberLogo />
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pb-16 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card w-full max-w-lg p-6 text-center sm:p-10"
        >
          {/* Ícone de cadeado com glow vermelho */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-red-500/25 bg-red-500/10 shadow-[0_0_50px_-8px_rgba(239,68,68,0.45)]"
          >
            <Lock className="h-9 w-9 text-red-400" />
          </motion.div>

          <div className="mt-6 flex justify-center">
            <Badge tone="red" dot>{t("states.blockedBadge")}</Badge>
          </div>

          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-kyber-white sm:text-3xl">
            {t("states.blockedTitle")}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-kyber-gray">{t("states.blockedDescription")}</p>

          {/* O que continua seguro */}
          <div className="mt-7 rounded-xl border border-border bg-white/[0.03] p-5 text-left">
            <p className="text-xs font-semibold uppercase tracking-wider text-kyber-dim">
              {t("states.blockedSafeTitle")}
            </p>
            <ul className="mt-3.5 space-y-3">
              {safeItems.map((item) => (
                <li key={item.key} className="flex items-start gap-3 text-sm text-kyber-gray">
                  <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-kyber-green/10 text-kyber-green">
                    {item.icon}
                  </span>
                  {t(`states.${item.key}`)}
                </li>
              ))}
            </ul>
          </div>

          {/* CTAs */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/app/assinatura" className="flex-1">
              <Button variant="glow" size="lg" className="w-full">
                {t("states.blockedCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="mailto:suporte@kybergo.com.br" className="flex-1">
              <Button variant="secondary" size="lg" className="w-full">
                <LifeBuoy className="h-4 w-4" />
                {t("states.blockedSupport")}
              </Button>
            </a>
          </div>

          <p className="mt-6 text-xs text-kyber-dim">{t("states.blockedFooter")}</p>
        </motion.div>
      </main>
    </div>
  );
}
