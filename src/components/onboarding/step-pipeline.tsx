"use client";

/** Etapa 6 — Pipeline do CRM: estágios editáveis com renomear, remover, adicionar e reordenar. */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Info, Plus, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StepHeader } from "./shared";
import { uid, type StepProps } from "./types";

export function StepPipeline({ data, update }: StepProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [newStage, setNewStage] = useState("");

  const rename = (id: string, name: string) =>
    update({ stages: data.stages.map((s) => (s.id === id ? { ...s, name } : s)) });

  const move = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= data.stages.length) return;
    const next = [...data.stages];
    [next[index], next[target]] = [next[target], next[index]];
    update({ stages: next });
  };

  const remove = (id: string) => {
    if (data.stages.length <= 2) {
      toast("warning", t("onboarding.pipelineMinWarning"));
      return;
    }
    update({ stages: data.stages.filter((s) => s.id !== id) });
    toast("info", t("onboarding.stageRemovedToast"));
  };

  const add = () => {
    const name = newStage.trim();
    if (!name) return;
    update({ stages: [...data.stages, { id: uid("st"), name }] });
    setNewStage("");
    toast("success", t("onboarding.stageAddedToast"));
  };

  return (
    <div>
      <StepHeader title={t("onboarding.pipelineTitle")} subtitle={t("onboarding.pipelineSubtitle")} />

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {data.stages.map((stage, index) => (
            <motion.div
              key={stage.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-2 rounded-xl border border-border bg-white/[0.03] p-2.5 sm:gap-3 sm:p-3"
            >
              <span
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
                  "bg-kyber-green/10 text-kyber-green"
                )}
              >
                {index + 1}
              </span>
              <input
                value={stage.name}
                onChange={(e) => rename(stage.id, e.target.value)}
                aria-label={t("onboarding.stageNameLabel")}
                className="focus-ring h-9 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2.5 text-sm text-kyber-soft transition-colors hover:border-white/15 focus:border-kyber-green/50 focus:bg-white/[0.04]"
              />
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  aria-label={t("onboarding.moveUp")}
                  className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-white/5 hover:text-kyber-soft disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === data.stages.length - 1}
                  aria-label={t("onboarding.moveDown")}
                  className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-white/5 hover:text-kyber-soft disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(stage.id)}
                  aria-label={t("onboarding.removeStage")}
                  className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Adicionar estágio */}
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder={t("onboarding.newStagePlaceholder")}
          value={newStage}
          onChange={(e) => setNewStage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
        />
        <Button variant="outline" onClick={add} disabled={!newStage.trim()} className="shrink-0">
          <Plus className="h-4 w-4" />
          {t("onboarding.addStage")}
        </Button>
      </div>

      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-kyber-dim">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kyber-green" />
        {t("onboarding.pipelineHint")}
      </p>
    </div>
  );
}
