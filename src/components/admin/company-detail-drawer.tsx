"use client";

/**
 * Drawer de detalhes de uma empresa cliente no painel super admin:
 * assinatura, uso do plano, equipe, instância de WhatsApp, eventos e ações
 * (alterar plano, bloquear, desconectar, entrar como empresa).
 */

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  CreditCard,
  FileText,
  Lock,
  LockOpen,
  LogIn,
  MessageCircle,
  PlugZap,
  Unplug,
  UsersRound,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { MOCK_PLANS } from "@/lib/mock/data";
import { startImpersonation } from "@/lib/impersonation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { Avatar, Progress } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";

export type CompanyStatus = "trial" | "active" | "past_due" | "blocked";

export interface AdminCompany {
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

export const STATUS_META: Record<CompanyStatus, { tone: BadgeProps["tone"]; labelKey: string }> = {
  trial: { tone: "blue", labelKey: "admin.statusTrial" },
  active: { tone: "green", labelKey: "admin.statusActive" },
  past_due: { tone: "yellow", labelKey: "admin.statusPastDue" },
  blocked: { tone: "red", labelKey: "admin.statusBlocked" },
};

/** Hash simples e determinístico para derivar números de exemplo por empresa. */
function seedFrom(id: string) {
  let h = 0;
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  return h;
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-kyber-dim">
      <span className="text-kyber-green">{icon}</span>
      {children}
    </p>
  );
}

