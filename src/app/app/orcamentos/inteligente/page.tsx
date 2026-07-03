"use client";

/**
 * Gerador de orçamento por IA (Modo Inteligente).
 * Fluxo simulado: escolha do tipo → coleta dos critérios em chat →
 * cálculo animado com as regras da empresa → orçamento editável ao vivo.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  CheckCircle2,
  FileDown,
  FolderKanban,
  Loader2,
  MessageCircle,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { AnimatedCounter, PageTransition } from "@/components/motion";
import { PdfProgressModal } from "@/components/quotes/pdf-progress-modal";
import { QuoteItemsEditor, newQuoteItem } from "@/components/quotes/quote-items-editor";
import { useI18n } from "@/lib/i18n";
import { MOCK_COMPANY, MOCK_CUSTOMERS, MOCK_QUOTE_CRITERIA, MOCK_QUOTE_TYPES } from "@/lib/mock/data";
import { cn, formatCurrency } from "@/lib/utils";
import type { QuoteCriterion, QuoteItem, QuoteType } from "@/lib/types";

type Phase = "type" | "collect" | "calculating" | "ready";

interface ChatMsg {
  id: number;
  from: "ai" | "user";
  text: string;
}

interface AnswerEntry {
  criterionId: string;
  label: string;
  display: string;
  value: number | string | boolean | null;
}

const AI_DELAY = 800;
const CALC_STEP_KEYS = ["quotes.calcStepMeters", "quotes.calcStepHeight", "quotes.calcStepDistance"];

/** Critérios do tipo — com fallback para o conjunto padrão quando o tipo não tem critérios próprios. */
function criteriaFor(type: QuoteType): QuoteCriterion[] {
  const own = MOCK_QUOTE_CRITERIA.filter((c) => c.quoteTypeId === type.id).sort((a, b) => a.order - b.order);
  return own.length > 0 ? own : [...MOCK_QUOTE_CRITERIA].sort((a, b) => a.order - b.order);
}

const num = (v: unknown) => (typeof v === "number" ? v : Number(v) || 0);

/** Monta os itens do orçamento a partir das respostas, seguindo as regras dos mocks. */
function buildItems(entries: AnswerEntry[]): QuoteItem[] {
  const byLabel = (re: RegExp) => entries.find((e) => re.test(e.label) && e.value !== null);
  const metros = num(byLabel(/metro/i)?.value ?? entries.find((e) => typeof e.value === "number")?.value);
  const tipo = String(byLabel(/tipo/i)?.value ?? "").toLowerCase();
  const alturaAlta = /acima/i.test(String(byLabel(/altura/i)?.value ?? ""));
  const km = num(byLabel(/desloc|dist|km/i)?.value);
  const pintura = byLabel(/pintura|pintar/i)?.value === true;

  // Regras dos mocks: lisa 45/m | ondulada 52/m | premium 78/m.
  const precoMetro = tipo.includes("premium") ? 78 : tipo.includes("ondulada") ? 52 : 45;
  const tipoNome = tipo.includes("premium") ? "premium alumínio" : tipo.includes("ondulada") ? "ondulada" : "lisa";

  const items: QuoteItem[] = [];
  if (metros > 0) {
    items.push(newQuoteItem(`Calha ${tipoNome}`, metros, "m", precoMetro));
    items.push(newQuoteItem("Condutor de descida 100mm", Math.max(2, Math.ceil(metros / 8)), "un", 85));
  }
  // Mão de obra: base por metro, +20% acima de 6m (regra do mock).
  const maoDeObraBase = Math.max(350, Math.round(metros * 30));
  const maoDeObra = alturaAlta ? Math.round(maoDeObraBase * 1.2) : maoDeObraBase;
  items.push(
    newQuoteItem(alturaAlta ? "Mão de obra de instalação (altura > 6m)" : "Mão de obra de instalação", 1, "vb", maoDeObra)
  );
  // Deslocamento: 3,50/km acima de 20km (regra do mock).
  if (km > 20) items.push(newQuoteItem(`Deslocamento (${km} km)`, km, "km", 3.5));
  if (pintura && metros > 0) items.push(newQuoteItem("Pintura das calhas", metros, "m", 12));
  return items;
}

