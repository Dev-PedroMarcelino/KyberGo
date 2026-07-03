"use client";

/** Etapa 4 — Critérios de orçamento: tipo de orçamento + lista dinâmica de critérios. */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ListChecks, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Switch } from "@/components/ui/misc";
import type { CriteriaFieldType } from "@/lib/types";
import { StepHeader, buildFieldTypeOptions } from "./shared";
import { uid, type CriterionDraft, type StepProps } from "./types";

export function StepCriteria({ data, update }: StepProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const patchCriterion = (id: string, patch: Partial<CriterionDraft>) =>
    update({ criteria: data.criteria.map((c) => (c.id === id ? { ...c, ...patch } : c)) });

  const addCriterion = () => {
    update({
      criteria: [
        ...data.criteria,
        { id: uid("cr"), label: "", fieldType: "number", required: false, calculationRule: "" },
      ],
    });
    toast("success", t("onboarding.criterionAddedToast"));
  };

  const removeCriterion = (id: string) => {
    update({ criteria: data.criteria.filter((c) => c.id !== id) });
    toast("info", t("onboarding.criterionRemovedToast"));
  };

  return (
    <div>
      <StepHeader title={t("onboarding.criteriaTitle")} subtitle={t("onboarding.criteriaSubtitle")} />

      {/* Tipo de orçamento */}
      <div className="rounded-xl border border-border bg-white/[0.03] p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-kyber-dim">
          {t("onboarding.quoteTypeSection")}
        </p>
        <div className="space-y-4">
          <Input
            label={t("onboarding.quoteTypeName")}
            placeholder={t("onboarding.quoteTypeNamePlaceholder")}
            value={data.quoteTypeName}
            onChange={(e) => update({ quoteTypeName: e.target.value })}
          />
          <Textarea
            label={t("onboarding.quoteTypeDescriptionLabel")}
            placeholder={t("onboarding.quoteTypeDescriptionPlaceholder")}
            value={data.quoteTypeDescription}
            onChange={(e) => update({ quoteTypeDescription: e.target.value })}
            className="min-h-[72px]"
          />
        </div>
      </div>

      {/* Lista de critérios */}
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-kyber-white">{t("onboarding.criteriaListTitle")}</p>
          <Badge tone="green">{t("onboarding.criteriaCount", { count: data.criteria.length })}</Badge>
        </div>

        {data.criteria.length === 0 ? (
          <EmptyState
            icon={<ListChecks className="h-7 w-7" />}
            title={t("onboarding.criteriaEmptyTitle")}
            description={t("onboarding.criteriaEmptyDescription")}
            action={
              <Button onClick={addCriterion}>
                <Plus className="h-4 w-4" />
                {t("onboarding.addCriterion")}
              </Button>
            }
          />
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {data.criteria.map((criterion, index) => (
                <motion.div
                  key={criterion.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -24, scale: 0.98 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="rounded-xl border border-border bg-white/[0.03] p-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-2.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kyber-green/10 text-xs font-bold text-kyber-green">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-3">
                      <Input
                        label={t("onboarding.criterionLabel")}
                        placeholder={t("onboarding.criterionLabelPlaceholder")}
                        value={criterion.label}
                        onChange={(e) => patchCriterion(criterion.id, { label: e.target.value })}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Select
                          label={t("onboarding.criterionType")}
                          options={buildFieldTypeOptions(t)}
                          value={criterion.fieldType}
                          onChange={(e) =>
                            patchCriterion(criterion.id, { fieldType: e.target.value as CriteriaFieldType })
                          }
                        />
                        <Input
                          label={t("onboarding.criterionRule")}
                          placeholder={t("onboarding.criterionRulePlaceholder")}
                          value={criterion.calculationRule}
                          onChange={(e) => patchCriterion(criterion.id, { calculationRule: e.target.value })}
                        />
                      </div>
                      <Switch
                        checked={criterion.required}
                        onChange={(v) => patchCriterion(criterion.id, { required: v })}
                        label={t("onboarding.criterionRequired")}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCriterion(criterion.id)}
                      aria-label={t("onboarding.removeCriterion")}
                      className="focus-ring mt-1 rounded-lg p-2 text-kyber-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <Button variant="outline" onClick={addCriterion} className="w-full">
              <Plus className="h-4 w-4" />
              {t("onboarding.addCriterion")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
