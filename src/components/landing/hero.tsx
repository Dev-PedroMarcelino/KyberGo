"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, FileCheck2, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { AnimatedCounter } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { ChatSimulation, DEFAULT_CHAT_SCRIPT } from "@/components/chat-simulation";
import { LANDING_CONTENT } from "./content";

/** Título com revelação palavra a palavra. */
function AnimatedTitle({ line1, highlight, line2 }: { line1: string; highlight: string; line2: string }) {
  const words = [...line1.split(" ").map((w) => ({ w, hl: false })), { w: highlight, hl: true }];
  return (
    <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-kyber-white sm:text-5xl lg:text-6xl">
      <span className="flex flex-wrap gap-x-3">
        {words.map((word, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className={word.hl ? "text-gradient-animated drop-shadow-[0_0_24px_rgba(0,230,118,0.35)]" : undefined}
          >
            {word.w}
          </motion.span>
        ))}
      </span>
      <motion.span
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, delay: 0.15 + words.length * 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="block"
      >
        {line2}
      </motion.span>
    </h1>
  );
}

export function Hero() {
  const { locale, t } = useI18n();
  const content = LANDING_CONTENT[locale].hero;

  return (
    <section className="relative overflow-hidden bg-gradient-hero pb-20 pt-32 lg:pb-28 lg:pt-40">
      {/* Fundo decorativo */}
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      <div className="glow-orb left-[10%] top-[-10%] h-[420px] w-[420px]" />
      <div className="glow-orb right-[-5%] top-[30%] h-[360px] w-[360px] opacity-60" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 lg:grid-cols-2 lg:gap-10 lg:px-8">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-kyber-mint"
          >
            <Sparkles className="h-3.5 w-3.5 text-kyber-neon" />
            {content.badge}
          </motion.span>

          <div className="mt-6">
            <AnimatedTitle line1={content.titleLine1} highlight={content.titleHighlight} line2={content.titleLine2} />
          </div>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-kyber-gray sm:text-lg"
          >
            {content.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/cadastro">
              <Button variant="glow" size="xl" className="w-full sm:w-auto">
                {content.ctaPrimary}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#demo">
              <Button variant="secondary" size="xl" className="w-full sm:w-auto">
                <Play className="h-4 w-4 text-kyber-green" />
                {content.ctaSecondary}
              </Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-10 grid max-w-lg grid-cols-3 gap-6"
          >
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-2xl font-bold text-kyber-white sm:text-3xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-1 text-xs leading-snug text-kyber-dim">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Simulação de chat + cartão flutuante de PDF */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md"
        >
          <ChatSimulation messages={DEFAULT_CHAT_SCRIPT} />

          {/* Cartão flutuante: PDF gerado */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="glass-card absolute -bottom-8 -left-4 flex items-center gap-3 !rounded-xl px-4 py-3 shadow-glow-sm sm:-left-12"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-kyber-green/15 text-kyber-green">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-kyber-white">Orcamento-ORC-2026-0148.pdf</p>
              <p className="text-[11px] text-kyber-green">{t("landing.pdfGeneratedIn", { seconds: "12" })}</p>
            </div>
          </motion.div>

          {/* Cartão flutuante: lead criado */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="glass-card absolute -right-3 -top-6 flex items-center gap-2.5 !rounded-xl px-4 py-2.5 sm:-right-8"
          >
            <ShieldCheck className="h-4 w-4 text-kyber-neon" />
            <p className="text-[11px] font-medium text-kyber-soft">{t("landing.leadCreatedCrm")}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
