"use client";

/**
 * Modal de geração de PDF simulada — compartilhado entre os geradores
 * inteligente e simples. Percorre as etapas com animação (~2s) e avisa
 * o chamador ao concluir (o toast fica por conta da tela).
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, FileText, Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Progress } from "@/components/ui/misc";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const STEP_KEYS = ["quotes.pdfStepStructure", "quotes.pdfStepTemplate", "quotes.pdfStepReady"];
const STEP_DURATION = 700;

export function PdfProgressModal({
  open,
  onClose,
  onComplete,
}: {
  open: boolean;
  onClose: () => void;
  /** Disparado quando a animação termina (antes de fechar). */
  onComplete: () => void;
}) {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (!open) {
      setStep(0);
      return;
    }
    // Avança pelas etapas em sequência e fecha sozinho ao final.
    STEP_KEYS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setStep(i + 1), STEP_DURATION * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        onComplete();
      }, STEP_DURATION * STEP_KEYS.length + 300)
    );
    timers.current.push(
      setTimeout(() => {
        onClose();
      }, STEP_DURATION * STEP_KEYS.length + 1100)
    );
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const done = step >= STEP_KEYS.length;
  const progress = Math.min(100, (step / STEP_KEYS.length) * 100);

  return (
    <Modal open={open} onClose={onClose} title={t("quotes.pdfModalTitle")} description={t("quotes.pdfModalDescription")}>
      <div className="flex flex-col items-center gap-6 py-4">
        <motion.div
          animate={done ? { scale: [1, 1.15, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
          className={cn(
            "flex h-20 w-20 items-center justify-center rounded-2xl transition-colors duration-300",
            done ? "bg-kyber-green/15 text-kyber-green shadow-glow" : "bg-white/[0.05] text-kyber-gray"
          )}
        >
          <FileText className="h-10 w-10" />
        </motion.div>

        <Progress value={progress} className="max-w-xs" />

        <ul className="w-full max-w-xs space-y-2.5">
          {STEP_KEYS.map((key, i) => {
            const stepDone = step > i;
            const active = step === i;
            return (
              <li key={key} className="flex items-center gap-2.5 text-sm">
                <AnimatePresence mode="wait" initial={false}>
                  {stepDone ? (
                    <motion.span key="done" initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                      <CheckCircle2 className="h-4 w-4 text-kyber-green" />
                    </motion.span>
                  ) : active ? (
                    <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Loader2 className="h-4 w-4 animate-spin text-kyber-green" />
                    </motion.span>
                  ) : (
                    <span key="idle" className="inline-block h-4 w-4 rounded-full border border-white/15" />
                  )}
                </AnimatePresence>
                <span className={cn(stepDone ? "text-kyber-soft" : active ? "text-kyber-white" : "text-kyber-dim")}>
                  {t(key)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
