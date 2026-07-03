"use client";

/**
 * Painel do dono da plataforma (super admin) — página standalone, fora do shell /app.
 * KPIs de SaaS, crescimento, gestão de empresas, planos e log de eventos.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Building2,
  CreditCard,
  Eye,
  Lock,
  LockOpen,
  MoreHorizontal,
  PlugZap,
  Rocket,
  Search,
  ShieldAlert,
  TrendingDown,
  Unplug,
  UsersRound,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { MOCK_PLANS } from "@/lib/mock/data";
import type { Plan } from "@/lib/types";
import { KyberLogo } from "@/components/layout/sidebar";
import { AnimatedCounter, PageTransition, StaggerContainer, staggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dropdown, DropdownItem, EmptyState, MetricCard, Progress, Switch, Tabs } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { GrowthAreaChart, type GrowthPoint } from "@/components/charts/growth-area-chart";

/* ---------------- Dados mock locais do painel ---------------- */

type CompanyStatus = "trial" | "active" | "past_due" | "blocked";

interface AdminCompany {
  id: string;
  name: string;
  segment: string;
  plan: string;
  status: CompanyStatus;
  whatsappConnected: boolean;
  pdfsUsed: number;
  pdfsLimit: number;
  createdAt: string;
}

const INITIAL_COMPANIES: AdminCompany[] = [
  { id: "ac_001", name: "Calhas ProTech", segment: "Calhas e rufos", plan: "Professional", status: "active", whatsappConnected: true, pdfsUsed: 62, pdfsLimit: 150, createdAt: "2026-01-10T10:00:00Z" },
  { id: "ac_002", name: "Vidraçaria Cristal", segment: "Vidraçaria", plan: "Starter", status: "active", whatsappConnected: true, pdfsUsed: 18, pdfsLimit: 30, createdAt: "2026-02-03T10:00:00Z" },
  { id: "ac_003", name: "Clima Frio Ar-Condicionado", segment: "Climatização", plan: "Business", status: "active", whatsappConnected: true, pdfsUsed: 214, pdfsLimit: 500, createdAt: "2025-11-18T10:00:00Z" },
  { id: "ac_004", name: "Elétrica Silva & Filhos", segment: "Elétrica", plan: "Starter", status: "trial", whatsappConnected: false, pdfsUsed: 4, pdfsLimit: 30, createdAt: "2026-06-21T10:00:00Z" },
  { id: "ac_005", name: "Jardins Verdes Paisagismo", segment: "Paisagismo", plan: "Professional", status: "past_due", whatsappConnected: true, pdfsUsed: 96, pdfsLimit: 150, createdAt: "2026-03-14T10:00:00Z" },
  { id: "ac_006", name: "Dedetizadora Escudo", segment: "Controle de pragas", plan: "Starter", status: "blocked", whatsappConnected: false, pdfsUsed: 0, pdfsLimit: 30, createdAt: "2026-04-02T10:00:00Z" },
  { id: "ac_007", name: "Piscinas AquaBlue", segment: "Piscinas", plan: "Professional", status: "trial", whatsappConnected: true, pdfsUsed: 11, pdfsLimit: 150, createdAt: "2026-06-28T10:00:00Z" },
  { id: "ac_008", name: "Telhados Fortes Engenharia", segment: "Telhados", plan: "Enterprise", status: "active", whatsappConnected: true, pdfsUsed: 843, pdfsLimit: 0, createdAt: "2025-09-30T10:00:00Z" },
];

const GROWTH_DATA: GrowthPoint[] = [
  { month: "Jul", empresas: 38, mrr: 9800 },
  { month: "Ago", empresas: 47, mrr: 11600 },
  { month: "Set", empresas: 55, mrr: 13400 },
  { month: "Out", empresas: 64, mrr: 15900 },
  { month: "Nov", empresas: 72, mrr: 18200 },
  { month: "Dez", empresas: 81, mrr: 20600 },
  { month: "Jan", empresas: 90, mrr: 23400 },
  { month: "Fev", empresas: 99, mrr: 26100 },
  { month: "Mar", empresas: 108, mrr: 28800 },
  { month: "Abr", empresas: 118, mrr: 31900 },
  { month: "Mai", empresas: 129, mrr: 35200 },
  { month: "Jun", empresas: 142, mrr: 38940 },
];

const PLAN_SUBSCRIBERS: Record<Plan["slug"], number> = {
  starter: 58,
  professional: 61,
  business: 19,
  enterprise: 4,
};

interface PlatformEvent {
  id: string;
  type: "company_created" | "subscription_activated" | "instance_connected" | "payment_failed" | "trial_started" | "company_blocked";
  text: string;
  date: string;
}

