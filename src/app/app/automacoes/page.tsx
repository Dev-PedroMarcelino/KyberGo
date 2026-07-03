"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  Clock,
  Copy,
  Handshake,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Plus,
  Send,
  ThumbsUp,
  Trash2,
  TriangleAlert,
  Wrench,
  Zap,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MOCK_AUTOMATION_RULES, MOCK_MESSAGE_TEMPLATES, MOCK_SCHEDULED_MESSAGES } from "@/lib/mock/data";
import type { AutomationRule, AutomationTrigger } from "@/lib/types";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { Dropdown, DropdownItem, EmptyState, MetricCard, Switch } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { renderTemplatePreview, WhatsAppBubble } from "@/components/automations/whatsapp-preview";

const TRIGGERS: AutomationTrigger[] = [
  "quote_sent",
  "quote_accepted",
  "deal_won",
  "maintenance_due",
  "no_response",
  "custom_date",
];

const TRIGGER_ICONS: Record<AutomationTrigger, React.ReactNode> = {
  quote_sent: <Send className="h-5 w-5" />,
  quote_accepted: <ThumbsUp className="h-5 w-5" />,
  deal_won: <Handshake className="h-5 w-5" />,
  maintenance_due: <Wrench className="h-5 w-5" />,
  no_response: <Clock className="h-5 w-5" />,
  custom_date: <CalendarClock className="h-5 w-5" />,
};

interface RuleForm {
  name: string;
  trigger: AutomationTrigger;
  delayDays: string;
  templateId: string;
  active: boolean;
}

const EMPTY_FORM: RuleForm = { name: "", trigger: "quote_sent", delayDays: "2", templateId: "", active: true };

