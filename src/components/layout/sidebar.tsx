"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bot,
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  FileText,
  Files,
  Kanban,
  LayoutDashboard,
  LifeBuoy,
  ListChecks,
  MessageSquareText,
  MessagesSquare,
  PencilRuler,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UsersRound,
  Zap,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  href: string;
  labelKey: string;
  icon: React.ReactNode;
}

interface NavSection {
  labelKey: string | null;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    labelKey: null,
    items: [{ href: "/app", labelKey: "nav.overview", icon: <LayoutDashboard className="h-[18px] w-[18px]" /> }],
  },
  {
    labelKey: "nav.sectionSales",
    items: [
      { href: "/app/orcamentos", labelKey: "nav.quotes", icon: <FileText className="h-[18px] w-[18px]" /> },
      { href: "/app/orcamentos/inteligente", labelKey: "nav.newQuoteAi", icon: <Sparkles className="h-[18px] w-[18px]" /> },
      { href: "/app/orcamentos/simples", labelKey: "nav.newQuoteSimple", icon: <PencilRuler className="h-[18px] w-[18px]" /> },
      { href: "/app/crm", labelKey: "nav.crm", icon: <Kanban className="h-[18px] w-[18px]" /> },
      { href: "/app/clientes", labelKey: "nav.customers", icon: <UsersRound className="h-[18px] w-[18px]" /> },
      { href: "/app/relatorios", labelKey: "nav.reports", icon: <ChartNoAxesCombined className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    labelKey: "nav.sectionAutomation",
    items: [
      { href: "/app/automacoes", labelKey: "nav.automations", icon: <Zap className="h-[18px] w-[18px]" /> },
      { href: "/app/automacoes/calendario", labelKey: "nav.calendar", icon: <CalendarDays className="h-[18px] w-[18px]" /> },
      { href: "/app/mensagens", labelKey: "nav.messageTemplates", icon: <MessageSquareText className="h-[18px] w-[18px]" /> },
      { href: "/app/whatsapp", labelKey: "nav.whatsapp", icon: <MessagesSquare className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    labelKey: "nav.sectionDocuments",
    items: [
      { href: "/app/orcamentos/tipos", labelKey: "nav.quoteTypes", icon: <ListChecks className="h-[18px] w-[18px]" /> },
      { href: "/app/pdf/templates", labelKey: "nav.pdfTemplates", icon: <Files className="h-[18px] w-[18px]" /> },
    ],
  },
  {
    labelKey: "nav.sectionCompany",
    items: [
      { href: "/app/equipe", labelKey: "nav.team", icon: <Users className="h-[18px] w-[18px]" /> },
      { href: "/app/assinatura", labelKey: "nav.billing", icon: <CreditCard className="h-[18px] w-[18px]" /> },
      { href: "/app/configuracoes", labelKey: "nav.settings", icon: <Settings className="h-[18px] w-[18px]" /> },
      { href: "/app/ajuda", labelKey: "nav.help", icon: <LifeBuoy className="h-[18px] w-[18px]" /> },
      { href: "/admin", labelKey: "nav.admin", icon: <ShieldCheck className="h-[18px] w-[18px]" /> },
    ],
  },
];

export function KyberLogo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-green shadow-glow-sm">
        <Bot className="h-5 w-5 text-kyber-black" />
      </span>
      <span className="font-display text-lg font-bold tracking-tight text-kyber-white">
        Kyber<span className="text-kyber-green">Go</span>
      </span>
    </Link>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-kyber-rich/60 backdrop-blur-xl">
      <div className="px-5 py-5">
        <KyberLogo />
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {SECTIONS.map((section, si) => (
          <div key={si}>
            {section.labelKey && (
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-wider text-kyber-dim">
                {t(section.labelKey)}
              </p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => {
                const active =
                  item.href === "/app" ? pathname === "/app" : pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      className={cn(
                        "focus-ring group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors duration-200",
                        active
                          ? "text-kyber-green"
                          : "text-kyber-gray hover:bg-white/[0.04] hover:text-kyber-soft"
                      )}
                    >
                      {active && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl border border-kyber-green/20 bg-kyber-green/10"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{item.icon}</span>
                      <span className="relative z-10">{t(item.labelKey)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-4">
        <div className="glass rounded-xl p-3.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-kyber-soft">Plano Professional</p>
            <Badge tone="green">{t("common.active")}</Badge>
          </div>
          <p className="mt-1 text-[11px] text-kyber-dim">62 de 150 PDFs usados este mês</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[41%] rounded-full bg-gradient-green" />
          </div>
        </div>
      </div>
    </aside>
  );
}
