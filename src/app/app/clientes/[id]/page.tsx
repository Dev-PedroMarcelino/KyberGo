"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarClock,
  FileText,
  History,
  Mail,
  MapPin,
  MessageCircle,
  MessagesSquare,
  Play,
  Sparkles,
  StickyNote,
  Wallet,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, EmptyState, Switch, Tabs, MetricCard } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_CONVERSATIONS, MOCK_CUSTOMERS, MOCK_QUOTES, MOCK_SCHEDULED_MESSAGES } from "@/lib/mock/data";
import type { ConversationLog, QuoteStatus, ScheduledMessageStatus } from "@/lib/types";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

/** Data de referência do modo demo (os mocks são ancorados nela). */
const DEMO_TODAY = new Date("2026-07-03T12:00:00");

/** Aparência do badge por status de orçamento. */
const QUOTE_STATUS: Record<QuoteStatus, { tone: BadgeProps["tone"]; labelKey: string }> = {
  draft: { tone: "gray", labelKey: "customers.statusDraft" },
  sent: { tone: "blue", labelKey: "customers.statusSent" },
  viewed: { tone: "purple", labelKey: "customers.statusViewed" },
  negotiating: { tone: "yellow", labelKey: "customers.statusNegotiating" },
  accepted: { tone: "green", labelKey: "customers.statusAccepted" },
  rejected: { tone: "red", labelKey: "customers.statusRejected" },
  expired: { tone: "gray", labelKey: "customers.statusExpired" },
};

/** Título do evento de timeline conforme o status da mensagem agendada. */
const MESSAGE_EVENT_KEY: Record<ScheduledMessageStatus, string> = {
  scheduled: "customers.historyMsgScheduled",
  sent: "customers.historyMsgSent",
  cancelled: "customers.historyMsgCancelled",
  failed: "customers.historyMsgFailed",
};

/** Alturas fixas das barras do player fake (evita divergência de hidratação). */
const WAVEFORM = [35, 62, 44, 80, 55, 70, 40, 66, 50, 76, 46, 60, 38, 58, 42, 68, 52, 44, 62, 36];

function maintenanceInfo(dueDate: string | null): { kind: "overdue" | "soon" | "later"; days: number } | null {
  if (!dueDate) return null;
  const days = Math.ceil((new Date(dueDate).getTime() - DEMO_TODAY.getTime()) / 86_400_000);
  if (days < 0) return { kind: "overdue", days: Math.abs(days) };
  if (days <= 30) return { kind: "soon", days };
  return { kind: "later", days };
}

/* ---------------- Bolha de conversa ---------------- */