const PLATFORM_EVENTS: PlatformEvent[] = [
  { id: "ev_001", type: "company_created", text: "Piscinas AquaBlue criou a conta e iniciou o onboarding.", date: "2026-06-28T09:12:00Z" },
  { id: "ev_002", type: "instance_connected", text: "Piscinas AquaBlue conectou a instância de WhatsApp.", date: "2026-06-28T09:40:00Z" },
  { id: "ev_003", type: "payment_failed", text: "Pagamento de Jardins Verdes Paisagismo falhou (cartão recusado).", date: "2026-06-27T14:05:00Z" },
  { id: "ev_004", type: "subscription_activated", text: "Vidraçaria Cristal ativou o plano Starter anual.", date: "2026-06-25T11:30:00Z" },
  { id: "ev_005", type: "trial_started", text: "Elétrica Silva & Filhos iniciou o trial de 14 dias.", date: "2026-06-21T10:15:00Z" },
  { id: "ev_006", type: "company_blocked", text: "Dedetizadora Escudo foi bloqueada por inadimplência.", date: "2026-06-18T08:00:00Z" },
];

const EVENT_META: Record<PlatformEvent["type"], { icon: React.ReactNode; className: string }> = {
  company_created: { icon: <Building2 className="h-4 w-4" />, className: "bg-kyber-green/10 text-kyber-green" },
  subscription_activated: { icon: <CreditCard className="h-4 w-4" />, className: "bg-kyber-green/10 text-kyber-green" },
  instance_connected: { icon: <PlugZap className="h-4 w-4" />, className: "bg-sky-400/10 text-sky-300" },
  payment_failed: { icon: <ShieldAlert className="h-4 w-4" />, className: "bg-red-500/10 text-red-400" },
  trial_started: { icon: <Rocket className="h-4 w-4" />, className: "bg-violet-400/10 text-violet-300" },
  company_blocked: { icon: <Lock className="h-4 w-4" />, className: "bg-amber-400/10 text-amber-300" },
};

const STATUS_META: Record<CompanyStatus, { tone: BadgeProps["tone"]; labelKey: string }> = {
  trial: { tone: "blue", labelKey: "admin.statusTrial" },
  active: { tone: "green", labelKey: "admin.statusActive" },
  past_due: { tone: "yellow", labelKey: "admin.statusPastDue" },
  blocked: { tone: "red", labelKey: "admin.statusBlocked" },
};

type StatusFilter = "all" | CompanyStatus;

