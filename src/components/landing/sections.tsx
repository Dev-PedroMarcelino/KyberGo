"use client";

/**
 * Seções da landing page: problema, solução, carrossel de funcionalidades,
 * demo interativa, depoimentos, FAQ, CTA final e rodapé.
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  FileText,
  Kanban,
  Languages,
  ListChecks,
  MessageCircleMore,
  PencilRuler,
  Quote as QuoteIcon,
  RefreshCcw,
  Sparkles,
  UserRoundPlus,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Accordion, Avatar } from "@/components/ui/misc";
import { Reveal, StaggerContainer, staggerItem } from "@/components/motion";
import { ChatSimulation, type ChatMessage } from "@/components/chat-simulation";
import { KyberLogo } from "@/components/layout/sidebar";
import { LANDING_CONTENT } from "./content";

/* ---------------- Problema ---------------- */

const PAIN_ICONS = [Wallet, Users, CalendarClock, MessageCircleMore, Wrench, RefreshCcw];

export function ProblemSection() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].problem;

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-kyber-gray">{content.subtitle}</p>
        </Reveal>

        <StaggerContainer className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {content.pains.map((pain, i) => {
            const Icon = PAIN_ICONS[i % PAIN_ICONS.length];
            return (
              <motion.div
                key={pain.title}
                variants={staggerItem}
                className="group rounded-2xl border border-border bg-white/[0.02] p-6 transition-colors duration-300 hover:border-red-400/30 hover:bg-red-500/[0.04]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold text-kyber-white">{pain.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-kyber-gray">{pain.description}</p>
              </motion.div>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ---------------- Solução (timeline interativa) ---------------- */

export function SolutionSection() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].solution;

  return (
    <section className="relative py-24">
      <div className="glow-orb right-[5%] top-[10%] h-[360px] w-[360px] opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-lg font-medium text-gradient">{content.subtitle}</p>
        </Reveal>

        <div className="relative mt-16">
          {/* Linha vertical da timeline */}
          <div className="absolute left-[22px] top-0 hidden h-full w-px bg-gradient-to-b from-kyber-green/50 via-kyber-green/20 to-transparent md:left-1/2 md:block" />

          <div className="space-y-8 md:space-y-0">
            {content.steps.map((step, i) => (
              <Reveal
                key={step.title}
                delay={i * 0.05}
                className={cn(
                  "relative md:flex md:items-center md:gap-10 md:py-5",
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                )}
              >
                <div className={cn("md:w-1/2", i % 2 === 0 ? "md:text-right" : "md:text-left")}>
                  <div className="glass-card inline-block max-w-md p-6 text-left transition-shadow duration-300 hover:shadow-card-hover">
                    <span className="font-display text-xs font-bold text-kyber-green">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-1.5 font-display text-lg font-semibold text-kyber-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-kyber-gray">{step.description}</p>
                  </div>
                </div>
                <span className="absolute left-1/2 hidden h-3 w-3 -translate-x-1/2 rounded-full bg-kyber-green shadow-glow-sm md:block" />
                <div className="hidden md:block md:w-1/2" />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Carrossel de funcionalidades ---------------- */

const FEATURE_ICONS = [
  Bot,
  PencilRuler,
  ListChecks,
  FileText,
  Kanban,
  MessageCircleMore,
  Users,
  Wrench,
  UserRoundPlus,
  Wallet,
  Languages,
];

export function FeatureCarousel() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].features;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: "smooth" });
  };

  return (
    <section id="funcionalidades" className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
              {content.title}
            </h2>
            <p className="mt-4 text-kyber-gray">{content.subtitle}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" size="icon" onClick={() => scrollBy(-1)} aria-label="Anterior">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" onClick={() => scrollBy(1)} aria-label="Próximo">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Reveal>
      </div>

      <div
        ref={scrollRef}
        className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 [scrollbar-width:none] lg:px-[max(1rem,calc((100vw-80rem)/2+2rem))] [&::-webkit-scrollbar]:hidden"
      >
        {content.items.map((item, i) => {
          const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass-card w-[300px] shrink-0 snap-start p-7 transition-shadow duration-300 hover:shadow-card-hover"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-green text-kyber-black shadow-glow-sm">
                <Icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-display text-base font-semibold text-kyber-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-kyber-gray">{item.description}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------- Demo interativa por segmento ---------------- */

const DEMO_SCRIPTS: Record<string, ChatMessage[]> = {
  calhas: [
    { from: "customer", text: "Oi! Preciso de calha nova no meu sobrado" },
    { from: "ai", text: "Olá! 😊 Quantos metros de calha, aproximadamente? E qual o tipo: lisa, ondulada ou premium?" },
    { from: "customer", text: "Uns 22 metros, ondulada" },
    { from: "ai", kind: "pdf", pdfLabel: "Orcamento-Calhas.pdf", text: "Prontinho! Ficou em R$ 2.000,00 com instalação. Proposta em PDF enviada! 🎉" },
  ],
  ar: [
    { from: "customer", text: "Quanto custa instalar um split de 12.000 BTUs?" },
    { from: "ai", text: "Olá! 😊 A parede é de alvenaria ou drywall? E qual a distância entre a evaporadora e a condensadora?" },
    { from: "customer", text: "Alvenaria, uns 4 metros de distância" },
    { from: "ai", kind: "pdf", pdfLabel: "Orcamento-ArCondicionado.pdf", text: "Perfeito! Instalação completa com suporte e tubulação: R$ 850,00. Segue a proposta! ❄️" },
  ],
  marcenaria: [
    { from: "customer", text: "", kind: "audio" },
    { from: "ai", text: "Entendi pelo áudio: armário planejado de 3,2m para cozinha, em MDF branco TX. Com portas de vidro ou MDF?" },
    { from: "customer", text: "Portas de MDF mesmo" },
    { from: "ai", kind: "pdf", pdfLabel: "Orcamento-Marcenaria.pdf", text: "Ótimo! Projeto completo com montagem: R$ 6.400,00 em até 6x. Proposta detalhada no PDF! 🪚" },
  ],
  gesso: [
    { from: "customer", text: "Preciso de forro de gesso na sala, 24m²" },
    { from: "ai", text: "Olá! 😊 Forro liso ou com sanca? E o pé-direito é padrão (2,70m)?" },
    { from: "customer", text: "Com sanca aberta, pé direito padrão" },
    { from: "ai", kind: "pdf", pdfLabel: "Orcamento-Gesso.pdf", text: "Fechado! Forro + sanca aberta com iluminação: R$ 3.120,00. Segue a proposta completa! ✨" },
  ],
};

export function InteractiveDemo() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].demo;
  const [segment, setSegment] = useState("calhas");

  return (
    <section id="demo" className="relative py-24">
      <div className="glow-orb left-[-5%] top-[20%] h-[400px] w-[400px] opacity-50" />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-kyber-gray">{content.subtitle}</p>
        </Reveal>

        <Reveal delay={0.1} className="mt-10 flex flex-wrap justify-center gap-3">
          {content.segments.map((seg) => (
            <button
              key={seg.id}
              onClick={() => setSegment(seg.id)}
              className={cn(
                "focus-ring flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium transition-all duration-300",
                segment === seg.id
                  ? "border-kyber-green/60 bg-kyber-green/10 text-kyber-green shadow-glow-sm"
                  : "border-border bg-white/[0.03] text-kyber-gray hover:border-white/25 hover:text-kyber-soft"
              )}
            >
              <span>{seg.emoji}</span>
              {seg.label}
            </button>
          ))}
        </Reveal>

        <div className="mx-auto mt-10 max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={segment}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <ChatSimulation messages={DEMO_SCRIPTS[segment]} speed={1200} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/* ---------------- Depoimentos ---------------- */

export function TestimonialsSection() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].testimonials;

  return (
    <section className="relative py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-kyber-gray">{content.subtitle}</p>
        </Reveal>

        <StaggerContainer className="mt-14 grid gap-6 lg:grid-cols-3">
          {content.items.map((item) => (
            <motion.figure
              key={item.name}
              variants={staggerItem}
              whileHover={{ y: -6 }}
              className="glass-card flex flex-col p-7 transition-shadow duration-300 hover:shadow-card-hover"
            >
              <QuoteIcon className="h-7 w-7 text-kyber-green/60" />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-kyber-soft">
                “{item.quote}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-border pt-5">
                <Avatar name={item.name} />
                <div>
                  <p className="text-sm font-semibold text-kyber-white">{item.name}</p>
                  <p className="text-xs text-kyber-dim">
                    {item.role} · {item.company}
                  </p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */

export function FaqSection() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].faq;

  return (
    <section id="faq" className="relative py-24">
      <div className="mx-auto max-w-3xl px-4 lg:px-8">
        <Reveal className="text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-kyber-white sm:text-4xl">
            {content.title}
          </h2>
          <p className="mt-4 text-kyber-gray">{content.subtitle}</p>
        </Reveal>

        <div className="mt-12 space-y-3">
          {content.items.map((item, i) => (
            <Reveal key={item.question} delay={i * 0.04}>
              <Accordion title={item.question}>{item.answer}</Accordion>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA final ---------------- */

export function FinalCta() {
  const { locale } = useI18n();
  const content = LANDING_CONTENT[locale].finalCta;

  return (
    <section className="relative overflow-hidden py-28">
      <div className="glow-orb left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2" />
      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,black,transparent)]" />
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center lg:px-8">
        <h2 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          <span className="text-kyber-white">{content.title.split(" no ")[0]}</span>{" "}
          <span className="text-gradient-animated">no WhatsApp.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-kyber-gray">{content.subtitle}</p>
        <Link href="/cadastro" className="mt-10 inline-block">
          <Button variant="glow" size="xl">
            <Sparkles className="h-5 w-5" />
            {content.button}
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      </Reveal>
    </section>
  );
}

/* ---------------- Rodapé ---------------- */

export function LandingFooter() {
  const { locale, t } = useI18n();
  const content = LANDING_CONTENT[locale].footer;

  return (
    <footer className="border-t border-border py-14">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 md:flex-row md:justify-between lg:px-8">
        <div className="max-w-sm">
          <KyberLogo />
          <p className="mt-4 text-sm leading-relaxed text-kyber-gray">{content.description}</p>
        </div>
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-kyber-dim">{t("nav.features")}</p>
            <ul className="mt-3 space-y-2 text-sm text-kyber-gray">
              <li><a href="#funcionalidades" className="hover:text-kyber-green">{t("nav.quotes")}</a></li>
              <li><a href="#funcionalidades" className="hover:text-kyber-green">{t("nav.crm")}</a></li>
              <li><a href="#funcionalidades" className="hover:text-kyber-green">{t("nav.automations")}</a></li>
              <li><a href="#funcionalidades" className="hover:text-kyber-green">{t("nav.whatsapp")}</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-kyber-dim">KyberGo</p>
            <ul className="mt-3 space-y-2 text-sm text-kyber-gray">
              <li><a href="#planos" className="hover:text-kyber-green">{t("nav.pricing")}</a></li>
              <li><a href="#faq" className="hover:text-kyber-green">{t("nav.faq")}</a></li>
              <li><Link href="/login" className="hover:text-kyber-green">{t("nav.login")}</Link></li>
              <li><Link href="/cadastro" className="hover:text-kyber-green">{t("nav.register")}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-12 max-w-7xl border-t border-border px-4 pt-6 lg:px-8">
        <p className="text-xs text-kyber-dim">
          © 2026 KyberGo. {content.rights}
        </p>
      </div>
    </footer>
  );
}
