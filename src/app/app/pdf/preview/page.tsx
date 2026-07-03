"use client";

/**
 * Pré-visualização interativa do PDF em tempo real:
 * mesa de trabalho escura, zoom, troca de orçamento/template com transição
 * de página e simulação animada de geração do PDF final.
 */

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  PencilLine,
  Sparkles,
  Star,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import { PdfDocument } from "@/components/pdf/pdf-document";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_COMPANY, MOCK_CUSTOMERS, MOCK_PDF_TEMPLATES, MOCK_QUOTES } from "@/lib/mock/data";
import { cn } from "@/lib/utils";

/** Largura de referência de uma folha A4 em 96dpi. */
const A4_WIDTH = 794;

type ZoomLevel = "fit" | 0.5 | 0.75 | 1;

const ZOOM_OPTIONS: { value: ZoomLevel; labelKey: string }[] = [
  { value: 0.5, labelKey: "pdf.zoom50" },
  { value: 0.75, labelKey: "pdf.zoom75" },
  { value: 1, labelKey: "pdf.zoom100" },
  { value: "fit", labelKey: "pdf.zoomFit" },
];

const GEN_STEP_KEYS = ["pdf.genStep1", "pdf.genStep2", "pdf.genStep3"] as const;
const GEN_STEP_MS = 950;

export default function PdfPreviewPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [quoteId, setQuoteId] = useState(MOCK_QUOTES[0].id);
  const [templateId, setTemplateId] = useState(
    MOCK_PDF_TEMPLATES.find((tp) => tp.isDefault)?.id ?? MOCK_PDF_TEMPLATES[0].id
  );
  const [zoom, setZoom] = useState<ZoomLevel>("fit");
  const [genStep, setGenStep] = useState(-1); // -1 = ocioso
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const quote = MOCK_QUOTES.find((q) => q.id === quoteId) ?? MOCK_QUOTES[0];
  const template = MOCK_PDF_TEMPLATES.find((tp) => tp.id === templateId) ?? MOCK_PDF_TEMPLATES[0];
  const customer = MOCK_CUSTOMERS.find((c) => c.id === quote.customerId) ?? MOCK_CUSTOMERS[0];

  useEffect(() => {
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleGenerate = () => {
    if (genStep >= 0) return;
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    setGenStep(0);
    GEN_STEP_KEYS.forEach((_, i) => {
      if (i === 0) return;
      timersRef.current.push(setTimeout(() => setGenStep(i), i * GEN_STEP_MS));
    });
    timersRef.current.push(
      setTimeout(() => {
        setGenStep(-1);
        toast("success", t("pdf.genSuccessTitle"), t("pdf.genSuccessDesc", { number: quote.number }));
      }, GEN_STEP_KEYS.length * GEN_STEP_MS + 500)
    );
  };

  const sheetWidth = zoom === "fit" ? "100%" : `${Math.round(A4_WIDTH * zoom)}px`;

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("pdf.previewTitle")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("pdf.previewSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/app/pdf/templates">
            <Button variant="secondary" size="sm">
              <PencilLine className="h-4 w-4" />
              {t("pdf.editTemplate")}
            </Button>
          </Link>
          <Button size="sm" onClick={handleGenerate} loading={genStep >= 0}>
            <Sparkles className="h-4 w-4" />
            {t("pdf.generateFinal")}
          </Button>
        </div>
      </div>

      {/* Seletores de orçamento e template */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="w-full max-w-md">
          <Select
            label={t("pdf.quoteLabel")}
            value={quoteId}
            onChange={(e) => setQuoteId(e.target.value)}
            options={MOCK_QUOTES.map((q) => ({ value: q.id, label: `${q.number} — ${q.title}` }))}
          />
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("pdf.templateLabel")}</p>
          <div className="flex flex-wrap gap-2">
            {MOCK_PDF_TEMPLATES.map((tp) => (
              <button
                key={tp.id}
                onClick={() => setTemplateId(tp.id)}
                className={cn(
                  "focus-ring flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
                  tp.id === templateId
                    ? "border-kyber-green/50 bg-kyber-green/15 text-kyber-green shadow-glow-sm"
                    : "border-border bg-white/[0.03] text-kyber-gray hover:border-white/25 hover:text-kyber-soft"
                )}
              >
                {tp.isDefault && <Star className="h-3.5 w-3.5 fill-current" />}
                {tp.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Mesa de trabalho */}
      <div className="overflow-hidden rounded-2xl border border-border bg-kyber-black/70">
        {/* Barra de ferramentas: zoom + paginação */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-white/[0.03] px-4 py-2.5">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-white/[0.03] p-0.5">
            {ZOOM_OPTIONS.map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => setZoom(opt.value)}
                className={cn(
                  "focus-ring rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                  zoom === opt.value
                    ? "bg-kyber-green/15 text-kyber-green"
                    : "text-kyber-gray hover:text-kyber-soft"
                )}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-kyber-gray">
            <button
              disabled
              aria-label={t("common.previous")}
              className="rounded-md p-1 text-kyber-dim opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span>{t("pdf.pageOf", { current: 1, total: 1 })}</span>
            <button
              disabled
              aria-label={t("common.next")}
              className="rounded-md p-1 text-kyber-dim opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <Badge tone="gray">
            {template.name} · {t(`pdf.style_${template.style}`)}
          </Badge>
        </div>

        {/* Área da folha */}
        <div className="bg-grid min-h-[60vh] overflow-x-auto p-4 sm:p-10">
          <div
            className={cn("mx-auto transition-[width] duration-300", zoom === "fit" && "max-w-[680px]")}
            style={{ width: sheetWidth }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={`${quote.id}-${template.id}`}
                initial={{ opacity: 0, x: 48, rotate: 0.4 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                exit={{ opacity: 0, x: -48, rotate: -0.4 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <PdfDocument
                  template={template}
                  quote={quote}
                  customer={customer}
                  company={MOCK_COMPANY}
                  className="shadow-2xl ring-1 ring-black/40"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Overlay "gerando PDF" */}
      <AnimatePresence>
        {genStep >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="glass-card w-full max-w-sm p-7"
            >
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-kyber-green/15 text-kyber-green shadow-glow-sm">
                  <FileText className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-base font-semibold text-kyber-white">
                    {t("pdf.generatingTitle")}
                  </p>
                  <p className="text-xs text-kyber-gray">{quote.number}</p>
                </div>
              </div>

              <Progress value={((genStep + 1) / GEN_STEP_KEYS.length) * 100} className="mb-5" />

              <ul className="space-y-3">
                {GEN_STEP_KEYS.map((key, i) => {
                  const done = i < genStep;
                  const active = i === genStep;
                  return (
                    <li key={key} className="flex items-center gap-3">
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-kyber-green" />
                      ) : active ? (
                        <Loader2 className="h-4 w-4 shrink-0 animate-spin text-kyber-green" />
                      ) : (
                        <span className="mx-1 h-2 w-2 shrink-0 rounded-full bg-white/15" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          done && "text-kyber-gray line-through decoration-kyber-dim",
                          active && "font-medium text-kyber-soft",
                          !done && !active && "text-kyber-dim"
                        )}
                      >
                        {t(key)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
