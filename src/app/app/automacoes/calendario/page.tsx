"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CalendarDays,
  CalendarX2,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Send,
  XCircle,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MOCK_AUTOMATION_RULES, MOCK_CUSTOMERS, MOCK_SCHEDULED_MESSAGES } from "@/lib/mock/data";
import type { ScheduledMessage, ScheduledMessageStatus } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { Avatar, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";

/** Data de referência do modo demo ("hoje"). */
const TODAY = new Date(2026, 6, 3);

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Converte um ISO em valor aceito por <input type="datetime-local">. */
function toLocalInputValue(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const STATUS_TONE: Record<ScheduledMessageStatus, "green" | "gray" | "red" | "yellow"> = {
  scheduled: "green",
  sent: "gray",
  cancelled: "red",
  failed: "yellow",
};

const CHIP_CLASSES: Record<ScheduledMessageStatus, string> = {
  scheduled: "border-kyber-green/25 bg-kyber-green/15 text-kyber-green",
  sent: "border-white/10 bg-white/8 text-kyber-gray",
  cancelled: "border-red-500/25 bg-red-500/10 text-red-400 line-through",
  failed: "border-amber-400/25 bg-amber-400/10 text-amber-300",
};

const DOT_CLASSES: Record<ScheduledMessageStatus, string> = {
  scheduled: "bg-kyber-green",
  sent: "bg-kyber-gray",
  cancelled: "bg-red-400",
  failed: "bg-amber-300",
};

type ActionMode = { id: string; mode: "cancel" | "reschedule" } | null;

export default function CalendarioPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [messages, setMessages] = useState<ScheduledMessage[]>(MOCK_SCHEDULED_MESSAGES);
  const [currentMonth, setCurrentMonth] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [action, setAction] = useState<ActionMode>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [rescheduleValue, setRescheduleValue] = useState("");

  const customerName = (id: string) => MOCK_CUSTOMERS.find((c) => c.id === id)?.name ?? t("automations.calUnknownCustomer");
  const ruleName = (id: string | null) => (id ? MOCK_AUTOMATION_RULES.find((r) => r.id === id)?.name : undefined);

  const formatTime = (iso: string) =>
    new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));

  /* ---- Grade do mês (date math nativo) ---- */
  const cells = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startWeekday = new Date(year, month, 1).getDay(); // 0 = domingo
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const list: { date: Date; inMonth: boolean }[] = [];
    for (let i = startWeekday; i > 0; i--) list.push({ date: new Date(year, month, 1 - i), inMonth: false });
    for (let d = 1; d <= daysInMonth; d++) list.push({ date: new Date(year, month, d), inMonth: true });
    while (list.length % 7 !== 0) {
      const last = list[list.length - 1].date;
      list.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }
    return list;
  }, [currentMonth]);

  /** Mensagens agrupadas por dia (chave YYYY-MM-DD), ordenadas por horário. */
  const byDay = useMemo(() => {
    const map = new Map<string, ScheduledMessage[]>();
    for (const msg of messages) {
      const key = dayKey(new Date(msg.scheduledFor));
      const list = map.get(key) ?? [];
      list.push(msg);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
    }
    return map;
  }, [messages]);

  const weekdays = useMemo(() => {
    // 07/06/2026 é um domingo — base para os rótulos localizados dos dias da semana.
    const fmt = new Intl.DateTimeFormat(locale, { weekday: "short" });
    return Array.from({ length: 7 }, (_, i) => fmt.format(new Date(2026, 5, 7 + i)));
  }, [locale]);

  const monthLabel = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(currentMonth);

  const counters = useMemo(
    () => ({
      scheduled: messages.filter((m) => m.status === "scheduled").length,
      sent: messages.filter((m) => m.status === "sent").length,
      cancelled: messages.filter((m) => m.status === "cancelled").length,
    }),
    [messages]
  );

  const upcoming = useMemo(
    () =>
      messages
        .filter((m) => m.status === "scheduled")
        .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
    [messages]
  );

  const dayMessages = selectedDay ? byDay.get(selectedDay) ?? [] : [];
  const selectedDayLabel = useMemo(() => {
    if (!selectedDay) return "";
    const [y, m, d] = selectedDay.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, { weekday: "long", day: "2-digit", month: "long" }).format(
      new Date(y, m - 1, d)
    );
  }, [selectedDay, locale]);

  const shiftMonth = (delta: number) =>
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  const closeDrawer = () => {
    setSelectedDay(null);
    setAction(null);
    setCancelReason("");
  };

  /* ---- Ações sobre mensagens ---- */
  const startCancel = (msg: ScheduledMessage) => {
    setAction({ id: msg.id, mode: "cancel" });
    setCancelReason("");
  };

  const confirmCancel = (msg: ScheduledMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: "cancelled", cancelledReason: cancelReason.trim() } : m))
    );
    setAction(null);
    setCancelReason("");
    toast("warning", t("automations.calCancelledToast"), t("automations.calCancelledToastDescription"));
  };

  const startReschedule = (msg: ScheduledMessage) => {
    setAction({ id: msg.id, mode: "reschedule" });
    setRescheduleValue(toLocalInputValue(msg.scheduledFor));
  };

  const confirmReschedule = (msg: ScheduledMessage) => {
    const next = new Date(rescheduleValue);
    if (Number.isNaN(next.getTime())) return;
    const iso = next.toISOString();
    setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, scheduledFor: iso } : m)));
    setAction(null);
    // Mantém o painel coerente: acompanha a mensagem para o novo dia.
    setSelectedDay(dayKey(next));
    toast("success", t("automations.calRescheduledToast"), t("automations.calRescheduledToastDescription", { date: formatDateTime(iso, locale) }));
  };

  const sendNow = (msg: ScheduledMessage) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, status: "sent", scheduledFor: new Date().toISOString() } : m))
    );
    setAction(null);
    toast("success", t("automations.calSendNowToast"), t("automations.calSendNowToastDescription"));
  };

  const openDay = (msg: ScheduledMessage) => {
    const date = new Date(msg.scheduledFor);
    setCurrentMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelectedDay(dayKey(date));
  };

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/app/automacoes")}
            className="focus-ring mb-2 inline-flex items-center gap-1.5 rounded-lg text-xs font-medium text-kyber-gray transition-colors hover:text-kyber-green"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("automations.calBack")}
          </button>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("automations.calTitle")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("automations.calSubtitle")}</p>
        </div>

        {/* Legenda + contadores */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { status: "scheduled" as const, label: t("automations.calScheduled"), count: counters.scheduled },
              { status: "sent" as const, label: t("automations.calSent"), count: counters.sent },
              { status: "cancelled" as const, label: t("automations.calCancelled"), count: counters.cancelled },
            ]
          ).map((item) => (
            <span
              key={item.status}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 text-xs text-kyber-gray"
            >
              <span className={cn("h-2 w-2 rounded-full", DOT_CLASSES[item.status])} />
              {item.label}
              <span className="font-semibold text-kyber-soft">{item.count}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Calendário */}
      <GlassCard hover={false} className="p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-base font-semibold capitalize text-kyber-white sm:text-lg">{monthLabel}</h2>
          <div className="flex items-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1))}
            >
              {t("common.today")}
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" aria-label={t("automations.calPrevMonth")} onClick={() => shiftMonth(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8" aria-label={t("automations.calNextMonth")} onClick={() => shiftMonth(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {weekdays.map((day) => (
            <div key={day} className="pb-2 text-center text-[11px] font-medium uppercase tracking-wide text-kyber-dim">
              {day}
            </div>
          ))}

          {cells.map(({ date, inMonth }) => {
            const key = dayKey(date);
            const dayList = byDay.get(key) ?? [];
            const isToday = key === dayKey(TODAY);
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(key)}
                className={cn(
                  "focus-ring flex min-h-[58px] flex-col items-stretch gap-1 rounded-lg border p-1 text-left transition-colors sm:min-h-[96px] sm:rounded-xl sm:p-1.5",
                  inMonth ? "border-border bg-white/[0.02] hover:border-kyber-green/40 hover:bg-white/[0.05]" : "border-transparent bg-transparent opacity-40 hover:opacity-60",
                  isToday && "ring-2 ring-kyber-green/70"
                )}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs",
                    isToday ? "bg-kyber-green font-bold text-kyber-black" : inMonth ? "text-kyber-soft" : "text-kyber-dim"
                  )}
                >
                  {date.getDate()}
                </span>

                {/* Chips (telas maiores) */}
                {dayList.length > 0 && (
                  <span className="hidden flex-col gap-1 sm:flex">
                    {dayList.slice(0, 2).map((msg) => (
                      <span
                        key={msg.id}
                        className={cn("truncate rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-tight", CHIP_CLASSES[msg.status])}
                      >
                        {formatTime(msg.scheduledFor)} {customerName(msg.customerId)}
                      </span>
                    ))}
                    {dayList.length > 2 && (
                      <span className="text-[10px] font-medium text-kyber-dim">
                        {t("automations.calMoreChip", { count: dayList.length - 2 })}
                      </span>
                    )}
                  </span>
                )}

                {/* Pontos coloridos (mobile) */}
                {dayList.length > 0 && (
                  <span className="flex flex-wrap gap-1 px-0.5 sm:hidden">
                    {dayList.slice(0, 4).map((msg) => (
                      <span key={msg.id} className={cn("h-1.5 w-1.5 rounded-full", DOT_CLASSES[msg.status])} />
                    ))}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      {/* Próximas mensagens */}
      <h2 className="mb-4 mt-8 font-display text-lg font-semibold text-kyber-white">{t("automations.calUpcomingTitle")}</h2>
      {upcoming.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-7 w-7" />}
          title={t("automations.calUpcomingEmpty")}
          description={t("automations.calSubtitle")}
        />
      ) : (
        <GlassCard hover={false} className="divide-y divide-border !p-0">
          {upcoming.map((msg) => (
            <button
              key={msg.id}
              onClick={() => openDay(msg)}
              className="focus-ring flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.04] sm:px-5"
            >
              <Avatar name={customerName(msg.customerId)} className="h-9 w-9 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <span className="text-sm font-medium text-kyber-white">{customerName(msg.customerId)}</span>
                  <span className="text-xs text-kyber-dim">{formatDateTime(msg.scheduledFor, locale)}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-kyber-gray">{msg.message}</span>
              </span>
              <Badge tone={STATUS_TONE[msg.status]} className="shrink-0">
                {t(`automations.calStatus${msg.status.charAt(0).toUpperCase()}${msg.status.slice(1)}`)}
              </Badge>
            </button>
          ))}
        </GlassCard>
      )}

      {/* Painel lateral do dia */}
      <Modal drawer open={selectedDay !== null} onClose={closeDrawer} title={t("automations.calDrawerTitle")} description={selectedDayLabel}>
        {dayMessages.length === 0 ? (
          <EmptyState
            icon={<CalendarX2 className="h-7 w-7" />}
            title={t("automations.calNoMessages")}
            description={t("automations.calSubtitle")}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {dayMessages.map((msg) => {
              const origin = ruleName(msg.ruleId);
              const isCancelling = action?.id === msg.id && action.mode === "cancel";
              const isRescheduling = action?.id === msg.id && action.mode === "reschedule";
              return (
                <div key={msg.id} className="rounded-xl border border-border bg-white/[0.03] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar name={customerName(msg.customerId)} className="h-8 w-8 shrink-0 text-[10px]" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-kyber-white">{customerName(msg.customerId)}</p>
                        <p className="flex items-center gap-1 text-xs text-kyber-dim">
                          <CalendarClock className="h-3 w-3" />
                          {formatTime(msg.scheduledFor)}
                        </p>
                      </div>
                    </div>
                    <Badge tone={STATUS_TONE[msg.status]} className="shrink-0">
                      {t(`automations.calStatus${msg.status.charAt(0).toUpperCase()}${msg.status.slice(1)}`)}
                    </Badge>
                  </div>

                  <p className={cn("mt-3 whitespace-pre-wrap text-sm leading-relaxed text-kyber-soft", msg.status === "cancelled" && "text-kyber-dim line-through")}>
                    {msg.message}
                  </p>

                  <p className="mt-3 text-xs text-kyber-dim">
                    {origin ? t("automations.calRuleOrigin", { name: origin }) : t("automations.calManualOrigin")}
                  </p>
                  {msg.status === "cancelled" && msg.cancelledReason && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-red-400/90">
                      <XCircle className="mt-0.5 h-3 w-3 shrink-0" />
                      {t("automations.calCancelReasonShown", { reason: msg.cancelledReason })}
                    </p>
                  )}

                  {msg.status === "scheduled" && (
                    <div className="mt-4 border-t border-border pt-3">
                      {isCancelling ? (
                        <div className="flex flex-col gap-3">
                          <Textarea
                            label={t("automations.calCancelReasonLabel")}
                            placeholder={t("automations.calCancelReasonPlaceholder")}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            className="min-h-[72px]"
                          />
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setAction(null)}>
                              {t("common.back")}
                            </Button>
                            <Button variant="danger" size="sm" className="flex-1" disabled={cancelReason.trim().length === 0} onClick={() => confirmCancel(msg)}>
                              {t("automations.calCancelConfirm")}
                            </Button>
                          </div>
                        </div>
                      ) : isRescheduling ? (
                        <div className="flex flex-col gap-3">
                          <div>
                            <label className="mb-1.5 block text-sm font-medium text-kyber-soft">
                              {t("automations.calRescheduleLabel")}
                            </label>
                            <input
                              type="datetime-local"
                              value={rescheduleValue}
                              onChange={(e) => setRescheduleValue(e.target.value)}
                              className="focus-ring h-11 w-full rounded-xl border border-border bg-white/[0.04] px-4 text-sm text-kyber-soft [color-scheme:dark]"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setAction(null)}>
                              {t("common.back")}
                            </Button>
                            <Button size="sm" className="flex-1" disabled={rescheduleValue.length === 0} onClick={() => confirmReschedule(msg)}>
                              {t("automations.calRescheduleConfirm")}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" onClick={() => sendNow(msg)}>
                            <Send className="h-3.5 w-3.5" />
                            {t("automations.calSendNowAction")}
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => startReschedule(msg)}>
                            <CalendarClock className="h-3.5 w-3.5" />
                            {t("automations.calRescheduleAction")}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10 hover:text-red-400" onClick={() => startCancel(msg)}>
                            <XCircle className="h-3.5 w-3.5" />
                            {t("automations.calCancelAction")}
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {msg.status === "sent" && (
                    <p className="mt-3 flex items-center gap-1.5 border-t border-border pt-3 text-xs text-kyber-dim">
                      <CheckCheck className="h-3.5 w-3.5 text-sky-300" />
                      {formatDateTime(msg.scheduledFor, locale)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}
