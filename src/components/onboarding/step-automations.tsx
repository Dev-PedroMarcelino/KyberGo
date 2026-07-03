"use client";

/** Etapa 7 — Automações: intervalo de manutenção, template de follow-up e prévia do calendário. */

import React, { useMemo, useRef } from "react";
import { CalendarDays, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { MOCK_SCHEDULED_MESSAGES } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { StepHeader } from "./shared";
import type { MaintenanceInterval, StepProps } from "./types";

const TEMPLATE_VARIABLES = ["customer_name", "company_name", "service_name", "seller_name"];

/** Mini-calendário do mês de demonstração (julho/2026) com dots nos dias com mensagens. */
function CalendarPreview({ dimmed }: { dimmed: boolean }) {
  const { t } = useI18n();

  // Dias com mensagens agendadas — derivados dos mocks (parse por string, sem fuso).
  const dotDays = useMemo(() => {
    const days = MOCK_SCHEDULED_MESSAGES.filter(
      (m) => m.status === "scheduled" && m.scheduledFor.startsWith("2026-07")
    ).map((m) => Number(m.scheduledFor.slice(8, 10)));
    return new Set(days);
  }, []);

  const firstWeekday = new Date(2026, 6, 1).getDay();
  const daysInMonth = 31;
  const weekdays = t("onboarding.calendarWeekdays").split(" ");

  return (
    <div className={cn("rounded-xl border border-border bg-white/[0.03] p-4 transition-opacity", dimmed && "opacity-50")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-medium text-kyber-soft">
          <CalendarDays className="h-4 w-4 text-kyber-green" />
          {t("onboarding.calendarMonth")}
        </p>
        <Badge tone="green">{t("onboarding.scheduledCount", { count: dotDays.size })}</Badge>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, i) => (
          <span key={`${day}-${i}`} className="py-1 text-[10px] font-semibold uppercase text-kyber-dim">
            {day}
          </span>
        ))}
        {Array.from({ length: firstWeekday }, (_, i) => (
          <span key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const hasMessage = dotDays.has(day);
          return (
            <span
              key={day}
              className={cn(
                "relative flex h-8 flex-col items-center justify-center rounded-lg text-xs",
                hasMessage ? "bg-kyber-green/10 font-semibold text-kyber-green" : "text-kyber-gray"
              )}
            >
              {day}
              {hasMessage && <span className="absolute bottom-1 h-1 w-1 rounded-full bg-kyber-green" />}
            </span>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-kyber-dim">{t("onboarding.calendarHint")}</p>
    </div>
  );
}

export function StepAutomations({ data, update }: StepProps) {
  const { t } = useI18n();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    const token = `{{${variable}}}`;
    const el = textareaRef.current;
    const text = data.followUpTemplate;
    if (!el) {
      update({ followUpTemplate: text + token });
      return;
    }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? start;
    update({ followUpTemplate: text.slice(0, start) + token + text.slice(end) });
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + token.length;
      el.setSelectionRange(pos, pos);
    });
  };

  const intervalOptions = [
    { value: "3", label: t("onboarding.interval3") },
    { value: "6", label: t("onboarding.interval6") },
    { value: "12", label: t("onboarding.interval12") },
  ];

  return (
    <div>
      <StepHeader title={t("onboarding.autoTitle")} subtitle={t("onboarding.autoSubtitle")} />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <Select
            label={t("onboarding.maintenanceIntervalLabel")}
            options={intervalOptions}
            value={data.maintenanceInterval}
            onChange={(e) => update({ maintenanceInterval: e.target.value as MaintenanceInterval })}
          />

          <div>
            <Textarea
              ref={textareaRef}
              label={t("onboarding.followUpLabel")}
              value={data.followUpTemplate}
              onChange={(e) => update({ followUpTemplate: e.target.value })}
              className="min-h-[130px]"
            />
            <p className="mt-2 text-xs text-kyber-dim">{t("onboarding.followUpHint")}</p>
            <p className="mt-3 text-xs font-medium uppercase tracking-wider text-kyber-dim">
              {t("onboarding.variablesLabel")}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="focus-ring inline-flex items-center gap-1 rounded-full border border-kyber-green/30 bg-kyber-green/10 px-2.5 py-1 font-mono text-[11px] text-kyber-green transition-all hover:border-kyber-green/60 hover:bg-kyber-green/20 active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <Switch
              checked={data.autoMessages}
              onChange={(v) => update({ autoMessages: v })}
              label={t("onboarding.autoMessagesLabel")}
            />
            <p className="ml-14 mt-1 text-xs text-kyber-dim">{t("onboarding.autoMessagesHint")}</p>
          </div>

          <div className="rounded-xl border border-border bg-white/[0.03] p-4">
            <Switch
              checked={data.optOutEnabled}
              onChange={(v) => update({ optOutEnabled: v })}
              label={t("onboarding.optOutLabel")}
            />
            <p className="ml-14 mt-1 text-xs text-kyber-dim">{t("onboarding.optOutHint")}</p>
          </div>

          <CalendarPreview dimmed={!data.autoMessages} />
        </div>
      </div>
    </div>
  );
}