export default function AdminPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [companies, setCompanies] = useState<AdminCompany[]>(INITIAL_COMPANIES);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [planActive, setPlanActive] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(MOCK_PLANS.map((plan) => [plan.id, plan.isActive]))
  );

  const filteredCompanies = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("pt-BR");
    return companies.filter((company) => {
      const matchesStatus = statusFilter === "all" || company.status === statusFilter;
      const matchesSearch = term === "" || company.name.toLocaleLowerCase("pt-BR").includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [companies, search, statusFilter]);

  const showDetails = (company: AdminCompany) => {
    toast("info", t("admin.toastDetailsTitle"), t("admin.toastDetailsDescription", { name: company.name }));
  };

  const toggleBlock = (company: AdminCompany) => {
    const blocking = company.status !== "blocked";
    setCompanies((prev) =>
      prev.map((item) => (item.id === company.id ? { ...item, status: blocking ? "blocked" : "active" } : item))
    );
    if (blocking) {
      toast("warning", t("admin.toastBlockTitle"), t("admin.toastBlockDescription", { name: company.name }));
    } else {
      toast("success", t("admin.toastUnblockTitle"), t("admin.toastUnblockDescription", { name: company.name }));
    }
  };

  const disconnectWhatsapp = (company: AdminCompany) => {
    if (!company.whatsappConnected) {
      toast("info", t("admin.toastAlreadyDisconnectedTitle"), t("admin.toastAlreadyDisconnectedDescription", { name: company.name }));
      return;
    }
    setCompanies((prev) =>
      prev.map((item) => (item.id === company.id ? { ...item, whatsappConnected: false } : item))
    );
    toast("warning", t("admin.toastDisconnectTitle"), t("admin.toastDisconnectDescription", { name: company.name }));
  };

  const togglePlan = (plan: Plan) => {
    const next = !planActive[plan.id];
    setPlanActive((prev) => ({ ...prev, [plan.id]: next }));
    if (next) {
      toast("success", t("admin.planToastOnTitle"), t("admin.planToastOnDescription", { name: plan.name }));
    } else {
      toast("warning", t("admin.planToastOffTitle"), t("admin.planToastOffDescription", { name: plan.name }));
    }
  };

  return (
    <div className="min-h-dvh bg-kyber-black bg-gradient-hero">
      {/* Header próprio do painel — fora do shell /app */}
      <header className="sticky top-0 z-40 border-b border-border bg-kyber-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 lg:px-8">
          <div className="flex items-center gap-3">
            <KyberLogo />
            <Badge tone="neon" dot className="hidden sm:inline-flex">
              {t("admin.badge")}
            </Badge>
          </div>
          <Link href="/app">
            <Button variant="secondary" size="sm">
              {t("admin.backToApp")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <PageTransition>
          <div className="mb-8">
            <div className="mb-2 sm:hidden">
              <Badge tone="neon" dot>
                {t("admin.badge")}
              </Badge>
            </div>
            <h1 className="font-display text-2xl font-bold text-kyber-white">{t("admin.title")}</h1>
            <p className="mt-1 text-sm text-kyber-gray">{t("admin.subtitle")}</p>
          </div>

          {/* KPIs da plataforma */}
          <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <motion.div variants={staggerItem}>
              <MetricCard
                label={t("admin.kpiCompanies")}
                value={<AnimatedCounter value={142} />}
                delta={10}
                icon={<Building2 className="h-4 w-4" />}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                label={t("admin.kpiMrr")}
                value={<AnimatedCounter value={38940} prefix="R$ " />}
                delta={11}
                icon={<CreditCard className="h-4 w-4" />}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                label={t("admin.kpiTrials")}
                value={<AnimatedCounter value={23} />}
                delta={28}
                icon={<Rocket className="h-4 w-4" />}
              />
            </motion.div>
            <motion.div variants={staggerItem}>
              <MetricCard
                label={t("admin.kpiChurn")}
                value={<AnimatedCounter value={2.4} decimals={1} suffix="%" />}
                icon={<TrendingDown className="h-4 w-4" />}
                footer={<p className="text-xs text-kyber-green">{t("admin.kpiChurnFooter")}</p>}
              />
            </motion.div>
          </StaggerContainer>

          {/* Crescimento */}
          <GlassCard hover={false} className="mt-6">
            <CardHeader>
              <div>
                <CardTitle>{t("admin.growthTitle")}</CardTitle>
                <CardDescription>{t("admin.growthSubtitle")}</CardDescription>
              </div>
            </CardHeader>
            <GrowthAreaChart
              data={GROWTH_DATA}
              labels={{ empresas: t("admin.seriesCompanies"), mrr: t("admin.seriesMrr") }}
            />
          </GlassCard>

          {/* Empresas */}
          <GlassCard hover={false} className="mt-6">
            <CardHeader className="flex-wrap">
              <div>
                <CardTitle>{t("admin.companiesTitle")}</CardTitle>
                <CardDescription>{t("admin.companiesSubtitle")}</CardDescription>
              </div>
              <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
                <div className="w-full sm:w-64">
                  <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.searchPlaceholder")}
                    icon={<Search className="h-4 w-4" />}
                  />
                </div>
                <Tabs
                  value={statusFilter}
                  onChange={(value) => setStatusFilter(value as StatusFilter)}
                  items={[
                    { value: "all", label: t("admin.filterAll") },
                    { value: "trial", label: t("admin.statusTrial") },
                    { value: "active", label: t("admin.statusActive") },
                    { value: "past_due", label: t("admin.statusPastDue") },
                    { value: "blocked", label: t("admin.statusBlocked") },
                  ]}
                />
              </div>
            </CardHeader>

            {filteredCompanies.length === 0 ? (
              <EmptyState
                icon={<Building2 className="h-7 w-7" />}
                title={t("admin.emptyTitle")}
                description={t("admin.emptyDescription")}
              />
            ) : (
              <div className="overflow-x-auto lg:overflow-x-visible">
                <table className="w-full min-w-[880px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-kyber-dim">
                      <th className="pb-2.5 pr-4 font-medium">{t("admin.thCompany")}</th>
                      <th className="pb-2.5 pr-4 font-medium">{t("admin.thSegment")}</th>
                      <th className="pb-2.5 pr-4 font-medium">{t("admin.thPlan")}</th>
                      <th className="pb-2.5 pr-4 font-medium">{t("admin.thStatus")}</th>
                      <th className="pb-2.5 pr-4 font-medium">{t("admin.thWhatsapp")}</th>
                      <th className="pb-2.5 pr-4 text-right font-medium">{t("admin.thPdfs")}</th>
                      <th className="pb-2.5 pr-4 font-medium">{t("admin.thCreated")}</th>
                      <th className="pb-2.5 text-right font-medium">
                        <span className="sr-only">{t("admin.actionsLabel")}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06]">
                    {filteredCompanies.map((company) => {
                      const statusMeta = STATUS_META[company.status];
                      return (
                        <tr key={company.id} className="transition-colors hover:bg-white/[0.03]">
                          <td className="py-3.5 pr-4">
                            <p className="font-medium text-kyber-soft">{company.name}</p>
                          </td>
                          <td className="py-3.5 pr-4 text-kyber-gray">{company.segment}</td>
                          <td className="py-3.5 pr-4 text-kyber-gray">{company.plan}</td>
                          <td className="py-3.5 pr-4">
                            <Badge tone={statusMeta.tone}>{t(statusMeta.labelKey)}</Badge>
                          </td>
                          <td className="py-3.5 pr-4">
                            <Badge tone={company.whatsappConnected ? "green" : "gray"} dot={company.whatsappConnected}>
                              {company.whatsappConnected ? t("admin.waConnected") : t("admin.waDisconnected")}
                            </Badge>
                          </td>
                          <td className="py-3.5 pr-4 text-right tabular-nums text-kyber-soft">
                            {company.pdfsUsed.toLocaleString(locale)}
                            <span className="text-kyber-dim">/{company.pdfsLimit > 0 ? company.pdfsLimit : "∞"}</span>
                          </td>
                          <td className="py-3.5 pr-4 text-kyber-gray">{formatDate(company.createdAt, locale)}</td>
                          <td className="py-1 text-right">
                            <Dropdown
                              align="right"
                              trigger={
                                <button
                                  aria-label={t("admin.actionsLabel")}
                                  className="focus-ring rounded-lg p-2 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </button>
                              }
                            >
                              <DropdownItem onClick={() => showDetails(company)}>
                                <Eye className="h-4 w-4" />
                                {t("admin.actionDetails")}
                              </DropdownItem>
                              <DropdownItem onClick={() => toggleBlock(company)}>
                                {company.status === "blocked" ? (
                                  <>
                                    <LockOpen className="h-4 w-4" />
                                    {t("admin.actionUnblock")}
                                  </>
                                ) : (
                                  <>
                                    <Lock className="h-4 w-4" />
                                    {t("admin.actionBlock")}
                                  </>
                                )}
                              </DropdownItem>
                              <DropdownItem className="text-red-400" onClick={() => disconnectWhatsapp(company)}>
                                <Unplug className="h-4 w-4" />
                                {t("admin.actionDisconnect")}
                              </DropdownItem>
                            </Dropdown>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </GlassCard>

          {/* Planos + eventos */}
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <GlassCard hover={false} className="lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>{t("admin.plansTitle")}</CardTitle>
                  <CardDescription>{t("admin.plansSubtitle")}</CardDescription>
                </div>
              </CardHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                {MOCK_PLANS.map((plan) => {
                  const active = planActive[plan.id];
                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-4 transition-colors ${
                        active ? "border-border bg-white/[0.02]" : "border-white/[0.06] bg-white/[0.01] opacity-60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="flex items-center gap-2 font-display text-base font-semibold text-kyber-white">
                            {plan.name}
                            {plan.highlight && (
                              <Badge tone="green" className="text-[10px]">
                                ★
                              </Badge>
                            )}
                          </p>
                          <p className="mt-0.5 text-sm text-kyber-gray">
                            {plan.monthlyPrice > 0 ? (
                              <>
                                <span className="font-semibold text-kyber-green">
                                  {formatCurrency(plan.monthlyPrice, locale)}
                                </span>
                                <span className="text-kyber-dim">{t("admin.perMonth")}</span>
                              </>
                            ) : (
                              t("admin.priceOnRequest")
                            )}
                          </p>
                        </div>
                        <Switch checked={active} onChange={() => togglePlan(plan)} />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-kyber-dim">
                        <UsersRound className="h-3.5 w-3.5" />
                        {t("admin.subscribers", { count: PLAN_SUBSCRIBERS[plan.slug] })}
                      </div>
                      <Progress
                        value={(PLAN_SUBSCRIBERS[plan.slug] / 61) * 100}
                        className="mt-2.5 h-1.5"
                      />
                    </div>
                  );
                })}
              </div>
            </GlassCard>

            <GlassCard hover={false}>
              <CardHeader>
                <div>
                  <CardTitle>{t("admin.logTitle")}</CardTitle>
                  <CardDescription>{t("admin.logSubtitle")}</CardDescription>
                </div>
              </CardHeader>
              <ul className="space-y-4">
                {PLATFORM_EVENTS.map((event) => {
                  const meta = EVENT_META[event.type];
                  return (
                    <li key={event.id} className="flex gap-3">
                      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${meta.className}`}>
                        {meta.icon}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm leading-snug text-kyber-soft">{event.text}</p>
                        <p className="mt-0.5 text-[11px] text-kyber-dim">{formatDateTime(event.date, locale)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </GlassCard>
          </div>
        </PageTransition>
      </main>
    </div>
  );
}
