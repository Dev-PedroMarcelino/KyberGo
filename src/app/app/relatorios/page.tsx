"use client";

/**
 * Relatórios / Analytics — visão comercial por período.
 * O filtro de período no topo escopa todos os KPIs, gráficos e tabelas abaixo.
 */

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CircleDollarSign,
  Clock3,
  Download,
  FileX2,
  MessageCircleReply,
  Send,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import { MOCK_QUOTES_OVER_TIME, MOCK_USERS } from "@/lib/mock/data";
import { AnimatedCounter, PageTransition, StaggerContainer, staggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MetricCard, Progress, Tabs, Avatar } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { RevenueComposedChart, type RevenuePoint } from "@/components/charts/revenue-composed-chart";
import { MiniAreaChart, type MiniPoint } from "@/components/charts/mini-area-chart";
import { CHART_COLORS, ChartLegend } from "@/components/charts/chart-tooltip";
import { FunnelBars, type FunnelStage } from "@/components/dashboard/funnel-bars";

type PeriodKey = "30d" | "90d" | "12m";

interface SellerStats {
  userId: string;
  quotes: number;
  closed: number;
  revenue: number;
}

interface PeriodData {
  kpis: {
    closedRevenue: number;
    closedDelta: number;
    forecastRevenue: number;
    avgTicket: number;
    conversion: number;
    conversionDelta: number;
    lost: number;
    responseTime: string;
  };
  revenue: RevenuePoint[];
  funnel: FunnelStage[];
  followUp: { sent: number; responseRate: number; reactivated: number; reactivatedValue: number; trend: MiniPoint[] };
  lossReasons: { reason: string; count: number }[];
  sellers: SellerStats[];
}

/* Séries derivadas dos mocks: os 6 meses de MOCK_QUOTES_OVER_TIME compõem o núcleo;
   30 dias abre o último mês em semanas e 12 meses estende o histórico para trás. */
const LAST_SEMESTER: RevenuePoint[] = MOCK_QUOTES_OVER_TIME.map((point) => ({
  label: point.month,
  receita: point.receita,
  previsao: Math.round(point.receita * 1.12),
}));

const PREVIOUS_SEMESTER: RevenuePoint[] = [
  { label: "Jul", receita: 9800, previsao: 10400 },
  { label: "Ago", receita: 10900, previsao: 11300 },
  { label: "Set", receita: 11600, previsao: 12500 },
  { label: "Out", receita: 12800, previsao: 13100 },
  { label: "Nov", receita: 13500, previsao: 14600 },
  { label: "Dez", receita: 12200, previsao: 13900 },
];

