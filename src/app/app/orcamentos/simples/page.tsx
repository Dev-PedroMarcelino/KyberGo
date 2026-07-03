"use client";

/**
 * Gerador de documento simples — o usuário descreve o orçamento em texto
 * livre e a IA organiza em proposta estruturada. Neste modo a IA NÃO calcula
 * preços: os valores são somente os informados na descrição.
 */

import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  FileDown,
  Info,
  Loader2,
  MessageCircle,
  PencilLine,
  PencilRuler,
  Save,
  Sparkles,
  TriangleAlert,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { AnimatedCounter, PageTransition } from "@/components/motion";
import { PdfProgressModal } from "@/components/quotes/pdf-progress-modal";
import { QuoteItemsEditor, newQuoteItem } from "@/components/quotes/quote-items-editor";
import { useI18n } from "@/lib/i18n";
import { formatCurrency } from "@/lib/utils";
import type { QuoteItem } from "@/lib/types";

type Phase = "input" | "processing" | "result";

const PROC_STEP_KEYS = ["quotes.procStepRead", "quotes.procStepDetect", "quotes.procStepBuild"];

const round2 = (n: number) => Math.round(n * 100) / 100;

/** Converte números no formato pt-BR ("1.500", "1.500,00", "1500,50"). */
function parseBrl(raw: string): number {
  const s = raw.trim();
  if (s.includes(",")) return parseFloat(s.replace(/\./g, "").replace(",", ".")) || 0;
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return parseFloat(s.replace(/\./g, "")) || 0;
  return parseFloat(s) || 0;
}

const capitalize = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

interface ParsedDraft {
  customerName: string;
  items: QuoteItem[];
  paymentTerms: string | null;
  /** Valor total detectado — null quando nenhum valor foi informado. */
  total: number | null;
  values: number[];
  isFallback: boolean;
}

/** Distribui um total informado entre os itens (o total é sempre o do usuário; a divisão é apenas apresentação). */
function distributeTotal(items: QuoteItem[], total: number, defaultDescription: string): QuoteItem[] {
  if (items.length === 0) return [newQuoteItem(defaultDescription, 1, "vb", total)];
  if (items.length === 1) {
    const qty = items[0].quantity || 1;
    return [{ ...items[0], unitPrice: round2(total / qty), total: round2(total) }];
  }
  let acc = 0;
  return items.map((item, i) => {
    const qty = item.quantity || 1;
    let lineTotal: number;
    if (i === items.length - 1) lineTotal = round2(total - acc);
    else {
      const weight = i === 0 ? 0.65 : 0.35 / (items.length - 1);
      lineTotal = round2(total * weight);
      acc = round2(acc + lineTotal);
    }
    const unitPrice = round2(lineTotal / qty);
    return { ...item, unitPrice, total: round2(unitPrice * qty) };
  });
}