function ChatBubble({ log, senderName }: { log: ConversationLog; senderName: string }) {
  const { t } = useI18n();
  const inbound = log.direction === "inbound";

  return (
    <div className={cn("flex flex-col", inbound ? "items-start" : "items-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl border p-3.5 sm:max-w-[70%]",
          inbound
            ? "rounded-bl-md border-white/10 bg-white/[0.05]"
            : "rounded-br-md border-kyber-green/20 bg-kyber-green/10"
        )}
      >
        <p className={cn("mb-1 text-[11px] font-medium", inbound ? "text-kyber-gray" : "text-kyber-green")}>
          {inbound ? senderName : t("common.aiAssistant")}
        </p>

        {log.messageType === "audio" ? (
          <div className="min-w-[220px]">
            {/* Player fake da mensagem de voz */}
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kyber-green/20 text-kyber-green">
                <Play className="ml-0.5 h-4 w-4" />
              </span>
              <div className="flex h-8 flex-1 items-center gap-[3px]">
                {WAVEFORM.map((height, i) => (
                  <span
                    key={i}
                    className="w-[3px] rounded-full bg-kyber-green/50"
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <span className="shrink-0 text-[11px] text-kyber-dim">0:14</span>
            </div>
            {log.transcription && (
              <div className="mt-2.5 border-t border-white/10 pt-2.5">
                <p className="text-[10px] font-medium uppercase tracking-wide text-kyber-dim">
                  {t("customers.transcriptionLabel")}
                </p>
                <p className="mt-1 text-sm italic leading-relaxed text-kyber-gray">“{log.transcription}”</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-kyber-soft">{log.content}</p>
        )}

        {log.messageType === "pdf" && (
          <span className="mt-2.5 flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-kyber-soft">
            <FileText className="h-4 w-4 shrink-0 text-kyber-green" />
            {t("customers.attachmentPdf")}
          </span>
        )}
      </div>
      <p className="mt-1 px-1 text-[10px] text-kyber-dim">{formatDateTime(log.createdAt)}</p>
    </div>
  );
}

/* ---------------- Página ---------------- */

export default function CustomerProfilePage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  // Lookup no mock, com fallback para o primeiro cliente
  const customer = useMemo(
    () => MOCK_CUSTOMERS.find((c) => c.id === params?.id) ?? MOCK_CUSTOMERS[0],
    [params?.id]
  );

  const [automationEnabled, setAutomationEnabled] = useState(customer.automationEnabled);
  const [notes, setNotes] = useState(customer.notes ?? "");
  const [maintenanceDate, setMaintenanceDate] = useState(customer.maintenanceDueDate?.slice(0, 10) ?? "");
  const [tab, setTab] = useState("history");

  // Reinicia o estado editável ao trocar de cliente
  useEffect(() => {
    setAutomationEnabled(customer.automationEnabled);
    setNotes(customer.notes ?? "");
    setMaintenanceDate(customer.maintenanceDueDate?.slice(0, 10) ?? "");
    setTab("history");
  }, [customer]);

  const quotes = useMemo(
    () =>
      MOCK_QUOTES.filter((q) => q.customerId === customer.id).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [customer.id]
  );
  const conversations = useMemo(
    () => MOCK_CONVERSATIONS.filter((c) => c.customerId === customer.id),
    [customer.id]
  );
  const totalSpent = quotes.filter((q) => q.status === "accepted").reduce((sum, q) => sum + q.total, 0);

  const maintenanceIso = maintenanceDate ? `${maintenanceDate}T00:00:00` : null;
  const maintenance = maintenanceInfo(maintenanceIso);

  /** Timeline: orçamentos + mensagens agendadas, do mais recente para o mais antigo. */
  const timeline = useMemo(() => {
    const quoteEvents = quotes.map((q) => ({
      id: q.id,
      date: q.createdAt,
      title: t("customers.historyQuoteCreated", { number: q.number }),
      description: `${q.title} — ${formatCurrency(q.total)}`,
    }));
    const messageEvents = MOCK_SCHEDULED_MESSAGES.filter((m) => m.customerId === customer.id).map((m) => ({
      id: m.id,
      date: m.scheduledFor,
      title: t(MESSAGE_EVENT_KEY[m.status]),
      description: m.cancelledReason ?? m.message,
    }));
    return [...quoteEvents, ...messageEvents].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [quotes, customer.id, t]);

  function toggleAutomation(enabled: boolean) {
    setAutomationEnabled(enabled);
    toast(
      enabled ? "success" : "info",
      enabled ? t("customers.automationOnToast") : t("customers.automationOffToast"),
      t(enabled ? "customers.automationOnToastDesc" : "customers.automationOffToastDesc", { name: customer.name })
    );
  }

  const tabs = [
    { value: "history", label: t("customers.tabHistory"), icon: <History className="h-4 w-4" /> },
    { value: "quotes", label: t("customers.tabQuotes"), icon: <FileText className="h-4 w-4" /> },
    { value: "conversations", label: t("customers.tabConversations"), icon: <MessagesSquare className="h-4 w-4" /> },
    { value: "notes", label: t("customers.tabNotes"), icon: <StickyNote className="h-4 w-4" /> },
  ];

  return (
    <PageTransition>
      <Link
        href="/app/clientes"
        className="focus-ring mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm text-kyber-gray transition-colors hover:text-kyber-soft"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("customers.backToList")}
      </Link>

      {/* Cabeçalho do perfil */}
      <div className="glass-card p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <Avatar name={customer.name} className="h-16 w-16 shrink-0 text-xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display text-2xl font-bold text-kyber-white">{customer.name}</h1>
                {customer.tags.map((tag) => (
                  <Badge key={tag} tone="green">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="mt-1 text-xs text-kyber-dim">
                {t("customers.customerSince", { date: formatDate(customer.createdAt) })}
              </p>
              <div className="mt-3 space-y-1.5 text-sm text-kyber-gray">
                <p className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 shrink-0 text-kyber-green" />
                  {customer.phone}
                </p>
                {customer.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 shrink-0 text-kyber-green" />
                    <span className="truncate">{customer.email}</span>
                  </p>
                )}
                {customer.address && (
                  <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-kyber-green" />
                    {customer.address}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="secondary"
                onClick={() => toast("success", t("customers.whatsappToast"), t("customers.whatsappToastDesc", { name: customer.name }))}
              >
                <MessageCircle className="h-4 w-4" />
                {t("customers.sendWhatsApp")}
              </Button>
              <Button onClick={() => router.push("/app/orcamentos/inteligente")}>
                <Sparkles className="h-4 w-4" />
                {t("customers.newQuote")}
              </Button>
            </div>
            <Switch checked={automationEnabled} onChange={toggleAutomation} label={t("customers.automationSwitch")} />
          </div>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label={t("customers.totalSpent")}
          value={formatCurrency(totalSpent)}
          icon={<Wallet className="h-4 w-4" />}
          footer={<p className="text-xs text-kyber-dim">{t("customers.totalSpentHint")}</p>}
        />
        <MetricCard
          label={t("customers.quotesReceived")}
          value={quotes.length}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          label={t("customers.lastService")}
          value={customer.lastServiceDate ? formatDate(customer.lastServiceDate) : "—"}
          icon={<History className="h-4 w-4" />}
        />
        <MetricCard
          label={t("customers.nextMaintenance")}
          value={maintenanceIso ? formatDate(maintenanceIso) : "—"}
          icon={<CalendarClock className="h-4 w-4" />}
          footer={
            maintenance && maintenance.kind !== "later" ? (
              <Badge tone={maintenance.kind === "overdue" ? "red" : "yellow"}>
                {maintenance.kind === "overdue"
                  ? t("customers.maintenanceOverdue", { days: maintenance.days })
                  : maintenance.days === 0
                    ? t("customers.maintenanceToday")
                    : t("customers.maintenanceDue", { days: maintenance.days })}
              </Badge>
            ) : undefined
          }
        />
      </div>

      {/* Abas de conteúdo */}
      <div className="mt-8">
        <Tabs items={tabs} value={tab} onChange={setTab} />

        <div className="mt-6">
          {/* Histórico */}
          {tab === "history" &&
            (timeline.length === 0 ? (
              <EmptyState
                icon={<History className="h-7 w-7" />}
                title={t("customers.historyEmptyTitle")}
                description={t("customers.historyEmptyDescription")}
              />
            ) : (
              <Card>
                <ol className="relative ml-1.5 space-y-7 border-l border-white/10 pl-6">
                  {timeline.map((event) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[30px] top-1.5 h-2.5 w-2.5 rounded-full bg-kyber-green shadow-glow-sm" />
                      <p className="text-xs text-kyber-dim">{formatDateTime(event.date)}</p>
                      <p className="mt-0.5 text-sm font-medium text-kyber-white">{event.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-sm text-kyber-gray">{event.description}</p>
                    </li>
                  ))}
                </ol>
              </Card>
            ))}

          {/* Orçamentos */}
          {tab === "quotes" &&
            (quotes.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-7 w-7" />}
                title={t("customers.quotesEmptyTitle")}
                description={t("customers.quotesEmptyDescription")}
              />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-kyber-dim">
                        <th className="px-5 py-3.5 font-medium">{t("customers.quotesTableNumber")}</th>
                        <th className="hidden px-5 py-3.5 font-medium md:table-cell">
                          {t("customers.quotesTableTitle")}
                        </th>
                        <th className="px-5 py-3.5 font-medium">{t("customers.quotesTableValue")}</th>
                        <th className="px-5 py-3.5 font-medium">{t("customers.quotesTableStatus")}</th>
                        <th className="px-5 py-3.5" />
                      </tr>
                    </thead>
                    <tbody>
                      {quotes.map((quote) => (
                        <tr key={quote.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.03]">
                          <td className="whitespace-nowrap px-5 py-3.5 font-medium text-kyber-white">{quote.number}</td>
                          <td className="hidden max-w-[280px] truncate px-5 py-3.5 text-kyber-gray md:table-cell">
                            {quote.title}
                          </td>
                          <td className="whitespace-nowrap px-5 py-3.5 text-kyber-soft">{formatCurrency(quote.total)}</td>
                          <td className="px-5 py-3.5">
                            <Badge tone={QUOTE_STATUS[quote.status].tone}>{t(QUOTE_STATUS[quote.status].labelKey)}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/app/orcamentos/${quote.id}`}
                              aria-label={t("customers.quotesTableOpen")}
                              className="focus-ring inline-flex rounded-lg p-1.5 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-green"
                            >
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ))}

          {/* Conversas */}
          {tab === "conversations" &&
            (conversations.length === 0 ? (
              <EmptyState
                icon={<MessagesSquare className="h-7 w-7" />}
                title={t("customers.conversationsEmptyTitle")}
                description={t("customers.conversationsEmptyDescription")}
              />
            ) : (
              <Card>
                <div className="mx-auto flex max-w-2xl flex-col gap-3">
                  {conversations.map((log) => (
                    <ChatBubble key={log.id} log={log} senderName={customer.name} />
                  ))}
                </div>
              </Card>
            ))}

          {/* Notas */}
          {tab === "notes" && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <Card>
                <h3 className="font-display text-base font-semibold text-kyber-white">{t("customers.notesTitle")}</h3>
                <p className="mt-1 text-xs text-kyber-dim">{t("customers.notesHint")}</p>
                <Textarea
                  className="mt-4"
                  rows={6}
                  placeholder={t("customers.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="mt-4 flex justify-end">
                  <Button
                    onClick={() =>
                      toast("success", t("customers.notesSaved"), t("customers.notesSavedDesc", { name: customer.name }))
                    }
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </Card>

              <Card className="self-start">
                <h3 className="font-display text-base font-semibold text-kyber-white">
                  {t("customers.maintenanceCardTitle")}
                </h3>
                <p className="mt-1 text-xs text-kyber-dim">{t("customers.maintenanceHint")}</p>
                <div className="mt-4">
                  <Input
                    type="date"
                    label={t("customers.maintenanceDateLabel")}
                    value={maintenanceDate}
                    onChange={(e) => setMaintenanceDate(e.target.value)}
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <Button
                    disabled={!maintenanceDate}
                    onClick={() =>
                      toast(
                        "success",
                        t("customers.maintenanceSaved"),
                        t("customers.maintenanceSavedDesc", { date: formatDate(`${maintenanceDate}T00:00:00`) })
                      )
                    }
                  >
                    {t("common.save")}
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
