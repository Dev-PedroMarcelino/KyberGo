"use client";

/**
 * Dashboard overview — centro de controle da empresa.
 * Métricas do mês, gráficos de desempenho, uso do plano e listas acionáveis.
 */

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  Cpu,
  Crown,
  FileText,
  Files,
  MessagesSquare,
  PencilRuler,
  Sparkles,
  Target,
  UsersRound,
  Wrench,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import {
  MOCK_CATEGORY_DISTRIBUTION,
  MOCK_CURRENT_USER,
  MOCK_CUSTOMERS,
  MOCK_DASHBOARD_METRICS,
  MOCK_FUNNEL,
  MOCK_PLANS,
  MOCK_QUOTES,
  MOCK_QUOTES_OVER_TIME,
  MOCK_SCHEDULED_MESSAGES,
  MOCK_SUBSCRIPTION,
  MOCK_WHATSAPP_INSTANCE,
} from "@/lib/mock/data";
import type { QuoteStatus } from "@/lib/types";
import { AnimatedCounter, PageTransition, StaggerContainer, staggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { EmptyState, MetricCard, Progress } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { QuotesAreaChart } from "@/components/charts/quotes-area-chart";
import { CategoryDonut } from "@/components/charts/category-donut";
import { CHART_COLORS, ChartLegend } from "@/components/charts/chart-tooltip";
import { FunnelBars } from "@/components/dashboard/funnel-bars";

/** Aparência dos status de orçamento na lista de recentes. */
const QUOTE_STATUS_META: Record<QuoteStatus, { tone: BadgeProps["tone"]; labelKey: string }> = {
  draft: { tone: "gray", labelKey: "dashboard.statusDraft" },
  sent: { tone: "blue", labelKey: "dashboard.statusSent" },
  viewed: { tone: "purple", labelKey: "dashboard.statusViewed" },
  negotiating: { tone: "yellow", labelKey: "dashboard.statusNegotiating" },
  accepted: { tone: "green", labelKey: "dashboard.statusAccepted" },
  rejected: { tone: "red", labelKey: "dashboard.statusRejected" },
  expired: { tone: "gray", labelKey: "dashboard.statusExpired" },
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const metrics = MOCK_DASHBOARD_METRICS;
  const now = new Date();
  const hour = now.getHours();
  const greetingKey =
    hour < 12 ? "dashboard.greetingMorning" : hour < 18 ? "dashboard.greetingAfternoon" : "dashboard.greetingEvening";
  const firstName = MOCK_CURRENT_USER.name.split(" ")[0];
  const longDate = new Intl.DateTimeFormat(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const longDateCapitalized = longDate.charAt(0).toUpperCase() + longDate.slice(1);

  const activePlan = MOCK_PLANS.find((plan) => plan.id === MOCK_SUBSCRIPTION.planId) ?? MOCK_PLANS[1];
  const aiCreditsLimit = activePlan.limits.aiCreditsPerMonth;
  const aiCreditsUsed = Math.round((metrics.aiUsagePercent / 100) * aiCreditsLimit);
  const pdfPercent = Math.round((metrics.pdfUsage.used / metrics.pdfUsage.limit) * 100);

  const customerById = React.useMemo(() => new Map(MOCK_CUSTOMERS.map((c) => [c.id, c])), []);

  const nextFollowUps = React.useMemo(
    () =>
      MOCK_SCHEDULED_MESSAGES.filter((m) => m.status === "scheduled")
        .slice()
        .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor))
        .slice(0, 3),
    []
  );

  const maintenanceCustomers = React.useMemo(
    () =>
      MOCK_CUSTOMERS.filter((c) => c.maintenanceDueDate)
        .slice()
        .sort((a, b) => (a.maintenanceDueDate as string).localeCompare(b.maintenanceDueDate as string))
        .slice(0, 3),
    []
  );

  const recentQuotes = React.useMemo(
    () => MOCK_QUOTES.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    []
  );

  const scheduleMaintenanceMessage = (name: string) => {
    toast("success", t("dashboard.maintenanceToastTitle"), t("dashboard.maintenanceToastDescription", { name }));
  };

  return (
    <PageTransition>
      {/* Cabeçalho: saudação + data + ações rápidas */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white" suppressHydrationWarning>
            {t(greetingKey, { name: firstName })}
          </h1>
          <p className="mt-1 text-sm text-kyber-gray" suppressHydrationWarning>
            {longDateCapitalized}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/app/orcamentos/inteligente">
            <Button variant="primary">
              <Sparkles className="h-4 w-4" />
              {t("dashboard.actionSmartQuote")}
            </Button>
          </Link>
          <Link href="/app/orcamentos/simples">
            <Button variant="secondary">
              <PencilRuler className="h-4 w-4" />
              {t("dashboard.actionSimpleDoc")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Linha de métricas */}
      <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("dashboard.metricQuotesMonth")}
            value={<AnimatedCounter value={metrics.quotesThisMonth} />}
            delta={metrics.quotesGrowth}
            icon={<FileText className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("dashboard.metricConversion")}
            value={<AnimatedCounter value={metrics.conversionRate} suffix="%" />}
            delta={metrics.conversionGrowth}
            icon={<Target className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("dashboard.metricLeads")}
            value={<AnimatedCounter value={metrics.leadsCreated} />}
            delta={metrics.leadsGrowth}
            icon={<UsersRound className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("dashboard.metricRevenue")}
            value={<AnimatedCounter value={metrics.estimatedRevenue} prefix="R$ " />}
            delta={metrics.revenueGrowth}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
        </motion.div>
      </StaggerContainer>

      {/* Gráfico principal + funil */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard hover={false} className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-wrap">
            <div>
              <CardTitle>{t("dashboard.chartTitle")}</CardTitle>
              <CardDescription>{t("dashboard.chartSubtitle")}</CardDescription>
            </div>
            <ChartLegend
              items={[
                { label: t("dashboard.seriesQuotes"), color: CHART_COLORS.green, shape: "line" },
                { label: t("dashboard.seriesClosed"), color: CHART_COLORS.deep, shape: "line" },
              ]}
            />
          </CardHeader>
          <QuotesAreaChart
            data={MOCK_QUOTES_OVER_TIME}
            labels={{ orcamentos: t("dashboard.seriesQuotes"), fechados: t("dashboard.seriesClosed") }}
          />
        </GlassCard>

        <GlassCard hover={false}>
          <CardHeader>
            <div>
              <CardTitle>{t("dashboard.funnelTitle")}</CardTitle>
              <CardDescription>{t("dashboard.funnelSubtitle")}</CardDescription>
            </div>
          </CardHeader>
          <FunnelBars stages={MOCK_FUNNEL} />
        </GlassCard>
      </div>

      {/* Widgets de status e uso do plano */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-kyber-gray">{t("dashboard.whatsappTitle")}</p>
            <span className="rounded-lg bg-kyber-green/10 p-2 text-kyber-green">
              <MessagesSquare className="h-4 w-4" />
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <Badge tone="green" dot>
              {t("dashboard.whatsappConnected")}
            </Badge>
          </div>
          <p className="mt-2 font-display text-lg font-semibold text-kyber-white">
            {MOCK_WHATSAPP_INSTANCE.connectedNumber}
          </p>
          {MOCK_WHATSAPP_INSTANCE.lastConnectionAt && (
            <p className="mt-1 text-xs text-kyber-dim">
              {t("dashboard.whatsappSynced", { date: formatDateTime(MOCK_WHATSAPP_INSTANCE.lastConnectionAt, locale) })}
            </p>
          )}
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-kyber-gray">{t("dashboard.aiTitle")}</p>
            <span className="rounded-lg bg-kyber-green/10 p-2 text-kyber-green">
              <Cpu className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-kyber-white">{metrics.aiUsagePercent}%</p>
          <Progress value={metrics.aiUsagePercent} className="mt-3" />
          <p className="mt-2 text-xs text-kyber-dim">
            {t("dashboard.aiDescription", {
              used: aiCreditsUsed.toLocaleString(locale),
              limit: aiCreditsLimit.toLocaleString(locale),
            })}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-kyber-gray">{t("dashboard.pdfTitle")}</p>
            <span className="rounded-lg bg-kyber-green/10 p-2 text-kyber-green">
              <Files className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-kyber-white">
            {metrics.pdfUsage.used}
            <span className="text-base font-medium text-kyber-dim">/{metrics.pdfUsage.limit}</span>
          </p>
          <Progress value={pdfPercent} className="mt-3" tone={pdfPercent > 85 ? "yellow" : "green"} />
          <p className="mt-2 text-xs text-kyber-dim">
            {t("dashboard.pdfDescription", { used: metrics.pdfUsage.used, limit: metrics.pdfUsage.limit })}
          </p>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-kyber-gray">{t("dashboard.planTitle")}</p>
            <span className="rounded-lg bg-kyber-green/10 p-2 text-kyber-green">
              <Crown className="h-4 w-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-kyber-white">{activePlan.name}</p>
          <p className="mt-1 text-xs text-kyber-dim">
            {t("dashboard.planRenews", { date: formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd, locale) })}
          </p>
          <Link href="/app/assinatura" className="mt-3 inline-block">
            <Button variant="outline" size="sm">
              {t("dashboard.planUpgrade")}
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </GlassCard>
      </div>

      {/* Follow-ups, manutenção e distribuição por categoria */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard hover={false}>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <CalendarClock className="h-4 w-4 text-kyber-green" />
                {t("dashboard.followupsTitle")}
              </CardTitle>
              <CardDescription>{t("dashboard.followupsCount", { count: metrics.followUpsScheduled })}</CardDescription>
            </div>
            <Link
              href="/app/automacoes/calendario"
              className="focus-ring shrink-0 rounded-lg text-xs font-medium text-kyber-green hover:underline"
            >
              {t("dashboard.followupsViewAll")}
            </Link>
          </CardHeader>
          {nextFollowUps.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-7 w-7" />}
              title={t("dashboard.followupsEmptyTitle")}
              description={t("dashboard.followupsEmptyDescription")}
            />
          ) : (
            <ul className="space-y-3">
              {nextFollowUps.map((message) => {
                const customer = customerById.get(message.customerId);
                return (
                  <li key={message.id} className="rounded-xl border border-border bg-white/[0.02] p-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-kyber-soft">{customer?.name ?? "—"}</p>
                      <span className="shrink-0 text-[11px] font-medium text-kyber-green">
                        {formatDateTime(message.scheduledFor, locale)}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-kyber-gray">{message.message}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard hover={false}>
          <CardHeader>
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-4 w-4 text-kyber-green" />
                {t("dashboard.maintenanceTitle")}
              </CardTitle>
              <CardDescription>{t("dashboard.maintenanceCount", { count: maintenanceCustomers.length })}</CardDescription>
            </div>
          </CardHeader>
          {maintenanceCustomers.length === 0 ? (
            <EmptyState
              icon={<Wrench className="h-7 w-7" />}
              title={t("dashboard.maintenanceEmptyTitle")}
              description={t("dashboard.maintenanceEmptyDescription")}
            />
          ) : (
            <ul className="space-y-3">
              {maintenanceCustomers.map((customer) => {
                const due = new Date(customer.maintenanceDueDate as string);
                const overdue = due.getTime() < Date.now();
                return (
                  <li
                    key={customer.id}
                    className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border bg-white/[0.02] p-3.5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-kyber-soft">{customer.name}</p>
                      <p className={`mt-0.5 text-xs ${overdue ? "text-red-400" : "text-kyber-gray"}`}>
                        {t("dashboard.maintenanceDueAt", { date: formatDate(due, locale) })}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => scheduleMaintenanceMessage(customer.name)}>
                      {t("dashboard.maintenanceSchedule")}
                    </Button>
                  </li>
                );
              })}
            </ul>
          )}
        </GlassCard>

        <GlassCard hover={false} className="min-w-0">
          <CardHeader>
            <div>
              <CardTitle className="text-base">{t("dashboard.categoryTitle")}</CardTitle>
              <CardDescription>{t("dashboard.categorySubtitle")}</CardDescription>
            </div>
          </CardHeader>
          <CategoryDonut data={MOCK_CATEGORY_DISTRIBUTION} />
        </GlassCard>
      </div>

      {/* Orçamentos recentes */}
      <GlassCard hover={false} className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>{t("dashboard.recentTitle")}</CardTitle>
            <CardDescription>{t("dashboard.recentSubtitle")}</CardDescription>
          </div>
          <Link
            href="/app/orcamentos"
            className="focus-ring flex shrink-0 items-center gap-1 rounded-lg text-sm font-medium text-kyber-green hover:underline"
          >
            {t("dashboard.recentViewAll")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        {recentQuotes.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-7 w-7" />}
            title={t("dashboard.recentEmptyTitle")}
            description={t("dashboard.recentEmptyDescription")}
            action={
              <Link href="/app/orcamentos/inteligente">
                <Button>
                  <Sparkles className="h-4 w-4" />
                  {t("dashboard.recentEmptyAction")}
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-white/[0.06]">
            {recentQuotes.map((quote) => {
              const customer = customerById.get(quote.customerId);
              const meta = QUOTE_STATUS_META[quote.status];
              return (
                <li key={quote.id}>
                  <Link
                    href="/app/orcamentos"
                    className="focus-ring flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-white/[0.04] sm:px-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-kyber-soft">{quote.number}</p>
                      <p className="mt-0.5 truncate text-xs text-kyber-gray">{customer?.name ?? "—"}</p>
                    </div>
                    <Badge tone={meta.tone} className="shrink-0">
                      {t(meta.labelKey)}
                    </Badge>
                    <span className="w-24 shrink-0 text-right text-sm font-semibold tabular-nums text-kyber-white sm:w-28">
                      {formatCurrency(quote.total, locale)}
                    </span>
                    <ChevronRight className="hidden h-4 w-4 shrink-0 text-kyber-dim sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </PageTransition>
  );
}
