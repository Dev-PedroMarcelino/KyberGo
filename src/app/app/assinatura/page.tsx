"use client";

/**
 * Assinatura e cobrança — plano atual, uso do ciclo, comparação de planos,
 * histórico de faturas e zona de cancelamento.
 * O banner de simulação alterna os estados da assinatura para demonstração.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  Calendar,
  Check,
  CreditCard,
  Download,
  FileText,
  Lock,
  MessageSquare,
  Receipt,
  Sparkles,
  Users,
} from "lucide-react";
import { PageTransition, Reveal } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Accordion, Progress, Tabs } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_DASHBOARD_METRICS, MOCK_PLANS, MOCK_SUBSCRIPTION, MOCK_USERS } from "@/lib/mock/data";
import type { Plan } from "@/lib/types";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

/* ---------------- Tipos e dados locais (mock de demonstração) ---------------- */

type SimStatus = "active" | "trialing" | "past_due" | "blocked";
type BillingCycle = "monthly" | "annual";

interface MockInvoice {
  id: string;
  date: string;
  number: string;
  amount: number;
  status: "paid" | "pending";
}

const MOCK_INVOICES: MockInvoice[] = [
  { id: "inv_006", date: "2026-06-10T00:00:00Z", number: "FAT-2026-0158", amount: 197, status: "pending" },
  { id: "inv_005", date: "2026-05-10T00:00:00Z", number: "FAT-2026-0131", amount: 197, status: "paid" },
  { id: "inv_004", date: "2026-04-10T00:00:00Z", number: "FAT-2026-0104", amount: 197, status: "paid" },
  { id: "inv_003", date: "2026-03-10T00:00:00Z", number: "FAT-2026-0077", amount: 197, status: "paid" },
  { id: "inv_002", date: "2026-02-10T00:00:00Z", number: "FAT-2026-0050", amount: 197, status: "paid" },
  { id: "inv_001", date: "2026-01-10T00:00:00Z", number: "FAT-2026-0023", amount: 197, status: "paid" },
];

/** Ordem dos planos para decidir entre upgrade e downgrade. */
const PLAN_ORDER: Record<Plan["slug"], number> = {
  starter: 0,
  professional: 1,
  business: 2,
  enterprise: 3,
};

/** Fim de teste fictício usado na simulação do estado "trial". */
const MOCK_TRIAL_ENDS_AT = "2026-07-12T00:00:00Z";

function usageTone(percent: number): "green" | "yellow" | "red" {
  if (percent > 90) return "red";
  if (percent > 75) return "yellow";
  return "green";
}

