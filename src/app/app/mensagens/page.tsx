"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Copy,
  Languages,
  MessageSquareText,
  MoreVertical,
  Pencil,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";
import { MOCK_AUTOMATION_RULES, MOCK_MESSAGE_TEMPLATES } from "@/lib/mock/data";
import type { MessageTemplate } from "@/lib/types";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Dropdown, DropdownItem, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import {
  extractVariables,
  renderTemplatePreview,
  TEMPLATE_VARIABLES,
  WhatsAppBubble,
} from "@/components/automations/whatsapp-preview";

interface TemplateForm {
  name: string;
  content: string;
  language: string;
}

export default function MensagensPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<MessageTemplate[]>(MOCK_MESSAGE_TEMPLATES);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TemplateForm>({ name: "", content: "", language: "pt-BR" });
  const [deleteTarget, setDeleteTarget] = useState<MessageTemplate | null>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const usageCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const rule of MOCK_AUTOMATION_RULES) {
      map.set(rule.messageTemplateId, (map.get(rule.messageTemplateId) ?? 0) + 1);
    }
    return map;
  }, []);

  const languageLabel = (lang: string) =>
    (LOCALE_LABELS as Record<string, string>)[lang] ?? lang;

  const openNew = () => {
    setEditingId(null);
    // Novo template parte de um esqueleto com saudação e variáveis básicas.
    setForm({ name: "", content: t("automations.tplSkeletonContent"), language: "pt-BR" });
    setDrawerOpen(true);
  };

  const openEdit = (tpl: MessageTemplate) => {
    setEditingId(tpl.id);
    setForm({ name: tpl.name, content: tpl.content, language: tpl.language });
    setDrawerOpen(true);
  };

  const duplicateTemplate = (tpl: MessageTemplate) => {
    const copy: MessageTemplate = {
      ...tpl,
      id: `mt_${Date.now()}`,
      name: `${tpl.name} ${t("automations.copySuffix")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, copy]);
    toast("success", t("automations.tplDuplicatedToast"));
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setTemplates((prev) => prev.filter((tpl) => tpl.id !== deleteTarget.id));
    setDeleteTarget(null);
    toast("success", t("automations.tplDeletedToast"));
  };

  /** Insere a variável na posição atual do cursor do textarea. */
  const insertVariable = (variable: string) => {
    const token = `{{${variable}}}`;
    const el = contentRef.current;
    const start = el?.selectionStart ?? form.content.length;
    const end = el?.selectionEnd ?? start;
    const next = form.content.slice(0, start) + token + form.content.slice(end);
    setForm((f) => ({ ...f, content: next }));
    requestAnimationFrame(() => {
      if (!el) return;
      el.focus();
      const cursor = start + token.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const formValid = form.name.trim().length > 0 && form.content.trim().length > 0;

  const saveTemplate = () => {
    if (!formValid) return;
    const now = new Date().toISOString();
    const variables = extractVariables(form.content);
    if (editingId) {
      setTemplates((prev) =>
        prev.map((tpl) =>
          tpl.id === editingId
            ? { ...tpl, name: form.name.trim(), content: form.content, language: form.language, variables, updatedAt: now }
            : tpl
        )
      );
      toast("success", t("automations.tplSavedToast"));
    } else {
      setTemplates((prev) => [
        ...prev,
        {
          id: `mt_${Date.now()}`,
          companyId: "co_demo_001",
          name: form.name.trim(),
          content: form.content,
          variables,
          language: form.language,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      toast("success", t("automations.tplCreatedToast"));
    }
    setDrawerOpen(false);
  };

  const languageOptions = LOCALES.map((loc: Locale) => ({ value: loc, label: LOCALE_LABELS[loc] }));

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("automations.tplTitle")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("automations.tplSubtitle")}</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="h-4 w-4" />
          {t("automations.tplNew")}
        </Button>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={<MessageSquareText className="h-7 w-7" />}
          title={t("automations.tplEmptyTitle")}
          description={t("automations.tplEmptyDescription")}
          action={
            <Button onClick={openNew}>
              <Plus className="h-4 w-4" />
              {t("automations.tplNew")}
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((tpl) => {
            const usedBy = usageCount.get(tpl.id) ?? 0;
            return (
              <GlassCard key={tpl.id} className="flex flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green">
                      <MessageSquareText className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-sm font-semibold text-kyber-white">{tpl.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-kyber-dim">
                        <Languages className="h-3 w-3" />
                        {languageLabel(tpl.language)}
                      </p>
                    </div>
                  </div>
                  <Dropdown
                    trigger={
                      <Button variant="ghost" size="icon" aria-label={t("common.actions")} className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    }
                  >
                    <DropdownItem onClick={() => openEdit(tpl)}>
                      <Pencil className="h-4 w-4" />
                      {t("common.edit")}
                    </DropdownItem>
                    <DropdownItem onClick={() => duplicateTemplate(tpl)}>
                      <Copy className="h-4 w-4" />
                      {t("common.duplicate")}
                    </DropdownItem>
                    <DropdownItem onClick={() => setDeleteTarget(tpl)} className="text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-4 w-4" />
                      {t("common.delete")}
                    </DropdownItem>
                  </Dropdown>
                </div>

                <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-kyber-gray">{tpl.content}</p>

                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3.5">
                  {tpl.variables.map((variable) => (
                    <Badge key={variable} tone="green" className="font-mono text-[10px]">
                      {`{{${variable}}}`}
                    </Badge>
                  ))}
                </div>

                {usedBy > 0 && (
                  <p className="mt-3 flex items-center gap-1.5 text-xs text-kyber-dim">
                    <Zap className="h-3 w-3 text-kyber-green" />
                    {usedBy === 1
                      ? t("automations.tplInUseOne")
                      : t("automations.tplInUseMany", { count: usedBy })}
                  </p>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Confirmação de exclusão */}
      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={t("automations.tplDeleteTitle")}
        description={deleteTarget ? t("automations.tplDeleteDescription", { name: deleteTarget.name }) : undefined}
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

      {/* Editor em drawer */}
      <Modal
        drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingId ? t("automations.tplEditTitle") : t("automations.tplNewTitle")}
        description={t("automations.tplEditorDescription")}
        className="!max-w-xl"
      >
        <div className="flex flex-col gap-4">
          <Input
            label={t("automations.tplFormName")}
            placeholder={t("automations.tplFormNamePlaceholder")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />

          <Textarea
            ref={contentRef}
            label={t("automations.tplFormContent")}
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            className="min-h-[140px]"
          />

          {/* Variáveis clicáveis — inserem na posição do cursor */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("automations.tplVariablesLabel")}</p>
            <div className="flex flex-wrap gap-1.5">
              {TEMPLATE_VARIABLES.map((variable) => (
                <button
                  key={variable}
                  type="button"
                  onClick={() => insertVariable(variable)}
                  className="focus-ring rounded-full border border-kyber-green/25 bg-kyber-green/10 px-2.5 py-1 font-mono text-[11px] font-medium text-kyber-green transition-colors hover:border-kyber-green/60 hover:bg-kyber-green/20"
                >
                  {`{{${variable}}}`}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-kyber-dim">{t("automations.tplVariablesHint")}</p>
          </div>

          <Select
            label={t("automations.tplFormLanguage")}
            options={languageOptions}
            value={form.language}
            onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))}
          />

          {/* Prévia ao vivo */}
          <div>
            <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("automations.tplPreviewTitle")}</p>
            {form.content.trim().length > 0 ? (
              <>
                <WhatsAppBubble text={renderTemplatePreview(form.content)} />
                <p className="mt-1.5 text-xs text-kyber-dim">{t("automations.tplPreviewHint")}</p>
              </>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-6 text-center text-xs text-kyber-dim">
                {t("automations.tplPreviewEmpty")}
              </div>
            )}
          </div>

          <Button className="w-full" disabled={!formValid} onClick={saveTemplate}>
            {t("common.save")}
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