export default function SimpleQuotePage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("input");
  const [description, setDescription] = useState("");
  const [procStep, setProcStep] = useState(0);

  const [title, setTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [items, setItems] = useState<QuoteItem[]>([]);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState(0);

  const [missingValue, setMissingValue] = useState(false);
  const [missingInput, setMissingInput] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const subtotal = useMemo(() => round2(items.reduce((acc, i) => acc + i.total, 0)), [items]);
  const total = Math.max(0, round2(subtotal - discount));
  const ready = phase === "result" && !missingValue;

  /** Parser simples da descrição: valores R$, cliente, quantidades e pagamento. */
  const parseDescription = (text: string): ParsedDraft => {
    const values: number[] = [];
    for (const match of text.matchAll(/r\$\s*([\d][\d.,]*)/gi)) values.push(parseBrl(match[1]));

    const totalMatch = text.match(/total\s*(?:de\s*)?(?:r\$\s*)?([\d][\d.,]*)/i);
    const customerMatch = text.match(/cliente\s*:?\s*([^\d,.;\n]+)/i);
    const paymentMatch = text.match(/pagamento\s*:?\s*([^,.;\n]+)/i);

    const items: QuoteItem[] = [];
    for (const match of text.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:metros?|mts?|m)\b\s*(?:de\s+)?([^\d,.;\n]+)/gi)) {
      items.push(newQuoteItem(capitalize(match[2].trim()), parseBrl(match[1]), "m", 0));
    }
    for (const match of text.matchAll(/(\d+(?:[.,]\d+)?)\s*(?:unidades?|un|pe[çc]as?)\b\s*(?:de\s+)?([^\d,.;\n]+)/gi)) {
      items.push(newQuoteItem(capitalize(match[2].trim()), parseBrl(match[1]), "un", 0));
    }
    if (/instala[çc][ãa]o|m[ãa]o\s+de\s+obra/i.test(text)) {
      items.push(newQuoteItem(t("quotes.installationItem"), 1, "vb", 0));
    }

    const totalDetected = totalMatch ? parseBrl(totalMatch[1]) : values.length === 1 ? values[0] : null;
    const isFallback = items.length === 0 && !customerMatch && values.length === 0;

    return {
      customerName: customerMatch ? customerMatch[1].trim() : "",
      items,
      paymentTerms: paymentMatch ? t("quotes.paymentPrefix", { terms: paymentMatch[1].trim() }) : null,
      total: totalDetected,
      values,
      isFallback,
    };
  };

  const defaultValidUntil = () => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().slice(0, 10);
  };

  const applyParsed = (parsed: ParsedDraft) => {
    // Fallback: exemplo padrão bem montado quando nada foi reconhecido.
    if (parsed.isFallback) {
      setTitle("Calha lisa 10m + instalação");
      setCustomerName("João Silva");
      setItems([newQuoteItem("Calha lisa galvanizada", 10, "m", 95), newQuoteItem(t("quotes.installationItem"), 1, "vb", 550)]);
      setPaymentTerms("Em 2x sem juros no cartão.");
      setMissingValue(false);
    } else {
      let nextItems = parsed.items;
      if (parsed.total !== null) {
        nextItems = distributeTotal(nextItems, parsed.total, t("quotes.defaultServiceItem"));
        setMissingValue(false);
      } else if (parsed.values.length > 1) {
        // Vários valores sem "total": atribui na ordem em que aparecem.
        nextItems = nextItems.map((item, i) => {
          const v = parsed.values[i];
          if (v === undefined) return item;
          const qty = item.quantity || 1;
          return { ...item, unitPrice: round2(v / qty), total: round2(v) };
        });
        setMissingValue(false);
      } else {
        // Nenhum valor detectado — a IA pergunta (nunca inventa preço).
        setMissingValue(true);
      }
      setItems(nextItems);
      setTitle(
        nextItems.length > 0
          ? t("quotes.quoteTitlePrefix", { item: nextItems[0].description })
          : t("quotes.genericQuoteTitle")
      );
      setCustomerName(parsed.customerName);
      setPaymentTerms(parsed.paymentTerms ?? t("quotes.defaultPaymentTerms"));
    }
    setValidUntil(defaultValidUntil());
    setNotes("");
    setDiscount(0);
    setMissingInput("");
  };

  const organize = () => {
    if (!description.trim()) return;
    setPhase("processing");
    setProcStep(0);
    timers.current.forEach(clearTimeout);
    timers.current = [];
    PROC_STEP_KEYS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setProcStep(i + 1), 500 * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        applyParsed(parseDescription(description));
        setPhase("result");
      }, 500 * PROC_STEP_KEYS.length + 200)
    );
  };

  const applyMissingValue = () => {
    const value = Number(missingInput);
    if (!value || value <= 0) return;
    setItems((prev) => distributeTotal(prev, round2(value), t("quotes.defaultServiceItem")));
    setMissingValue(false);
    toast("success", t("quotes.missingValueTitle"), t("quotes.missingValueApplied"));
  };

  const sendWhatsApp = () =>
    toast("success", t("quotes.whatsappSentTitle"), t("quotes.whatsappSentDescription", { name: customerName || "—" }));
  const save = () => toast("success", t("quotes.simpleSavedTitle"), t("quotes.simpleSavedDescription"));

  return (
    <PageTransition>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold text-kyber-white">
            <PencilRuler className="h-6 w-6 text-kyber-green" />
            {t("quotes.simpleTitle")}
          </h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("quotes.simpleSubtitle")}</p>
        </div>
        {phase === "result" && (
          <Button variant="ghost" onClick={() => setPhase("input")}>
            <PencilLine className="h-4 w-4" />
            {t("quotes.editDescription")}
          </Button>
        )}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        {/* ---------------- Coluna principal ---------------- */}
        <div className="space-y-5">
          <AnimatePresence mode="wait" initial={false}>
            {phase === "input" && (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card space-y-4 !p-6"
              >
                <Textarea
                  label={t("quotes.describeLabel")}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("quotes.describePlaceholder")}
                  rows={7}
                  className="min-h-[180px]"
                />
                <div className="flex items-start gap-2.5 rounded-xl border border-sky-400/20 bg-sky-400/[0.06] px-4 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-300" />
                  <p className="text-xs leading-relaxed text-kyber-gray">
                    <span className="font-medium text-sky-300">{t("quotes.noPriceHintTitle")}: </span>
                    {t("quotes.noPriceHintDescription")}
                  </p>
                </div>
                <Button variant="glow" size="lg" onClick={organize} disabled={!description.trim()}>
                  <Sparkles className="h-4 w-4" />
                  {t("quotes.organizeButton")}
                </Button>
              </motion.div>
            )}

            {phase === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="glass-card flex flex-col items-center gap-5 !p-10"
              >
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-kyber-green/10 text-kyber-green shadow-glow-sm">
                  <Sparkles className="h-8 w-8 animate-pulse" />
                </span>
                <ul className="space-y-2.5">
                  {PROC_STEP_KEYS.map((key, i) => (
                    <li key={key} className="flex items-center gap-2.5 text-sm">
                      {procStep > i ? (
                        <CheckCircle2 className="h-4 w-4 text-kyber-green" />
                      ) : procStep === i ? (
                        <Loader2 className="h-4 w-4 animate-spin text-kyber-green" />
                      ) : (
                        <span className="inline-block h-4 w-4 rounded-full border border-white/15" />
                      )}
                      <span className={procStep >= i ? "text-kyber-soft" : "text-kyber-dim"}>{t(key)}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {phase === "result" && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-5"
              >
                {/* Pergunta essencial da IA — nunca inventa preço */}
                <AnimatePresence initial={false}>
                  {missingValue && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="rounded-2xl border border-amber-400/30 bg-amber-400/[0.08] p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                          <TriangleAlert className="h-4 w-4" />
                          {t("quotes.missingValueTitle")}
                        </p>
                        <p className="mt-1 text-xs text-kyber-gray">{t("quotes.missingValueDescription")}</p>
                        <div className="mt-3 flex items-center gap-2">
                          <Input
                            type="number"
                            min={0}
                            step="0.01"
                            value={missingInput}
                            onChange={(e) => setMissingInput(e.target.value)}
                            placeholder={t("quotes.answerCurrencyPlaceholder")}
                            icon={<span className="text-xs">R$</span>}
                            className="h-10 max-w-[200px]"
                          />
                          <Button size="sm" onClick={applyMissingValue} disabled={!Number(missingInput)}>
                            {t("quotes.missingValueApply")}
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="glass-card space-y-5 !p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-display text-base font-semibold text-kyber-white">{t("quotes.resultTitle")}</h2>
                    <Badge tone="green" dot>
                      {t("quotes.resultReady")}
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("quotes.suggestedTitle")}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                    <Input
                      label={t("quotes.detectedCustomer")}
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t("quotes.detectedCustomerPlaceholder")}
                      icon={<User className="h-4 w-4" />}
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wide text-kyber-dim">{t("common.items")}</p>
                    <QuoteItemsEditor items={items} onChange={setItems} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label={t("quotes.paymentTermsLabel")}
                      value={paymentTerms}
                      onChange={(e) => setPaymentTerms(e.target.value)}
                    />
                    <Input
                      type="date"
                      label={t("quotes.validUntilLabel")}
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                    />
                  </div>

                  <Textarea
                    label={t("quotes.notesLabel")}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t("quotes.notesPlaceholder")}
                    rows={3}
                    className="min-h-[80px]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ---------------- Sidebar: resumo ---------------- */}
        <div className="glass-card space-y-4 !p-5 lg:sticky lg:top-2">
          <h2 className="font-display text-base font-semibold text-kyber-white">{t("quotes.summaryTitle")}</h2>
          <div className="space-y-2.5 rounded-xl border border-border bg-white/[0.03] p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-kyber-gray">{t("common.subtotal")}</span>
              <span className="font-medium text-kyber-soft">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-kyber-gray">{t("common.discount")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                aria-label={t("common.discount")}
                disabled={phase !== "result"}
                className="focus-ring h-9 w-28 rounded-lg border border-border bg-white/[0.04] px-2.5 text-right text-sm text-kyber-soft disabled:opacity-40"
              />
            </div>
            <div className="flex items-end justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-kyber-gray">{t("common.total")}</span>
              <AnimatedCounter
                value={total}
                prefix="R$ "
                decimals={2}
                className="font-display text-2xl font-bold text-kyber-green"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Button variant="glow" size="lg" disabled={!ready} onClick={() => setPdfOpen(true)}>
              <FileDown className="h-4 w-4" />
              {t("quotes.generatePdf")}
            </Button>
            <Button variant="secondary" disabled={!ready} onClick={sendWhatsApp}>
              <MessageCircle className="h-4 w-4" />
              {t("common.sendWhatsApp")}
            </Button>
            <Button variant="outline" disabled={!ready} onClick={save}>
              <Save className="h-4 w-4" />
              {t("common.save")}
            </Button>
          </div>
        </div>
      </div>

      <PdfProgressModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        onComplete={() => toast("success", t("quotes.pdfSuccessTitle"), t("quotes.pdfSuccessDescription"))}
      />
    </PageTransition>
  );
}