export default function AutomacoesPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [rules, setRules] = useState<AutomationRule[]>(MOCK_AUTOMATION_RULES);
  const [masterEnabled, setMasterEnabled] = useState(true);
  const [confirmMasterOff, setConfirmMasterOff] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<RuleForm>(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<AutomationRule | null>(null);

  const templates = MOCK_MESSAGE_TEMPLATES;
  const templateName = (id: string) => templates.find((tpl) => tpl.id === id)?.name;
  const selectedTemplate = templates.find((tpl) => tpl.id === form.templateId);

  const scheduledCount = useMemo(
    () => MOCK_SCHEDULED_MESSAGES.filter((m) => m.status === "scheduled").length,
    []
  );

  const delayLabel = (days: number) =>
    days === 0 ? t("automations.delayNone") : days === 1 ? t("automations.delayOne") : t("automations.delayMany", { days });

  /* ---- Switch mestre ---- */
  const handleMasterToggle = (next: boolean) => {
    if (!next) {
      setConfirmMasterOff(true);
      return;
    }
    setMasterEnabled(true);
    toast("success", t("automations.masterOnToastTitle"), t("automations.masterOnToastDescription"));
  };

  const confirmMasterDisable = () => {
    setMasterEnabled(false);
    setConfirmMasterOff(false);
    toast("warning", t("automations.masterOffToastTitle"), t("automations.masterOffToastDescription"));
  };

  /* ---- Ações das regras ---- */
  const toggleRule = (rule: AutomationRule, active: boolean) => {
    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, active, updatedAt: new Date().toISOString() } : r)));
    toast(
      active ? "success" : "info",
      active ? t("automations.ruleEnabledToast") : t("automations.ruleDisabledToast"),
      active ? t("automations.ruleEnabledToastDescription") : t("automations.ruleDisabledToastDescription")
    );
  };

  const openNew = () => {
    setEditingId(null);
    setForm({ ...EMPTY_FORM, templateId: templates[0]?.id ?? "" });
    setDrawerOpen(true);
  };

  const openEdit = (rule: AutomationRule) => {
    setEditingId(rule.id);
    setForm({
      name: rule.name,
      trigger: rule.trigger,
      delayDays: String(rule.delayDays),
      templateId: rule.messageTemplateId,
      active: rule.active,
    });
    setDrawerOpen(true);
  };

  const duplicateRule = (rule: AutomationRule) => {
    const copy: AutomationRule = {
      ...rule,
      id: `ar_${Date.now()}`,
      name: `${rule.name} ${t("automations.copySuffix")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setRules((prev) => [...prev, copy]);
    toast("success", t("automations.ruleDuplicatedToast"));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setRules((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast("success", t("automations.ruleDeletedToast"));
  };

  const formValid = form.name.trim().length > 0 && form.templateId.length > 0;

  const saveRule = () => {
    if (!formValid) return;
    const delay = Math.max(0, parseInt(form.delayDays, 10) || 0);
    const now = new Date().toISOString();
    if (editingId) {
      setRules((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, name: form.name.trim(), trigger: form.trigger, delayDays: delay, messageTemplateId: form.templateId, active: form.active, updatedAt: now }
            : r
        )
      );
      toast("success", t("automations.ruleSavedToast"));
    } else {
      setRules((prev) => [
        ...prev,
        {
          id: `ar_${Date.now()}`,
          companyId: "co_demo_001",
          name: form.name.trim(),
          trigger: form.trigger,
          delayDays: delay,
          messageTemplateId: form.templateId,
          active: form.active,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      toast("success", t("automations.ruleCreatedToast"), t("automations.ruleCreatedToastDescription"));
    }
    setDrawerOpen(false);
  };

  const triggerOptions = TRIGGERS.map((trigger) => ({ value: trigger, label: t(`automations.trigger_${trigger}`) }));
  const templateOptions = templates.map((tpl) => ({ value: tpl.id, label: tpl.name }));

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("automations.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("automations.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => router.push("/app/automacoes/calendario")}>
            <CalendarDays className="h-4 w-4" />
            {t("automations.viewCalendar")}
          </Button>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            {t("automations.newAutomation")}
          </Button>
        </div>
      </div>

      {/* Callout de valor + switch mestre */}
      <GlassCard hover={false} className="mb-4 border-kyber-green/20 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green shadow-glow-sm">
              <Zap className="h-5 w-5" />
            </span>
            <div>
              <h2 className="font-display text-base font-semibold text-kyber-white">{t("automations.calloutTitle")}</h2>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-kyber-gray">{t("automations.calloutDescription")}</p>
            </div>
          </div>
          <div className="shrink-0 pl-[60px] sm:pl-0">
            <Switch checked={masterEnabled} onChange={handleMasterToggle} label={t("automations.masterSwitch")} />
          </div>
        </div>
      </GlassCard>

      {/* Banner âmbar quando as automações estão pausadas */}
      {!masterEnabled && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
          <p className="flex items-center gap-2.5 text-sm text-amber-300">
            <TriangleAlert className="h-4 w-4 shrink-0" />
            {t("automations.pausedBanner")}
          </p>
          <Button size="sm" variant="outline" className="border-amber-400/40 text-amber-300 hover:border-amber-400 hover:bg-amber-400/10" onClick={() => handleMasterToggle(true)}>
            {t("automations.reactivate")}
          </Button>
        </div>
      )}

      {/* Estatísticas */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={t("automations.statsScheduled")}
          value={scheduledCount}
          icon={<CalendarDays className="h-4 w-4" />}
          footer={<p className="text-xs text-kyber-dim">{t("automations.statsScheduledFooter")}</p>}
        />
        <MetricCard
          label={t("automations.statsSentMonth")}
          value={18}
          delta={12}
          icon={<Send className="h-4 w-4" />}
        />
        <MetricCard
          label={t("automations.statsResponseRate")}
          value="38%"
          icon={<MessageSquareText className="h-4 w-4" />}
          footer={<p className="text-xs text-kyber-dim">{t("automations.statsResponseRateFooter")}</p>}
        />
      </div>

      {/* Regras */}
      <h2 className="mb-4 font-display text-lg font-semibold text-kyber-white">{t("automations.rulesTitle")}</h2>
      {rules.length === 0 ? (
        <EmptyState
          icon={<Zap className="h-7 w-7" />}
          title={t("automations.emptyRulesTitle")}
          description={t("automations.emptyRulesDescription")}
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              {t("automations.newAutomation")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {rules.map((rule) => (
            <GlassCard key={rule.id} className={cn("p-5", !masterEnabled && "opacity-60")}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green">
                    {TRIGGER_ICONS[rule.trigger]}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate font-display text-sm font-semibold text-kyber-white">{rule.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <Badge tone="green">{t(`automations.trigger_${rule.trigger}`)}</Badge>
                      <Badge tone="gray">{delayLabel(rule.delayDays)}</Badge>
                    </div>
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={t("common.actions")} className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                >
                  <DropdownItem onClick={() => openEdit(rule)}>
                    <Pencil className="h-4 w-4" />
                    {t("common.edit")}
                  </DropdownItem>
                  <DropdownItem onClick={() => duplicateRule(rule)}>
                    <Copy className="h-4 w-4" />
                    {t("common.duplicate")}
                  </DropdownItem>
                  <DropdownItem onClick={() => setDeleteTarget(rule)} className="text-red-400 hover:bg-red-500/10">
                    <Trash2 className="h-4 w-4" />
                    {t("common.delete")}
                  </DropdownItem>
                </Dropdown>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4">
                <p className="flex min-w-0 items-center gap-2 text-xs text-kyber-gray">
                  <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-kyber-dim" />
                  <span className="truncate">
                    {t("automations.templateLabel")}:{" "}
                    <span className="text-kyber-soft">
                      {templateName(rule.messageTemplateId) ?? t("automations.templateMissing")}
                    </span>
                  </span>
                </p>
                <Switch checked={rule.active} onChange={(next) => toggleRule(rule, next)} disabled={!masterEnabled} />
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Confirmação de desligar automações */}
      <Modal
        open={confirmMasterOff}
        onClose={() => setConfirmMasterOff(false)}
        title={t("automations.masterOffTitle")}
        description={t("automations.masterOffDescription")}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmMasterOff(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={confirmMasterDisable}>
            {t("automations.masterOffConfirm")}
          </Button>
        </div>
      </Modal>

      {/* Confirmação de exclusão */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t("automations.deleteRuleTitle")}
        description={deleteTarget ? t("automations.deleteRuleDescription", { name: deleteTarget.name }) : undefined}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            <Trash2 className="h-4 w-4" />
            {t("common.delete")}
          </Button>
        </div>
      </Modal>

      {/* Drawer de criação/edição */}
      <Modal
        drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? t("automations.editRuleTitle") : t("automations.newRuleTitle")}
        description={editingId ? t("automations.editRuleDescription") : t("automations.newRuleDescription")}
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t("automations.formName")}
            placeholder={t("automations.formNamePlaceholder")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Select
            label={t("automations.formTrigger")}
            options={triggerOptions}
            value={form.trigger}
            onChange={(e) => setForm((f) => ({ ...f, trigger: e.target.value as AutomationTrigger }))}
          />
          <Input
            label={t("automations.formDelay")}
            hint={t("automations.formDelayHint")}
            type="number"
            min={0}
            value={form.delayDays}
            onChange={(e) => setForm((f) => ({ ...f, delayDays: e.target.value }))}
          />
          <Select
            label={t("automations.formTemplate")}
            options={templateOptions}
            placeholder={t("automations.formTemplatePlaceholder")}
            value={form.templateId}
            onChange={(e) => setForm((f) => ({ ...f, templateId: e.target.value }))}
          />

          {/* Prévia do template selecionado */}
          {selectedTemplate && (
            <div>
              <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("automations.previewTitle")}</p>
              <WhatsAppBubble text={renderTemplatePreview(selectedTemplate.content)} />
              <p className="mt-1.5 text-xs text-kyber-dim">{t("automations.previewHint")}</p>
            </div>
          )}

          <div className="border-t border-border pt-4">
            <Switch
              checked={form.active}
              onChange={(active) => setForm((f) => ({ ...f, active }))}
              label={t("automations.formActive")}
            />
          </div>

          <Button className="w-full" disabled={!formValid} onClick={saveRule}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
