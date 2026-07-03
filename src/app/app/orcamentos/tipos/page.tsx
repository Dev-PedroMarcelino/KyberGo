"use client";

/**
 * Tipos de orçamento + construtor de critérios.
 * Grade de cards dos tipos, drawer de criação/edição e construtor de
 * critérios ordenável para tipos inteligentes. Tudo em estado local.
 */

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ListChecks,
  PencilLine,
  Plus,
  Trash2,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { PageTransition } from "@/components/motion";
import { QuoteModeBadge } from "@/components/quotes/quote-badges";
import { useI18n } from "@/lib/i18n";
import { MOCK_QUOTE_CRITERIA, MOCK_QUOTE_TYPES } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import type { CriteriaFieldType, QuoteCriterion, QuoteMode, QuoteType } from "@/lib/types";

interface TypeDraft {
  id: string | null;
  name: string;
  description: string;
  mode: QuoteMode;
  maintenanceIntervalDays: string;
}

const EMPTY_DRAFT: TypeDraft = { id: null, name: "", description: "", mode: "intelligent", maintenanceIntervalDays: "" };

export default function QuoteTypesPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [types, setTypes] = useState<QuoteType[]>(MOCK_QUOTE_TYPES);
  const [criteria, setCriteria] = useState<QuoteCriterion[]>(MOCK_QUOTE_CRITERIA);

  const [formOpen, setFormOpen] = useState(false);
  const [draft, setDraft] = useState<TypeDraft>(EMPTY_DRAFT);

  const [builderTypeId, setBuilderTypeId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const builderType = types.find((qt) => qt.id === builderTypeId) ?? null;
  const builderCriteria = useMemo(
    () => criteria.filter((c) => c.quoteTypeId === builderTypeId).sort((a, b) => a.order - b.order),
    [criteria, builderTypeId]
  );

  const fieldTypeOptions = [
    { value: "number", label: t("quotes.fieldNumber") },
    { value: "text", label: t("quotes.fieldText") },
    { value: "select", label: t("quotes.fieldSelect") },
    { value: "boolean", label: t("quotes.fieldBoolean") },
    { value: "currency", label: t("quotes.fieldCurrency") },
  ];

  const fieldTypeLabel = (ft: CriteriaFieldType) => fieldTypeOptions.find((o) => o.value === ft)?.label ?? ft;

  /* ---------------- Tipos ---------------- */

  const openCreate = () => {
    setDraft(EMPTY_DRAFT);
    setFormOpen(true);
  };

  const openEdit = (type: QuoteType) => {
    setDraft({
      id: type.id,
      name: type.name,
      description: type.description,
      mode: type.mode,
      maintenanceIntervalDays: type.maintenanceIntervalDays !== null ? String(type.maintenanceIntervalDays) : "",
    });
    setFormOpen(true);
  };

  const saveType = () => {
    if (!draft.name.trim()) return;
    const maintenance = draft.maintenanceIntervalDays.trim() ? Number(draft.maintenanceIntervalDays) || null : null;
    if (draft.id) {
      setTypes((prev) =>
        prev.map((qt) =>
          qt.id === draft.id
            ? {
                ...qt,
                name: draft.name.trim(),
                description: draft.description.trim(),
                mode: draft.mode,
                maintenanceIntervalDays: maintenance,
                updatedAt: new Date().toISOString(),
              }
            : qt
        )
      );
      toast("success", t("quotes.typeSavedTitle"), t("quotes.typeSavedDescription", { name: draft.name.trim() }));
    } else {
      const now = new Date().toISOString();
      setTypes((prev) => [
        ...prev,
        {
          id: `qt_local_${Date.now()}`,
          companyId: "co_demo_001",
          name: draft.name.trim(),
          description: draft.description.trim(),
          mode: draft.mode,
          maintenanceIntervalDays: maintenance,
          createdAt: now,
          updatedAt: now,
        },
      ]);
      toast("success", t("quotes.typeCreatedTitle"), t("quotes.typeCreatedDescription", { name: draft.name.trim() }));
    }
    setFormOpen(false);
  };

  /* ---------------- Critérios ---------------- */

  const updateCriterion = (id: string, patch: Partial<QuoteCriterion>) =>
    setCriteria((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const moveCriterion = (id: string, direction: -1 | 1) => {
    const list = builderCriteria;
    const index = list.findIndex((c) => c.id === id);
    const target = list[index + direction];
    if (!target) return;
    const self = list[index];
    setCriteria((prev) =>
      prev.map((c) => (c.id === self.id ? { ...c, order: target.order } : c.id === target.id ? { ...c, order: self.order } : c))
    );
  };

  const addCriterion = () => {
    if (!builderTypeId) return;
    const now = new Date().toISOString();
    const nextOrder = builderCriteria.length > 0 ? Math.max(...builderCriteria.map((c) => c.order)) + 1 : 1;
    const created: QuoteCriterion = {
      id: `qc_local_${Date.now()}`,
      companyId: "co_demo_001",
      quoteTypeId: builderTypeId,
      label: t("quotes.criterionNew"),
      fieldType: "number",
      required: false,
      calculationRule: null,
      options: null,
      order: nextOrder,
      createdAt: now,
      updatedAt: now,
    };
    setCriteria((prev) => [...prev, created]);
    setExpandedId(created.id);
    toast("success", t("quotes.criterionAddedTitle"), t("quotes.criterionAddedDescription"));
  };

  const removeCriterion = (criterion: QuoteCriterion) => {
    setCriteria((prev) => prev.filter((c) => c.id !== criterion.id));
    if (expandedId === criterion.id) setExpandedId(null);
    toast("info", t("quotes.criterionRemovedTitle"), criterion.label);
  };

  const finishEditing = (criterion: QuoteCriterion) => {
    setExpandedId(null);
    toast("success", t("quotes.criterionSavedTitle"), criterion.label);
  };

  const criteriaCountFor = (typeId: string) => criteria.filter((c) => c.quoteTypeId === typeId).length;

  return (
    <PageTransition>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold text-kyber-white">
            <ListChecks className="h-6 w-6 text-kyber-green" />
            {t("quotes.typesTitle")}
          </h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("quotes.typesSubtitle")}</p>
        </div>
        <Button variant="glow" onClick={openCreate}>
          <Plus className="h-4 w-4" />
          {t("quotes.newType")}
        </Button>
      </div>

      {/* Grade de tipos */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((type) => (
          <motion.button
            key={type.id}
            layout
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={() => (type.mode === "intelligent" ? setBuilderTypeId(type.id) : openEdit(type))}
            className="focus-ring glass-card group flex flex-col p-5 text-left transition-shadow duration-300 hover:shadow-card-hover"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-base font-semibold text-kyber-white transition-colors group-hover:text-kyber-green">
                {type.name}
              </h3>
              <QuoteModeBadge mode={type.mode} />
            </div>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-kyber-gray">{type.description}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge tone="gray">
                <Wrench className="h-3 w-3" />
                {type.maintenanceIntervalDays !== null
                  ? t("quotes.maintenanceEvery", { days: type.maintenanceIntervalDays })
                  : t("quotes.noMaintenance")}
              </Badge>
              {type.mode === "intelligent" && (
                <Badge tone="green">{t("quotes.criteriaCount", { count: criteriaCountFor(type.id) })}</Badge>
              )}
            </div>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              {type.mode === "intelligent" && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-kyber-green">
                  <ListChecks className="h-3.5 w-3.5" />
                  {t("quotes.openCriteria")}
                </span>
              )}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  openEdit(type);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    openEdit(type);
                  }
                }}
                className="focus-ring ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft"
              >
                <PencilLine className="h-3.5 w-3.5" />
                {t("quotes.editType")}
              </span>
            </div>
          </motion.button>
        ))}

        {/* Card criar novo */}
        <motion.button
          layout
          whileHover={{ y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
          onClick={openCreate}
          className="focus-ring flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-5 text-center transition-colors hover:border-kyber-green/40 hover:bg-kyber-green/[0.04]"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-kyber-green/10 text-kyber-green">
            <Plus className="h-6 w-6" />
          </span>
          <span className="font-display text-sm font-semibold text-kyber-white">{t("quotes.newType")}</span>
          <span className="text-xs text-kyber-gray">{t("quotes.newTypeHint")}</span>
        </motion.button>
      </div>

      {/* Drawer: criar/editar tipo */}
      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        drawer
        title={draft.id ? t("quotes.typeFormTitleEdit") : t("quotes.typeFormTitleNew")}
        description={t("quotes.typeFormDescription")}
      >
        <div className="space-y-4">
          <Input
            label={t("quotes.typeName")}
            value={draft.name}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
            placeholder={t("quotes.typeNamePlaceholder")}
          />
          <Textarea
            label={t("quotes.typeDescriptionLabel")}
            value={draft.description}
            onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            placeholder={t("quotes.typeDescriptionPlaceholder")}
            rows={3}
          />
          <Select
            label={t("quotes.typeMode")}
            value={draft.mode}
            onChange={(e) => setDraft((d) => ({ ...d, mode: e.target.value as QuoteMode }))}
            options={[
              { value: "intelligent", label: t("quotes.modeIntelligent") },
              { value: "simple", label: t("quotes.modeSimple") },
            ]}
          />
          <Input
            type="number"
            min={0}
            label={t("quotes.typeMaintenance")}
            value={draft.maintenanceIntervalDays}
            onChange={(e) => setDraft((d) => ({ ...d, maintenanceIntervalDays: e.target.value }))}
            hint={t("quotes.typeMaintenanceHint")}
          />
          <div className="flex gap-2 pt-2">
            <Button onClick={saveType} disabled={!draft.name.trim()} className="flex-1">
              <Check className="h-4 w-4" />
              {t("common.save")}
            </Button>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              {t("common.cancel")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Drawer: construtor de critérios */}
      <Modal
        open={builderTypeId !== null}
        onClose={() => {
          setBuilderTypeId(null);
          setExpandedId(null);
        }}
        drawer
        className="max-w-xl"
        title={builderType ? t("quotes.criteriaBuilderTitle", { name: builderType.name }) : ""}
        description={t("quotes.criteriaBuilderDescription")}
      >
        {builderType?.mode === "simple" ? (
          <p className="rounded-xl border border-border bg-white/[0.03] p-4 text-sm text-kyber-gray">
            {t("quotes.simpleTypeNoCriteria")}
          </p>
        ) : (
          <div className="space-y-3">
            {builderCriteria.length === 0 && (
              <div className="rounded-xl border border-dashed border-white/15 p-6 text-center">
                <p className="text-sm font-medium text-kyber-white">{t("quotes.noCriteriaYet")}</p>
                <p className="mt-1 text-xs text-kyber-gray">{t("quotes.noCriteriaYetDescription")}</p>
              </div>
            )}

            <AnimatePresence initial={false}>
              {builderCriteria.map((criterion, index) => {
                const expanded = expandedId === criterion.id;
                return (
                  <motion.div
                    key={criterion.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "overflow-hidden rounded-xl border bg-white/[0.03] transition-colors",
                      expanded ? "border-kyber-green/40" : "border-border"
                    )}
                  >
                    {/* Linha do critério */}
                    <div className="flex items-center gap-2 px-3 py-2.5">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/5 font-mono text-[11px] text-kyber-dim">
                        {index + 1}
                      </span>
                      <button
                        onClick={() => setExpandedId(expanded ? null : criterion.id)}
                        className="focus-ring flex min-w-0 flex-1 items-center gap-2 rounded-lg text-left"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-kyber-white">{criterion.label}</span>
                          <span className="mt-0.5 flex flex-wrap items-center gap-1.5">
                            <Badge tone="gray" className="!px-1.5 !py-0 text-[10px]">
                              {fieldTypeLabel(criterion.fieldType)}
                            </Badge>
                            <Badge tone={criterion.required ? "yellow" : "gray"} className="!px-1.5 !py-0 text-[10px]">
                              {criterion.required ? t("quotes.requiredBadge") : t("quotes.optionalBadge")}
                            </Badge>
                            {criterion.calculationRule && (
                              <span className="truncate font-mono text-[10px] text-kyber-dim">{criterion.calculationRule}</span>
                            )}
                          </span>
                        </span>
                        <ChevronDown
                          className={cn("h-4 w-4 shrink-0 text-kyber-dim transition-transform duration-300", expanded && "rotate-180")}
                        />
                      </button>
                      <div className="flex shrink-0 items-center gap-0.5">
                        <button
                          onClick={() => moveCriterion(criterion.id, -1)}
                          disabled={index === 0}
                          aria-label={t("quotes.moveUp")}
                          className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-white/5 hover:text-kyber-soft disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => moveCriterion(criterion.id, 1)}
                          disabled={index === builderCriteria.length - 1}
                          aria-label={t("quotes.moveDown")}
                          className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-white/5 hover:text-kyber-soft disabled:pointer-events-none disabled:opacity-30"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => removeCriterion(criterion)}
                          aria-label={t("common.remove")}
                          className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Mini-form de edição */}
                    <AnimatePresence initial={false}>
                      {expanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <div className="space-y-3.5 border-t border-border px-3 py-3.5">
                            <Input
                              label={t("quotes.criterionLabel")}
                              value={criterion.label}
                              onChange={(e) => updateCriterion(criterion.id, { label: e.target.value })}
                              placeholder={t("quotes.criterionLabelPlaceholder")}
                            />
                            <div className="grid gap-3.5 sm:grid-cols-2">
                              <Select
                                label={t("quotes.criterionFieldType")}
                                value={criterion.fieldType}
                                onChange={(e) => updateCriterion(criterion.id, { fieldType: e.target.value as CriteriaFieldType })}
                                options={fieldTypeOptions}
                              />
                              <div className="flex items-end pb-2.5">
                                <Switch
                                  checked={criterion.required}
                                  onChange={(checked) => updateCriterion(criterion.id, { required: checked })}
                                  label={t("quotes.criterionRequired")}
                                />
                              </div>
                            </div>
                            <Input
                              label={t("quotes.criterionRule")}
                              value={criterion.calculationRule ?? ""}
                              onChange={(e) => updateCriterion(criterion.id, { calculationRule: e.target.value || null })}
                              placeholder={t("quotes.criterionRulePlaceholder")}
                              hint={t("quotes.criterionRuleHint")}
                            />
                            {criterion.fieldType === "select" && (
                              <Input
                                label={t("quotes.criterionOptions")}
                                value={(criterion.options ?? []).join(", ")}
                                onChange={(e) =>
                                  updateCriterion(criterion.id, {
                                    options: e.target.value
                                      .split(",")
                                      .map((o) => o.trim())
                                      .filter(Boolean),
                                  })
                                }
                                placeholder={t("quotes.criterionOptionsPlaceholder")}
                              />
                            )}
                            <Button size="sm" onClick={() => finishEditing(criterion)}>
                              <Check className="h-3.5 w-3.5" />
                              {t("common.save")}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            <Button variant="outline" onClick={addCriterion} className="w-full">
              <Plus className="h-4 w-4" />
              {t("quotes.addCriterion")}
            </Button>
          </div>
        )}
      </Modal>
    </PageTransition>
  );
}