export function CompanyDetailDrawer({
  company,
  onClose,
  onToggleBlock,
  onDisconnect,
  onChangePlan,
}: {
  company: AdminCompany | null;
  onClose: () => void;
  onToggleBlock: (company: AdminCompany) => void;
  onDisconnect: (company: AdminCompany) => void;
  onChangePlan: (company: AdminCompany, plan: string) => void;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState(company?.plan ?? "");

  React.useEffect(() => {
    setSelectedPlan(company?.plan ?? "");
  }, [company]);

  const derived = useMemo(() => {
    if (!company) return null;
    const seed = seedFrom(company.id);
    const planData = MOCK_PLANS.find((p) => p.name === company.plan);
    const userLimit = planData?.limits.users ?? 5;
    const usersCount = Math.max(1, Math.min(userLimit, 1 + (seed % 4)));
    const convLimit = planData?.limits.whatsappConversationsPerMonth ?? 100;
    return {
      planData,
      monthlyPrice: planData?.monthlyPrice ?? 0,
      usersCount,
      userLimit,
      conversationsUsed: company.whatsappConnected ? (seed * 7) % Math.max(convLimit, 1) : 0,
      conversationsLimit: convLimit,
      quotesThisWeek: 2 + (seed % 9),
      team: [
        { name: `${company.name.split(" ")[0]} Admin`, roleKey: "admin.roleOwner", tone: "green" as const },
        ...(usersCount > 1 ? [{ name: "Equipe Comercial", roleKey: "admin.roleSeller", tone: "gray" as const }] : []),
      ],
    };
  }, [company]);

  const impersonate = () => {
    if (!company) return;
    startImpersonation(company.id, company.name);
    toast("info", t("admin.impersonationToast"), t("admin.impersonationToastDescription", { name: company.name }));
    onClose();
    router.push("/app");
  };

  const applyPlanChange = () => {
    if (!company || !selectedPlan || selectedPlan === company.plan) return;
    onChangePlan(company, selectedPlan);
    toast("success", t("admin.planChangedToast"), t("admin.planChangedToastDescription", { name: company.name, plan: selectedPlan }));
  };

  const statusMeta = company ? STATUS_META[company.status] : null;

  return (
    <Modal
      drawer
      open={Boolean(company)}
      onClose={onClose}
      title={company?.name}
      description={company ? `${company.segment} · ${t("admin.detailSince", { date: formatDate(company.createdAt, locale) })}` : undefined}
    >
      {company && derived && statusMeta && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={statusMeta.tone} dot>{t(statusMeta.labelKey)}</Badge>
            <Badge tone={company.whatsappConnected ? "green" : "gray"}>
              {company.whatsappConnected ? t("admin.waConnected") : t("admin.waDisconnected")}
            </Badge>
          </div>

          {/* Assinatura */}
          <section className="space-y-3">
            <SectionTitle icon={<CreditCard className="h-3.5 w-3.5" />}>{t("admin.detailSubscription")}</SectionTitle>
            <div className="rounded-xl border border-border bg-white/[0.03] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-kyber-white">{company.plan}</p>
                  <p className="mt-0.5 text-xs text-kyber-gray">
                    {derived.monthlyPrice > 0
                      ? `${formatCurrency(derived.monthlyPrice, locale)}${t("common.perMonth")}`
                      : t("landing.customPricing")}
                  </p>
                </div>
                <CalendarDays className="h-4 w-4 text-kyber-dim" />
              </div>
              <div className="mt-3 flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label={t("admin.detailChangePlan")}
                    options={MOCK_PLANS.map((p) => ({ value: p.name, label: p.name }))}
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                  />
                </div>
                <Button variant="secondary" size="md" onClick={applyPlanChange} disabled={selectedPlan === company.plan}>
                  {t("common.save")}
                </Button>
              </div>
            </div>
          </section>

          {/* Uso do plano */}
          <section className="space-y-3">
            <SectionTitle icon={<FileText className="h-3.5 w-3.5" />}>{t("admin.detailUsage")}</SectionTitle>
            <div className="space-y-3 rounded-xl border border-border bg-white/[0.03] p-4">
              {[
                {
                  label: t("admin.detailPdfs"),
                  used: company.pdfsUsed,
                  limit: company.pdfsLimit,
                  icon: <FileText className="h-3.5 w-3.5" />,
                },
                {
                  label: t("admin.detailConversations"),
                  used: derived.conversationsUsed,
                  limit: derived.conversationsLimit,
                  icon: <MessageCircle className="h-3.5 w-3.5" />,
                },
                {
                  label: t("admin.detailUsers"),
                  used: derived.usersCount,
                  limit: derived.userLimit,
                  icon: <UsersRound className="h-3.5 w-3.5" />,
                },
              ].map((item) => {
                const unlimited = item.limit <= 0 || item.limit >= 99999;
                const pct = unlimited ? 8 : (item.used / item.limit) * 100;
                return (
                  <div key={item.label}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-kyber-gray">
                        {item.icon}
                        {item.label}
                      </span>
                      <span className="tabular-nums text-kyber-soft">
                        {item.used.toLocaleString(locale)}
                        <span className="text-kyber-dim">/{unlimited ? t("admin.unlimited") : item.limit.toLocaleString(locale)}</span>
                      </span>
                    </div>
                    <Progress value={pct} tone={pct > 90 ? "red" : pct > 75 ? "yellow" : "green"} />
                  </div>
                );
              })}
            </div>
          </section>

          {/* Equipe */}
          <section className="space-y-3">
            <SectionTitle icon={<UsersRound className="h-3.5 w-3.5" />}>{t("admin.detailTeam")}</SectionTitle>
            <ul className="space-y-2">
              {derived.team.map((member) => (
                <li key={member.name} className="flex items-center gap-3 rounded-xl border border-border bg-white/[0.03] px-3.5 py-2.5">
                  <Avatar name={member.name} className="h-8 w-8 text-[10px]" />
                  <p className="flex-1 text-sm text-kyber-soft">{member.name}</p>
                  <Badge tone={member.tone}>{t(member.roleKey)}</Badge>
                </li>
              ))}
            </ul>
          </section>

          {/* Eventos recentes */}
          <section className="space-y-3">
            <SectionTitle icon={<PlugZap className="h-3.5 w-3.5" />}>{t("admin.detailEvents")}</SectionTitle>
            <ul className="space-y-2 text-sm text-kyber-gray">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-kyber-green" />
                {t("admin.detailEventQuotes", { count: derived.quotesThisWeek })}
              </li>
              <li className="flex items-start gap-2">
                <span className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", company.whatsappConnected ? "bg-kyber-green" : "bg-red-400")} />
                {company.whatsappConnected ? t("admin.detailEventConnected") : t("admin.detailEventDisconnected")}
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                {company.status === "past_due" || company.status === "blocked"
                  ? t("admin.detailEventInvoiceFailed")
                  : t("admin.detailEventInvoicePaid")}
              </li>
            </ul>
          </section>

          {/* Ações */}
          <section className="space-y-2.5 border-t border-border pt-5">
            <Button size="lg" className="w-full" onClick={impersonate}>
              <LogIn className="h-4 w-4" />
              {t("admin.impersonate")}
            </Button>
            <p className="text-center text-[11px] text-kyber-dim">{t("admin.impersonateHint")}</p>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button variant="secondary" onClick={() => onToggleBlock(company)}>
                {company.status === "blocked" ? (
                  <>
                    <LockOpen className="h-4 w-4" /> {t("admin.actionUnblock")}
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> {t("admin.actionBlock")}
                  </>
                )}
              </Button>
              <Button variant="danger" onClick={() => onDisconnect(company)} disabled={!company.whatsappConnected}>
                <Unplug className="h-4 w-4" /> {t("admin.actionDisconnect")}
              </Button>
            </div>
          </section>
        </div>
      )}
    </Modal>
  );
}