const PERIOD_DATA: Record<PeriodKey, PeriodData> = {
  "30d": {
    kpis: {
      closedRevenue: 38200,
      closedDelta: 21,
      forecastRevenue: 11650,
      avgTicket: 3820,
      conversion: 42,
      conversionDelta: 6,
      lost: 6,
      responseTime: "2 min",
    },
    revenue: [
      { label: "Sem 1", receita: 8200, previsao: 8800 },
      { label: "Sem 2", receita: 9400, previsao: 9600 },
      { label: "Sem 3", receita: 9800, previsao: 10400 },
      { label: "Sem 4", receita: 10800, previsao: 11600 },
    ],
    funnel: [
      { stage: "Leads", value: 31 },
      { stage: "Qualificados", value: 24 },
      { stage: "Orçamento enviado", value: 19 },
      { stage: "Negociação", value: 13 },
      { stage: "Fechados", value: 10 },
    ],
    followUp: {
      sent: 86,
      responseRate: 38,
      reactivated: 5,
      reactivatedValue: 8400,
      trend: [
        { label: "Sem 1", value: 18 },
        { label: "Sem 2", value: 21 },
        { label: "Sem 3", value: 22 },
        { label: "Sem 4", value: 25 },
      ],
    },
    lossReasons: [
      { reason: "Preço alto", count: 3 },
      { reason: "Concorrência", count: 1 },
      { reason: "Cliente adiou", count: 1 },
      { reason: "Sem resposta", count: 1 },
    ],
    sellers: [
      { userId: "us_001", quotes: 7, closed: 4, revenue: 12400 },
      { userId: "us_002", quotes: 6, closed: 3, revenue: 11800 },
      { userId: "us_003", quotes: 6, closed: 2, revenue: 8200 },
      { userId: "us_004", quotes: 5, closed: 1, revenue: 5800 },
    ],
  },
  "90d": {
    kpis: {
      closedRevenue: 91500,
      closedDelta: 17,
      forecastRevenue: 24800,
      avgTicket: 3519,
      conversion: 43,
      conversionDelta: 4,
      lost: 15,
      responseTime: "3 min",
    },
    revenue: LAST_SEMESTER.slice(3),
    funnel: [
      { stage: "Leads", value: 82 },
      { stage: "Qualificados", value: 63 },
      { stage: "Orçamento enviado", value: 50 },
      { stage: "Negociação", value: 34 },
      { stage: "Fechados", value: 26 },
    ],
    followUp: {
      sent: 242,
      responseRate: 36,
      reactivated: 12,
      reactivatedValue: 21300,
      trend: [
        { label: "Abr", value: 68 },
        { label: "Mai", value: 82 },
        { label: "Jun", value: 92 },
      ],
    },
    lossReasons: [
      { reason: "Preço alto", count: 6 },
      { reason: "Concorrência", count: 3 },
      { reason: "Cliente adiou", count: 3 },
      { reason: "Sem resposta", count: 3 },
    ],
    sellers: [
      { userId: "us_001", quotes: 18, closed: 9, revenue: 29800 },
      { userId: "us_002", quotes: 16, closed: 8, revenue: 28400 },
      { userId: "us_003", quotes: 15, closed: 5, revenue: 19100 },
      { userId: "us_004", quotes: 12, closed: 4, revenue: 14200 },
    ],
  },
  "12m": {
    kpis: {
      closedRevenue: 219700,
      closedDelta: 34,
      forecastRevenue: 58200,
      avgTicket: 2891,
      conversion: 38,
      conversionDelta: 9,
      lost: 41,
      responseTime: "4 min",
    },
    revenue: [...PREVIOUS_SEMESTER, ...LAST_SEMESTER],
    funnel: [
      { stage: "Leads", value: 298 },
      { stage: "Qualificados", value: 231 },
      { stage: "Orçamento enviado", value: 184 },
      { stage: "Negociação", value: 127 },
      { stage: "Fechados", value: 96 },
    ],
    followUp: {
      sent: 940,
      responseRate: 34,
      reactivated: 38,
      reactivatedValue: 64100,
      trend: [
        { label: "Jul", value: 52 },
        { label: "Set", value: 64 },
        { label: "Nov", value: 71 },
        { label: "Jan", value: 76 },
        { label: "Mar", value: 88 },
        { label: "Mai", value: 96 },
      ],
    },
    lossReasons: [
      { reason: "Preço alto", count: 16 },
      { reason: "Concorrência", count: 9 },
      { reason: "Cliente adiou", count: 8 },
      { reason: "Sem resposta", count: 8 },
    ],
    sellers: [
      { userId: "us_001", quotes: 74, closed: 32, revenue: 78200 },
      { userId: "us_002", quotes: 66, closed: 28, revenue: 69400 },
      { userId: "us_003", quotes: 58, closed: 21, revenue: 42600 },
      { userId: "us_004", quotes: 44, closed: 15, revenue: 29500 },
    ],
  },
};