export default function IntelligentQuotePage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>("type");
  const [selectedType, setSelectedType] = useState<QuoteType | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [typing, setTyping] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(-1);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [calcStep, setCalcStep] = useState(0);

  const [items, setItems] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerId, setCustomerId] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [pdfOpen, setPdfOpen] = useState(false);

  const runRef = useRef(0);
  const msgSeq = useRef(0);
  const startedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const intelligentTypes = useMemo(() => MOCK_QUOTE_TYPES.filter((qt) => qt.mode === "intelligent"), []);
  const criteria = useMemo(() => (selectedType ? criteriaFor(selectedType) : []), [selectedType]);

  const subtotal = useMemo(() => Math.round(items.reduce((acc, i) => acc + i.total, 0) * 100) / 100, [items]);
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);

  const customerName =
    customerId === "new"
      ? newCustomerName.trim() || t("quotes.customerNewOption").replace("➕ ", "")
      : MOCK_CUSTOMERS.find((c) => c.id === customerId)?.name ?? "";

  /** Fala da IA com indicador de digitação (~800ms por mensagem). */
  const aiSay = (texts: string[], after?: () => void) => {
    const run = runRef.current;
    const emit = (i: number) => {
      if (run !== runRef.current) return;
      if (i >= texts.length) {
        after?.();
        return;
      }
      setTyping(true);
      window.setTimeout(() => {
        if (run !== runRef.current) return;
        setTyping(false);
        setMessages((m) => [...m, { id: ++msgSeq.current, from: "ai", text: texts[i] }]);
        window.setTimeout(() => emit(i + 1), 260);
      }, AI_DELAY);
    };
    emit(0);
  };

  const userSay = (text: string) => setMessages((m) => [...m, { id: ++msgSeq.current, from: "user", text }]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    aiSay([t("quotes.aiGreeting", { company: MOCK_COMPANY.name })]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalida timers pendentes ao desmontar (todos checam runRef antes de atualizar estado).
  useEffect(() => {
    const run = runRef;
    return () => {
      run.current += 1;
    };
  }, []);

  // Auto-scroll do chat.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing, calcStep, phase]);

  const questionFor = (c: QuoteCriterion) => {
    switch (c.fieldType) {
      case "number":
        return t("quotes.askNumber", { label: c.label });
      case "select":
        return t("quotes.askSelect", { label: c.label });
      case "boolean":
        return c.label.trim().endsWith("?") ? c.label : `${c.label}?`;
      case "currency":
        return t("quotes.askCurrency", { label: c.label });
      default:
        return t("quotes.askText", { label: c.label });
    }
  };

  const selectType = (type: QuoteType) => {
    const crits = criteriaFor(type);
    setSelectedType(type);
    setPhase("collect");
    userSay(type.name);
    aiSay([t("quotes.aiTypeConfirm", { type: type.name, count: crits.length }), questionFor(crits[0])], () =>
      setQuestionIndex(0)
    );
  };

  const startCalculation = (finalAnswers: AnswerEntry[]) => {
    const run = runRef.current;
    setPhase("calculating");
    setCalcStep(0);
    CALC_STEP_KEYS.forEach((_, i) => {
      window.setTimeout(() => {
        if (run === runRef.current) setCalcStep(i + 1);
      }, 700 * (i + 1));
    });
    window.setTimeout(() => {
      if (run !== runRef.current) return;
      const built = buildItems(finalAnswers);
      const builtTotal = Math.round(built.reduce((acc, i) => acc + i.total, 0) * 100) / 100;
      setItems(built);
      setPhase("ready");
      aiSay([t("quotes.aiAllDone", { total: formatCurrency(builtTotal) })]);
    }, 700 * CALC_STEP_KEYS.length + 500);
  };

  const answer = (criterion: QuoteCriterion, value: number | string | boolean | null, display: string) => {
    const entry: AnswerEntry = { criterionId: criterion.id, label: criterion.label, display, value };
    const nextAnswers = [...answers, entry];
    userSay(display);
    setAnswers(nextAnswers);
    setInputValue("");
    setQuestionIndex(-1);
    const next = nextAnswers.length;
    if (next < criteria.length) {
      aiSay([questionFor(criteria[next])], () => setQuestionIndex(next));
    } else {
      startCalculation(nextAnswers);
    }
  };

  const restart = () => {
    runRef.current += 1;
    setPhase("type");
    setSelectedType(null);
    setMessages([]);
    setTyping(false);
    setQuestionIndex(-1);
    setAnswers([]);
    setInputValue("");
    setCalcStep(0);
    setItems([]);
    setDiscount(0);
    aiSay([t("quotes.aiGreeting", { company: MOCK_COMPANY.name })]);
  };

  const current = phase === "collect" && questionIndex >= 0 ? criteria[questionIndex] : null;

  const submitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!current || !inputValue.trim()) return;
    if (current.fieldType === "number") answer(current, Number(inputValue) || 0, inputValue.trim());
    else if (current.fieldType === "currency") answer(current, Number(inputValue) || 0, formatCurrency(Number(inputValue) || 0));
    else answer(current, inputValue.trim(), inputValue.trim());
  };

  const ready = phase === "ready";
  const answeredChips = answers.filter((a) => a.value !== null);

  const sendWhatsApp = () =>
    toast("success", t("quotes.whatsappSentTitle"), t("quotes.whatsappSentDescription", { name: customerName || "—" }));
  const saveCrm = () => toast("success", t("quotes.crmSavedTitle"), t("quotes.crmSavedDescription"));

  return (
    <PageTransition>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 font-display text-2xl font-bold text-kyber-white">
            <Sparkles className="h-6 w-6 text-kyber-green" />
            {t("quotes.intelligentTitle")}
          </h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("quotes.intelligentSubtitle")}</p>
        </div>
        <Button variant="ghost" onClick={restart}>
          <RotateCcw className="h-4 w-4" />
          {t("quotes.restart")}
        </Button>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* ---------------- Coluna: conversa com a IA ---------------- */}
        <div className="glass-card flex h-[600px] flex-col overflow-hidden !p-0">
          {/* Cabeçalho do chat */}
          <div className="flex items-center gap-3 border-b border-border bg-white/[0.04] px-4 py-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-green text-kyber-black">
              <Sparkles className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-kyber-white">{t("quotes.chatHeader")}</p>
              <p className="flex items-center gap-1 text-[11px] text-kyber-green">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-kyber-green" />
                {t("quotes.chatOnline")}
              </p>
            </div>
            {phase === "collect" && (
              <div className="hidden w-44 sm:block">
                <p className="mb-1 text-right text-[11px] text-kyber-dim">
                  {t("quotes.progressLabel", { current: answers.length, total: criteria.length })}
                </p>
                <Progress value={(answers.length / Math.max(1, criteria.length)) * 100} />
              </div>
            )}
          </div>

          {/* Progresso mobile */}
          {phase === "collect" && (
            <div className="border-b border-border px-4 py-2 sm:hidden">
              <p className="mb-1 text-[11px] text-kyber-dim">
                {t("quotes.progressLabel", { current: answers.length, total: criteria.length })}
              </p>
              <Progress value={(answers.length / Math.max(1, criteria.length)) * 100} />
            </div>
          )}

          {/* Mensagens */}
          <div ref={scrollRef} className="flex-1 space-y-2.5 overflow-y-auto p-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 28 }}
                  className={cn("flex", msg.from === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow",
                      msg.from === "user"
                        ? "rounded-br-sm bg-kyber-deep/90 text-white"
                        : "rounded-bl-sm bg-white/10 text-kyber-soft"
                    )}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Cards de escolha do tipo */}
            {phase === "type" && messages.length > 0 && !typing && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-2.5 pt-1 sm:grid-cols-2"
              >
                {intelligentTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectType(type)}
                    className="focus-ring group rounded-xl border border-border bg-white/[0.03] p-4 text-left transition-colors hover:border-kyber-green/40 hover:bg-kyber-green/[0.06]"
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-display text-sm font-semibold text-kyber-white group-hover:text-kyber-green">
                        {type.name}
                      </span>
                      <Sparkles className="h-4 w-4 shrink-0 text-kyber-green" />
                    </span>
                    <span className="mt-1.5 block text-xs leading-relaxed text-kyber-gray">{type.description}</span>
                    <Badge tone="gray" className="mt-3">
                      {t("quotes.typeCriteriaCount", { count: criteriaFor(type).length })}
                    </Badge>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Animação de cálculo */}
            {phase === "calculating" && (
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/10 px-4 py-3.5">
                  <p className="flex items-center gap-2 text-[13px] font-medium text-kyber-white">
                    <Loader2 className="h-4 w-4 animate-spin text-kyber-green" />
                    {t("quotes.calculatingTitle")}
                  </p>
                  <ul className="mt-2.5 space-y-1.5">
                    {CALC_STEP_KEYS.map((key, i) => (
                      <AnimatePresence key={key}>
                        {calcStep >= i && (
                          <motion.li
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-2 text-xs text-kyber-gray"
                          >
                            {calcStep > i ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-kyber-green" />
                            ) : (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-kyber-dim" />
                            )}
                            {t(key)}
                          </motion.li>
                        )}
                      </AnimatePresence>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Indicador de digitação */}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl bg-white/10 px-4 py-3">
                  {[0, 1, 2].map((d) => (
                    <motion.span
                      key={d}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                      className="h-1.5 w-1.5 rounded-full bg-white/70"
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Área de resposta */}
          {current && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border bg-white/[0.02] p-3"
            >
              {current.fieldType === "select" && current.options ? (
                <div className="flex flex-wrap gap-2">
                  {current.options.map((opt) => (
                    <Button key={opt} variant="secondary" size="sm" onClick={() => answer(current, opt, opt)}>
                      {opt}
                    </Button>
                  ))}
                </div>
              ) : current.fieldType === "boolean" ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" size="sm" onClick={() => answer(current, true, t("common.yes"))}>
                    <Check className="h-3.5 w-3.5 text-kyber-green" />
                    {t("common.yes")}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => answer(current, false, t("common.no"))}>
                    <X className="h-3.5 w-3.5 text-red-400" />
                    {t("common.no")}
                  </Button>
                </div>
              ) : (
                <form onSubmit={submitTyped} className="flex items-center gap-2">
                  <Input
                    autoFocus
                    type={current.fieldType === "text" ? "text" : "number"}
                    min={0}
                    step="any"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder={
                      current.fieldType === "currency"
                        ? t("quotes.answerCurrencyPlaceholder")
                        : current.fieldType === "number"
                          ? t("quotes.answerNumberPlaceholder")
                          : t("quotes.answerTextPlaceholder")
                    }
                    className="h-10"
                    icon={current.fieldType === "currency" ? <span className="text-xs">R$</span> : undefined}
                  />
                  <Button type="submit" size="icon" aria-label={t("quotes.answerSend")} disabled={!inputValue.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              )}
              {!current.required && (
                <button
                  onClick={() => answer(current, null, t("quotes.skipped"))}
                  className="focus-ring mt-2 rounded-lg px-1 text-xs text-kyber-dim transition-colors hover:text-kyber-gray"
                >
                  {t("quotes.skipOptional")}
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* ---------------- Coluna: painel do orçamento ---------------- */}
        <div className="glass-card space-y-5 !p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-display text-base font-semibold text-kyber-white">
                {selectedType ? selectedType.name : t("quotes.panelTitle")}
              </h2>
              {selectedType && customerName && <p className="truncate text-xs text-kyber-gray">{customerName}</p>}
            </div>
            <Badge tone={ready ? "green" : "neon"} dot>
              {t("quotes.panelLive")}
            </Badge>
          </div>

          {/* Dados coletados */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-kyber-dim">{t("quotes.collectedData")}</p>
            {answeredChips.length === 0 ? (
              <p className="rounded-xl border border-dashed border-white/10 px-3 py-3 text-xs text-kyber-dim">
                {t("quotes.collectedEmpty")}
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <AnimatePresence initial={false}>
                  {answeredChips.map((a) => (
                    <motion.span
                      key={a.criterionId}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-kyber-green/25 bg-kyber-green/10 px-2.5 py-1 text-[11px] text-kyber-mint"
                    >
                      <span className="truncate opacity-70">{a.label}:</span>
                      <span className="shrink-0 font-semibold text-kyber-green">{a.display}</span>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Cliente */}
          <div className="space-y-3">
            <Select
              label={t("quotes.customerLabel")}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              placeholder={t("quotes.customerPlaceholder")}
              options={[
                ...MOCK_CUSTOMERS.map((c) => ({ value: c.id, label: c.name })),
                { value: "new", label: t("quotes.customerNewOption") },
              ]}
            />
            <AnimatePresence initial={false}>
              {customerId === "new" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <Input
                    label={t("quotes.newCustomerName")}
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    placeholder={t("quotes.newCustomerNamePlaceholder")}
                  />
                  <Input
                    label={t("quotes.newCustomerPhone")}
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    placeholder={t("quotes.newCustomerPhonePlaceholder")}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Itens */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-kyber-dim">{t("common.items")}</p>
            {ready ? (
              <QuoteItemsEditor items={items} onChange={setItems} />
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-white/10 px-4 py-6">
                {phase === "calculating" ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-kyber-green" />
                ) : (
                  <Sparkles className="h-4 w-4 shrink-0 text-kyber-dim" />
                )}
                <p className="text-xs text-kyber-dim">{t("quotes.itemsEmpty")}</p>
              </div>
            )}
          </div>

          {/* Totais */}
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
                className="focus-ring h-9 w-28 rounded-lg border border-border bg-white/[0.04] px-2.5 text-right text-sm text-kyber-soft"
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

          {/* Ações finais */}
          <div className="grid gap-2">
            <Button variant="glow" size="lg" disabled={!ready} onClick={() => setPdfOpen(true)}>
              <FileDown className="h-4 w-4" />
              {t("quotes.generatePdf")}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="secondary" disabled={!ready} onClick={sendWhatsApp}>
                <MessageCircle className="h-4 w-4" />
                {t("common.sendWhatsApp")}
              </Button>
              <Button variant="outline" disabled={!ready} onClick={saveCrm}>
                <FolderKanban className="h-4 w-4" />
                {t("quotes.saveCrm")}
              </Button>
            </div>
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