export default function AssinaturaPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [simStatus, setSimStatus] = useState<SimStatus>("active");
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [currentPlanId, setCurrentPlanId] = useState(MOCK_SUBSCRIPTION.planId);
  const [changeTarget, setChangeTarget] = useState<Plan | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelText, setCancelText] = useState("");

  const currentPlan = useMemo(
    () => MOCK_PLANS.find((p) => p.id === currentPlanId) ?? MOCK_PLANS[1],
    [currentPlanId]
  );

  const periodEnd = new Date(MOCK_SUBSCRIPTION.currentPeriodEnd);
  const daysRemaining = Math.max(
    0,
    Math.min(30, Math.ceil((periodEnd.getTime() - Date.now()) / 86_400_000))
  );
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((new Date(MOCK_TRIAL_ENDS_AT).getTime() - Date.now()) / 86_400_000)
  );

  /* ------------ Indicadores de uso do ciclo ------------ */
  const metrics = MOCK_DASHBOARD_METRICS;
  const usageItems = [
    {
      key: "users",
      label: t("billing.usageUsers"),
      icon: <Users className="h-4 w-4" />,
      used: MOCK_USERS.length,
      limit: currentPlan.limits.users,
    },
    {
      key: "pdfs",
      label: t("billing.usagePdfs"),
      icon: <FileText className="h-4 w-4" />,
      used: metrics.pdfUsage.used,
      limit: currentPlan.limits.pdfsPerMonth,
    },
    {
      key: "conversations",
      label: t("billing.usageConversations"),
      icon: <MessageSquare className="h-4 w-4" />,
      used: metrics.conversationUsage.used,
      limit: currentPlan.limits.whatsappConversationsPerMonth,
    },
    {
      key: "ai",
      label: t("billing.usageAiCredits"),
      icon: <Bot className="h-4 w-4" />,
      used: Math.round((metrics.aiUsagePercent / 100) * currentPlan.limits.aiCreditsPerMonth),
      limit: currentPlan.limits.aiCreditsPerMonth,
    },
  ];

  /* ------------ Mudança de plano ------------ */
  const isUpgrade = (plan: Plan) => PLAN_ORDER[plan.slug] > PLAN_ORDER[currentPlan.slug];

  const priceFor = (plan: Plan) =>
    cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice;

  const monthlyEquivalent = (plan: Plan) =>
    cycle === "monthly" ? plan.monthlyPrice : plan.annualPrice / 12;

  const proRata = changeTarget
    ? Math.abs(monthlyEquivalent(changeTarget) - monthlyEquivalent(currentPlan)) * (daysRemaining / 30)
    : 0;

  const confirmPlanChange = () => {
    if (!changeTarget) return;
    setCurrentPlanId(changeTarget.id);
    toast(
      "success",
      t("billing.changeSuccessToast"),
      t("billing.changeSuccessToastDesc", { plan: changeTarget.name })
    );
    setChangeTarget(null);
  };

  const confirmCancel = () => {
    toast(
      "success",
      t("billing.cancelSuccessToast"),
      t("billing.cancelSuccessToastDesc", { date: formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd) })
    );
    setCancelOpen(false);
    setCancelText("");
  };

  const statusBadge: Record<SimStatus, React.ReactNode> = {
    active: (
      <Badge tone="green" dot>
        {t("billing.statusActive")}
      </Badge>
    ),
    trialing: (
      <Badge tone="yellow" dot>
        {t("billing.statusTrial")}
      </Badge>
    ),
    past_due: (
      <Badge tone="yellow" dot>
        {t("billing.statusPastDue")}
      </Badge>
    ),
    blocked: (
      <Badge tone="red" dot>
        {t("billing.statusBlocked")}
      </Badge>
    ),
  };

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("billing.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("billing.subtitle")}</p>
        </div>
      </div>

      {/* Banner de simulação de estados */}
      <Card className="mb-6 border-dashed !p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-kyber-white">{t("billing.simTitle")}</p>
            <p className="text-xs text-kyber-dim">{t("billing.simDescription")}</p>
          </div>
          <Tabs
            items={[
              { value: "active", label: t("billing.simActive") },
              { value: "trialing", label: t("billing.simTrial") },
              { value: "past_due", label: t("billing.simPastDue") },
              { value: "blocked", label: t("billing.simBlocked") },
            ]}
            value={simStatus}
            onChange={(v) => setSimStatus(v as SimStatus)}
          />
        </div>
      </Card>

      {/* Plano atual + uso */}
      <div className="mb-10 grid gap-6 lg:grid-cols-5">
        {/* Card do plano atual */}
        <Card
          className={cn(
            "lg:col-span-2",
            simStatus === "past_due" && "border-amber-400/30",
            simStatus === "blocked" && "border-red-500/30"
          )}
        >
          <CardHeader className="mb-5">
            <div>
              <CardTitle>{t("billing.currentPlanTitle")}</CardTitle>
              <CardDescription>{t("billing.planLabel", { plan: currentPlan.name })}</CardDescription>
            </div>
            {statusBadge[simStatus]}
          </CardHeader>

          <p className="font-display text-3xl font-bold tracking-tight text-kyber-white">
            {currentPlan.monthlyPrice > 0 ? (
              <>
                {formatCurrency(currentPlan.monthlyPrice)}
                <span className="text-base font-medium text-kyber-gray">{t("billing.perMonth")}</span>
              </>
            ) : (
              t("billing.customPrice")
            )}
          </p>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center gap-2.5 text-kyber-gray">
              <Calendar className="h-4 w-4 shrink-0 text-kyber-green" />
              <span>
                {t("billing.currentPeriod")}:{" "}
                <span className="text-kyber-soft">
                  {formatDate(MOCK_SUBSCRIPTION.currentPeriodStart)} — {formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd)}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-kyber-gray">
              <Receipt className="h-4 w-4 shrink-0 text-kyber-green" />
              <span>
                {t("billing.nextCharge")}:{" "}
                <span className="text-kyber-soft">
                  {formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd)} ·{" "}
                  {formatCurrency(currentPlan.monthlyPrice)}
                </span>
              </span>
            </div>
          </div>

          {/* Método de pagamento */}
          <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-kyber-green/10 text-kyber-green">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-kyber-white">•••• •••• •••• 4242</p>
                <p className="text-xs text-kyber-dim">{t("billing.cardExpiry")}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toast("info", t("billing.cardChangeToast"), t("billing.cardChangeToastDesc"))}
            >
              {t("billing.changeCard")}
            </Button>
          </div>

          {/* Estados especiais */}
          {simStatus === "trialing" && (
            <div className="mt-5 rounded-xl border border-kyber-green/25 bg-kyber-green/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-kyber-green">
                <Sparkles className="h-4 w-4" />
                {t("billing.trialDaysLeft", { days: trialDaysLeft })}
              </div>
              <p className="mt-1 text-xs text-kyber-gray">
                {t("billing.trialEndsAt", { date: formatDate(MOCK_TRIAL_ENDS_AT) })}
              </p>
              <Button
                className="mt-3 w-full"
                onClick={() => toast("success", t("billing.trialCtaToast"), t("billing.trialCtaToastDesc"))}
              >
                {t("billing.trialCta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {simStatus === "past_due" && (
            <div className="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <AlertTriangle className="h-4 w-4" />
                {t("billing.pastDueTitle")}
              </div>
              <p className="mt-1 text-xs text-kyber-gray">
                {t("billing.pastDueDescription", {
                  amount: formatCurrency(currentPlan.monthlyPrice),
                  date: formatDate("2026-06-10T00:00:00Z"),
                })}
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-3 border-amber-400/30 text-amber-300 hover:border-amber-400/60"
                onClick={() =>
                  toast("success", t("billing.updatePaymentToast"), t("billing.updatePaymentToastDesc"))
                }
              >
                {t("billing.updatePayment")}
              </Button>
            </div>
          )}

          {simStatus === "blocked" && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-red-400">
                <Lock className="h-4 w-4" />
                {t("billing.blockedTitle")}
              </div>
              <p className="mt-1 text-xs text-kyber-gray">{t("billing.blockedDescription")}</p>
              <Link
                href="/bloqueado"
                className="focus-ring mt-3 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-red-400 underline-offset-4 hover:underline"
              >
                {t("billing.blockedLink")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </Card>

        {/* Uso do plano */}
        <Card className="lg:col-span-3">
          <CardHeader className="mb-5">
            <div>
              <CardTitle>{t("billing.usageTitle")}</CardTitle>
              <CardDescription>
                {t("billing.usageSubtitle", {
                  start: formatDate(MOCK_SUBSCRIPTION.currentPeriodStart),
                  end: formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd),
                })}
              </CardDescription>
            </div>
          </CardHeader>

          <div className="grid gap-5 sm:grid-cols-2">
            {usageItems.map((item) => {
              const percent = Math.round((item.used / item.limit) * 100);
              const tone = usageTone(percent);
              return (
                <div key={item.key} className="rounded-xl border border-border bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-sm text-kyber-gray">
                      <span className="text-kyber-green">{item.icon}</span>
                      {item.label}
                    </div>
                    {tone === "red" && <Badge tone="red">{t("billing.usageAtLimit")}</Badge>}
                    {tone === "yellow" && <Badge tone="yellow">{t("billing.usageNearLimit")}</Badge>}
                  </div>
                  <p className="mt-2 font-display text-xl font-bold text-kyber-white">
                    {t("billing.usageOf", { used: item.used.toLocaleString("pt-BR"), limit: item.limit.toLocaleString("pt-BR") })}
                  </p>
                  <Progress value={percent} tone={tone} className="mt-3" />
                  <p className="mt-1.5 text-xs text-kyber-dim">{t("billing.usagePercent", { percent })}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Comparação de planos */}
      <Reveal>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-kyber-white">{t("billing.plansTitle")}</h2>
            <p className="mt-1 text-sm text-kyber-gray">{t("billing.plansSubtitle")}</p>
          </div>

          {/* Toggle mensal/anual (botões próprios para não conflitar com as Tabs do banner) */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-xl border border-border bg-white/[0.03] p-1">
              {(["monthly", "annual"] as const).map((c) => (
                <button
                  key={c}
                  onClick={() => setCycle(c)}
                  className={cn(
                    "focus-ring rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                    cycle === c
                      ? "bg-gradient-green text-kyber-black"
                      : "text-kyber-gray hover:text-kyber-soft"
                  )}
                >
                  {c === "monthly" ? t("billing.billingMonthly") : t("billing.billingAnnual")}
                </button>
              ))}
            </div>
            <Badge tone="neon">{t("billing.annualBadge")}</Badge>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {MOCK_PLANS.map((plan) => {
            const isCurrent = plan.id === currentPlan.id;
            const isEnterprise = plan.slug === "enterprise";
            const upgrade = isUpgrade(plan);
            return (
              <Card
                key={plan.id}
                className={cn(
                  "relative flex flex-col !p-5",
                  plan.highlight && "border-kyber-green/40 shadow-glow-sm",
                  isCurrent && "bg-kyber-green/[0.04]"
                )}
              >
                {plan.highlight && !isCurrent && (
                  <Badge tone="neon" className="absolute -top-2.5 left-5">
                    {t("billing.mostPopular")}
                  </Badge>
                )}
                {isCurrent && (
                  <Badge tone="green" className="absolute -top-2.5 left-5">
                    {t("billing.currentPlanBadge")}
                  </Badge>
                )}

                <h3 className="font-display text-lg font-semibold text-kyber-white">{plan.name}</h3>
                <p className="mt-2 font-display text-2xl font-bold tracking-tight text-kyber-white">
                  {isEnterprise ? (
                    t("billing.customPrice")
                  ) : (
                    <>
                      {formatCurrency(priceFor(plan))}
                      <span className="text-sm font-medium text-kyber-gray">
                        {cycle === "monthly" ? t("billing.perMonth") : t("billing.perYear")}
                      </span>
                    </>
                  )}
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-kyber-gray">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kyber-green" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-5">
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      {t("billing.currentPlanButton")}
                    </Button>
                  ) : isEnterprise ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        toast("success", t("billing.contactSalesToast"), t("billing.contactSalesToastDesc"))
                      }
                    >
                      {t("billing.contactSales")}
                    </Button>
                  ) : (
                    <Button
                      variant={upgrade ? "primary" : "secondary"}
                      className="w-full"
                      onClick={() => setChangeTarget(plan)}
                    >
                      {upgrade ? t("billing.upgradeButton") : t("billing.downgradeButton")}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </Reveal>

      {/* Histórico de faturas */}
      <Reveal className="mt-10">
        <Card className="!p-0">
          <div className="border-b border-border p-6 pb-4">
            <CardTitle>{t("billing.invoicesTitle")}</CardTitle>
            <CardDescription>{t("billing.invoicesSubtitle")}</CardDescription>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-kyber-dim">
                  <th className="px-6 py-3 font-medium">{t("billing.invoiceDate")}</th>
                  <th className="px-6 py-3 font-medium">{t("billing.invoiceNumber")}</th>
                  <th className="px-6 py-3 font-medium">{t("billing.invoiceAmount")}</th>
                  <th className="px-6 py-3 font-medium">{t("billing.invoiceStatus")}</th>
                  <th className="px-6 py-3 text-right font-medium">{t("billing.invoiceActions")}</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_INVOICES.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-border/60 transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 text-kyber-gray">{formatDate(invoice.date)}</td>
                    <td className="px-6 py-3.5 font-medium text-kyber-soft">{invoice.number}</td>
                    <td className="px-6 py-3.5 text-kyber-soft">{formatCurrency(invoice.amount)}</td>
                    <td className="px-6 py-3.5">
                      {invoice.status === "paid" ? (
                        <Badge tone="green">{t("billing.invoicePaid")}</Badge>
                      ) : (
                        <Badge tone="yellow">{t("billing.invoicePending")}</Badge>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toast("info", t("billing.downloadToast"), t("billing.downloadToastDesc", { number: invoice.number }))
                        }
                      >
                        <Download className="h-3.5 w-3.5" />
                        {t("billing.downloadInvoice")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      {/* Zona de cancelamento */}
      <Reveal className="mt-10">
        <Accordion title={t("billing.cancelZoneTitle")}>
          <p className="font-medium text-kyber-soft">{t("billing.cancelWarnIntro")}</p>
          <ul className="mt-2 space-y-1.5">
            {[
              t("billing.cancelWarn1"),
              t("billing.cancelWarn2"),
              t("billing.cancelWarn3"),
              t("billing.cancelWarn4"),
            ].map((warn) => (
              <li key={warn} className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" />
                {warn}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-kyber-dim">
            {t("billing.cancelAccessUntil", { date: formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd) })}
          </p>
          <Button variant="danger" size="sm" className="mt-4" onClick={() => setCancelOpen(true)}>
            {t("billing.cancelButton")}
          </Button>
        </Accordion>
      </Reveal>

      {/* Modal de mudança de plano */}
      <Modal
        open={changeTarget !== null}
        onClose={() => setChangeTarget(null)}
        title={
          changeTarget
            ? isUpgrade(changeTarget)
              ? t("billing.upgradeModalTitle", { plan: changeTarget.name })
              : t("billing.downgradeModalTitle", { plan: changeTarget.name })
            : undefined
        }
        description={t("billing.changeModalDescription")}
      >
        {changeTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wider text-kyber-dim">{t("billing.changeFrom")}</p>
                <p className="mt-1 font-display text-lg font-semibold text-kyber-white">{currentPlan.name}</p>
                <p className="text-sm text-kyber-gray">
                  {formatCurrency(priceFor(currentPlan))}
                  {cycle === "monthly" ? t("billing.perMonth") : t("billing.perYear")}
                </p>
              </div>
              <div className="rounded-xl border border-kyber-green/30 bg-kyber-green/[0.06] p-4">
                <p className="text-xs uppercase tracking-wider text-kyber-dim">{t("billing.changeTo")}</p>
                <p className="mt-1 font-display text-lg font-semibold text-kyber-green">{changeTarget.name}</p>
                <p className="text-sm text-kyber-gray">
                  {formatCurrency(priceFor(changeTarget))}
                  {cycle === "monthly" ? t("billing.perMonth") : t("billing.perYear")}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white/[0.03] p-4">
              <p className="text-sm font-medium text-kyber-white">{t("billing.changeDiffTitle")}</p>
              <ul className="mt-2 space-y-1.5 text-sm text-kyber-gray">
                <li>{t("billing.diffUsers", { from: currentPlan.limits.users, to: changeTarget.limits.users })}</li>
                <li>{t("billing.diffPdfs", { from: currentPlan.limits.pdfsPerMonth, to: changeTarget.limits.pdfsPerMonth })}</li>
                <li>
                  {t("billing.diffConversations", {
                    from: currentPlan.limits.whatsappConversationsPerMonth.toLocaleString("pt-BR"),
                    to: changeTarget.limits.whatsappConversationsPerMonth.toLocaleString("pt-BR"),
                  })}
                </li>
                <li>
                  {t("billing.diffAiCredits", {
                    from: currentPlan.limits.aiCreditsPerMonth.toLocaleString("pt-BR"),
                    to: changeTarget.limits.aiCreditsPerMonth.toLocaleString("pt-BR"),
                  })}
                </li>
              </ul>
            </div>

            <div
              className={cn(
                "rounded-xl border p-4 text-sm",
                isUpgrade(changeTarget)
                  ? "border-kyber-green/25 bg-kyber-green/[0.06] text-kyber-soft"
                  : "border-amber-400/25 bg-amber-400/[0.06] text-kyber-soft"
              )}
            >
              <p>
                {isUpgrade(changeTarget)
                  ? t("billing.proRataUpgrade", { amount: formatCurrency(proRata), days: daysRemaining })
                  : t("billing.proRataDowngrade", { amount: formatCurrency(proRata), days: daysRemaining })}
              </p>
              <p className="mt-1.5 text-xs text-kyber-gray">
                {t("billing.newChargeInfo", {
                  date: formatDate(MOCK_SUBSCRIPTION.currentPeriodEnd),
                  amount: formatCurrency(priceFor(changeTarget)),
                })}
              </p>
              {!isUpgrade(changeTarget) && (
                <p className="mt-2 flex items-start gap-1.5 text-xs text-amber-300">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  {t("billing.downgradeWarning")}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="ghost" onClick={() => setChangeTarget(null)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={confirmPlanChange}>{t("billing.confirmChange")}</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de cancelamento (confirmação dupla) */}
      <Modal
        open={cancelOpen}
        onClose={() => {
          setCancelOpen(false);
          setCancelText("");
        }}
        title={t("billing.cancelModalTitle")}
        description={t("billing.cancelModalDescription")}
      >
        <div className="space-y-4">
          <Input
            label={t("billing.cancelInputLabel")}
            placeholder={t("billing.cancelInputPlaceholder")}
            value={cancelText}
            onChange={(e) => setCancelText(e.target.value)}
            autoComplete="off"
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                setCancelOpen(false);
                setCancelText("");
              }}
            >
              {t("billing.cancelKeepButton")}
            </Button>
            <Button
              variant="danger"
              disabled={cancelText.trim().toUpperCase() !== "CANCELAR"}
              onClick={confirmCancel}
            >
              {t("billing.cancelConfirmButton")}
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