export default function ReportsPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [period, setPeriod] = useState<PeriodKey>("30d");

  const data = PERIOD_DATA[period];
  const usersById = useMemo(() => new Map(MOCK_USERS.map((user) => [user.id, user])), []);
  const totalLost = data.lossReasons.reduce((sum, row) => sum + row.count, 0);
  const topRevenue = Math.max(...data.sellers.map((seller) => seller.revenue));

  const handleExport = () => {
    toast("info", t("reports.exportToastTitle"), t("reports.exportToastDescription"));
  };

  return (
    <PageTransition>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("reports.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("reports.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro de período — escopa tudo que está abaixo */}
          <Tabs
            value={period}
            onChange={(value) => setPeriod(value as PeriodKey)}
            items={[
              { value: "30d", label: t("reports.period30") },
              { value: "90d", label: t("reports.period90") },
              { value: "12m", label: t("reports.period12m") },
            ]}
          />
          <Button variant="secondary" onClick={handleExport}>
            <Download className="h-4 w-4" />
            {t("reports.export")}
          </Button>
        </div>
      </div>

      {/* KPIs do período */}
      <StaggerContainer key={`kpis-${period}`} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("reports.kpiClosedRevenue")}
            value={<AnimatedCounter value={data.kpis.closedRevenue} prefix="R$ " />}
            delta={data.kpis.closedDelta}
            icon={<CircleDollarSign className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("reports.kpiForecastRevenue")}
            value={<AnimatedCounter value={data.kpis.forecastRevenue} prefix="R$ " />}
            icon={<TrendingUp className="h-4 w-4" />}
            footer={<p className="text-xs text-kyber-dim">{t("reports.kpiForecastFooter")}</p>}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("reports.kpiAvgTicket")}
            value={<AnimatedCounter value={data.kpis.avgTicket} prefix="R$ " />}
            icon={<Wallet className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("reports.kpiConversion")}
            value={<AnimatedCounter value={data.kpis.conversion} suffix="%" />}
            delta={data.kpis.conversionDelta}
            icon={<Target className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("reports.kpiLost")}
            value={<AnimatedCounter value={data.kpis.lost} />}
            icon={<FileX2 className="h-4 w-4" />}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <MetricCard
            label={t("reports.kpiResponseTime")}
            value={data.kpis.responseTime}
            icon={<Clock3 className="h-4 w-4" />}
            footer={<p className="text-xs text-kyber-dim">{t("reports.kpiResponseFooter")}</p>}
          />
        </motion.div>
      </StaggerContainer>

      {/* Receita + funil detalhado */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <GlassCard hover={false} className="min-w-0 lg:col-span-2">
          <CardHeader className="flex-wrap">
            <div>
              <CardTitle>{t("reports.revenueTitle")}</CardTitle>
              <CardDescription>{t("reports.revenueSubtitle")}</CardDescription>
            </div>
            <ChartLegend
              items={[
                { label: t("reports.seriesRevenue"), color: CHART_COLORS.green, shape: "rect" },
                { label: t("reports.seriesForecast"), color: CHART_COLORS.neon, shape: "line" },
              ]}
            />
          </CardHeader>
          <RevenueComposedChart
            data={data.revenue}
            labels={{ receita: t("reports.seriesRevenue"), previsao: t("reports.seriesForecast") }}
          />
        </GlassCard>

        <GlassCard hover={false}>
          <CardHeader>
            <div>
              <CardTitle>{t("reports.funnelTitle")}</CardTitle>
              <CardDescription>{t("reports.funnelSubtitle")}</CardDescription>
            </div>
          </CardHeader>
          <FunnelBars
            key={`funnel-${period}`}
            stages={data.funnel}
            detailed
            dropLabel={(pct) => t("reports.funnelDrop", { pct })}
          />
        </GlassCard>
      </div>

      {/* Desempenho de follow-up */}
      <GlassCard hover={false} className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>{t("reports.followupTitle")}</CardTitle>
            <CardDescription>{t("reports.followupSubtitle")}</CardDescription>
          </div>
        </CardHeader>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-border bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm text-kyber-gray">
              <Send className="h-4 w-4 text-kyber-green" />
              {t("reports.fuSent")}
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-kyber-white">
              <AnimatedCounter value={data.followUp.sent} />
            </p>
          </div>
          <div className="rounded-xl border border-border bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm text-kyber-gray">
              <MessageCircleReply className="h-4 w-4 text-kyber-green" />
              {t("reports.fuResponseRate")}
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-kyber-white">
              <AnimatedCounter value={data.followUp.responseRate} suffix="%" />
            </p>
            <Progress value={data.followUp.responseRate} className="mt-3" />
          </div>
          <div className="rounded-xl border border-border bg-white/[0.02] p-4">
            <div className="flex items-center gap-2 text-sm text-kyber-gray">
              <TrendingUp className="h-4 w-4 text-kyber-green" />
              {t("reports.fuReactivated")}
            </div>
            <p className="mt-2 font-display text-2xl font-bold text-kyber-white">
              <AnimatedCounter value={data.followUp.reactivated} />
            </p>
            <p className="mt-1 text-xs text-kyber-dim">
              {t("reports.fuReactivatedFooter", { value: formatCurrency(data.followUp.reactivatedValue, locale) })}
            </p>
          </div>
          <div className="min-w-0 rounded-xl border border-border bg-white/[0.02] p-4">
            <p className="text-sm text-kyber-gray">{t("reports.fuTrendTitle")}</p>
            <div className="mt-3">
              <MiniAreaChart data={data.followUp.trend} seriesLabel={t("reports.fuTrendSeries")} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Motivos de perda + ranking de vendedores */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <GlassCard hover={false}>
          <CardHeader>
            <div>
              <CardTitle>{t("reports.lossTitle")}</CardTitle>
              <CardDescription>{t("reports.lossSubtitle")}</CardDescription>
            </div>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[380px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-kyber-dim">
                  <th className="pb-2.5 pr-4 font-medium">{t("reports.lossReason")}</th>
                  <th className="pb-2.5 pr-4 text-right font-medium">{t("reports.lossCount")}</th>
                  <th className="pb-2.5 font-medium">{t("reports.lossShare")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {data.lossReasons.map((row) => {
                  const share = totalLost > 0 ? Math.round((row.count / totalLost) * 100) : 0;
                  return (
                    <tr key={row.reason}>
                      <td className="py-3 pr-4 text-kyber-soft">{row.reason}</td>
                      <td className="py-3 pr-4 text-right font-semibold tabular-nums text-kyber-white">{row.count}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-white/[0.06]">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${share}%` }}
                              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                              className="h-full rounded-full bg-gradient-green"
                            />
                          </div>
                          <span className="w-10 shrink-0 text-xs tabular-nums text-kyber-gray">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard hover={false}>
          <CardHeader>
            <div>
              <CardTitle>{t("reports.rankingTitle")}</CardTitle>
              <CardDescription>{t("reports.rankingSubtitle")}</CardDescription>
            </div>
          </CardHeader>
          <ul className="space-y-4">
            {data.sellers
              .slice()
              .sort((a, b) => b.revenue - a.revenue)
              .map((seller) => {
                const user = usersById.get(seller.userId);
                if (!user) return null;
                const share = topRevenue > 0 ? Math.round((seller.revenue / topRevenue) * 100) : 0;
                return (
                  <li key={seller.userId} className="flex items-center gap-3.5">
                    <Avatar name={user.name} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <p className="truncate text-sm font-medium text-kyber-soft">{user.name}</p>
                        <p className="shrink-0 text-sm font-semibold tabular-nums text-kyber-white">
                          {formatCurrency(seller.revenue, locale)}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center justify-between gap-3">
                        <p className="text-xs text-kyber-dim">
                          {t("reports.rankQuotes", { count: seller.quotes })} ·{" "}
                          {t("reports.rankClosed", { count: seller.closed })}
                        </p>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${share}%` }}
                          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-gradient-green"
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        </GlassCard>
      </div>
    </PageTransition>
  );
}
