"use client";

/**
 * Layout split-screen das telas de autenticação:
 * visual animado + prova social à esquerda, formulário à direita.
 */

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { KyberLogo } from "@/components/layout/sidebar";
import { ChatSimulation, DEFAULT_CHAT_SCRIPT } from "@/components/chat-simulation";
import { Avatar } from "@/components/ui/misc";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <div className="flex min-h-dvh bg-kyber-black">
      {/* Lado visual (desktop) */}
      <div className="relative hidden w-1/2 overflow-hidden border-r border-border bg-gradient-hero lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_30%_20%,black,transparent)]" />
        <div className="glow-orb left-[-10%] top-[10%] h-[400px] w-[400px]" />
        <div className="glow-orb bottom-[-10%] right-[-5%] h-[300px] w-[300px] opacity-60" />

        <div className="relative">
          <KyberLogo />
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-10 max-w-md font-display text-3xl font-bold leading-tight text-kyber-white"
          >
            {t("common.tagline")}
          </motion.h2>
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-6 space-y-3"
          >
            {["auth.benefit1", "auth.benefit2", "auth.benefit3"].map((key) => (
              <li key={key} className="flex items-center gap-2.5 text-sm text-kyber-gray">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-kyber-green" />
                {t(key)}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <ChatSimulation messages={DEFAULT_CHAT_SCRIPT} speed={1800} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="relative"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-kyber-dim">
            {t("auth.socialProofTitle")}
          </p>
          <div className="mt-3 flex items-center gap-4">
            <div className="flex -space-x-2.5">
              {["Ana Souza", "Bruno Lima", "Carla Dias", "Davi Melo", "Elisa Reis"].map((name) => (
                <Avatar key={name} name={name} className="h-8 w-8 border-2 border-kyber-black text-[10px]" />
              ))}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-kyber-gray">
              <ShieldCheck className="h-4 w-4 text-kyber-green" />
              {t("auth.trustSecurity")}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Lado do formulário */}
      <div className="relative flex w-full flex-col items-center justify-center px-4 py-10 lg:w-1/2">
        <div className="glow-orb right-[10%] top-[5%] h-[240px] w-[240px] opacity-40 lg:hidden" />
        <div className="mb-8 lg:hidden">
          <KyberLogo />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
        <p className="mt-8 flex items-center gap-2 text-xs text-kyber-dim">
          <Sparkles className="h-3.5 w-3.5 text-kyber-green" />
          {t("auth.trustCancel")} · {t("auth.trustSupport")}
        </p>
      </div>
    </div>
  );
}
