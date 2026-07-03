"use client";

/**
 * Detalhe do orçamento — preview da proposta em estilo "papel" (1ª página
 * do PDF), linha do tempo, edição de desconto ao vivo e ações rápidas.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Download, MessageCircle, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { PageTransition } from "@/components/motion";
import { QuoteModeBadge, QuoteSourceLabel, QuoteStatusBadge, QUOTE_STATUS_KEYS } from "@/components/quotes/quote-badges";
import { useI18n } from "@/lib/i18n";
import { MOCK_COMPANY, MOCK_CUSTOMERS, MOCK_PDF_TEMPLATES, MOCK_QUOTES } from "@/lib/mock/data";
import { cn, formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { Quote, QuoteStatus } from "@/lib/types";

const STATUS_RANK: Record<QuoteStatus, number> = {
  draft: 0,
  sent: 1,
  viewed: 2,
  negotiating: 3,
  accepted: 4,
  rejected: 4,
  expired: 1,
};

const round2 = (n: number) => Math.round(n * 100) / 100;
const addHours = (iso: string, hours: number) => new Date(new Date(iso).getTime() + hours * 3600_000).toISOString();

interface TimelineEvent {
  labelKey: string;
  date: string | null;
  done: boolean;
  tone: "green" | "red" | "pending";
}

function buildTimeline(quote: Quote): TimelineEvent[] {
  const rank = STATUS_RANK[quote.status];
  const created: TimelineEvent = { labelKey: "quotes.timelineCreated", date: quote.createdAt, done: true, tone: "green" };

  if (quote.status === "expired") {
    return [
      created,
      { labelKey: "quotes.timelineSent", date: addHours(quote.createdAt, 3), done: true, tone: "green" },
      { labelKey: "quotes.timelineExpired", date: quote.validUntil, done: true, tone: "red" },
    ];
  }

  const dateFor = (step: number, fallbackHours: number) =>
    rank >= step ? (rank === step ? quote.updatedAt : addHours(quote.createdAt, fallbackHours)) : null;

  const finalKey = quote.status === "rejected" ? "quotes.timelineRejected" : "quotes.timelineAccepted";
  return [
    created,
    { labelKey: "quotes.timelineSent", date: dateFor(1, 3), done: rank >= 1, tone: rank >= 1 ? "green" : "pending" },
    { labelKey: "quotes.timelineViewed", date: dateFor(2, 26), done: rank >= 2, tone: rank >= 2 ? "green" : "pending" },
    {
      labelKey: "quotes.timelineNegotiating",
      date: dateFor(3, 52),
      done: rank >= 3,
      tone: rank >= 3 ? "green" : "pending",
    },
    {
      labelKey: finalKey,
      date: rank >= 4 ? quote.updatedAt : null,
      done: rank >= 4,
      tone: rank >= 4 ? (quote.status === "rejected" ? "red" : "green") : "pending",
    },
  ];
}

export default function QuoteDetailPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const params = useParams<{ id: string }>();

  const [quote, setQuote] = useState<Quote>(
    () => MOCK_QUOTES.find((q) => q.id === params.id) ?? MOCK_QUOTES[0]
  );

  const customer = MOCK_CUSTOMERS.find((c) => c.id === quote.customerId);
  const template = MOCK_PDF_TEMPLATES[0];
  const primary = template.colors.primary;

  const subtotal = quote.subtotal;
  const timeline = useMemo(() => buildTimeline(quote), [quote]);

  const setDiscount = (value: number) => {
    const discount = Math.min(subtotal, Math.max(0, round2(value)));
    setQuote((q) => ({ ...q, discount, total: round2(q.subtotal - discount) }));
  };

  const applyQuickDiscount = (percent: number) => {
    const discount = round2((subtotal * percent) / 100);
    const total = round2(subtotal - discount);
    setQuote((q) => ({ ...q, discount, total }));
    toast("success", t("quotes.discountAppliedTitle"), t("quotes.discountAppliedDescription", { percent, total: formatCurrency(total) }));
  };

  const changeStatus = (status: QuoteStatus) => {
    setQuote((q) => ({ ...q, status, updatedAt: new Date().toISOString() }));
    toast("success", t("quotes.statusChangedTitle"), t("quotes.statusChangedDescription", { status: t(QUOTE_STATUS_KEYS[status]) }));
  };

  const statusOptions = (Object.keys(QUOTE_STATUS_KEYS) as QuoteStatus[]).map((status) => ({
    value: status,
    label: t(QUOTE_STATUS_KEYS[status]),
  }));

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8">
        <Link
          href="/app/orcamentos"
          className="focus-ring mb-3 inline-flex items-center gap-1.5 rounded-lg text-sm text-kyber-gray transition-colors hover:text-kyber-green"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("quotes.detailBack")}
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs text-kyber-dim">{quote.number}</p>
            <h1 className="mt-1 font-display text-2xl font-bold text-kyber-white">{quote.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <QuoteStatusBadge status={quote.status} />
              <QuoteModeBadge mode={quote.mode} />
              <span className="text-xs text-kyber-gray">{t("quotes.detailValidUntil", { date: formatDate(quote.validUntil) })}</span>
              <QuoteSourceLabel source={quote.source} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        {/* ---------------- Documento (preview do PDF) ---------------- */}
        <div className="overflow-hidden rounded-2xl bg-white text-[#1c231e] shadow-card">
          {/* Barra da marca */}
          <div className="h-2.5" style={{ background: `linear-gradient(90deg, ${primary}, ${template.colors.accent})` }} />

          <div className="p-6 sm:p-10">
            {/* Cabeçalho do documento */}
            <div className="flex flex-wrap items-start justify-between gap-6 border-b pb-6" style={{ borderColor: `${primary}33` }}>
              <div>
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold text-white"
                    style={{ backgroundColor: primary }}
                  >
                    {MOCK_COMPANY.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-display text-lg font-bold leading-tight">{MOCK_COMPANY.name}</p>
                    <p className="text-xs text-[#5c655e]">{MOCK_COMPANY.segment}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-[#5c655e]">
                  {MOCK_COMPANY.address}
                  <br />
                  {MOCK_COMPANY.phone} · {MOCK_COMPANY.whatsappNumber}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: primary }}>
                  {t("quotes.docProposal")}
                </p>
                <p className="mt-1 font-display text-xl font-bold">{t("quotes.docNumber", { number: quote.number })}</p>
                <p className="mt-2 text-xs text-[#5c655e]">
                  {t("quotes.docIssuedAt", { date: formatDate(quote.createdAt) })}
                  <br />
                  {t("quotes.detailValidUntil", { date: formatDate(quote.validUntil) })}
                </p>
              </div>
            </div>

            {/* Empresa / Cliente */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl bg-[#f4f7f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a938c]">{t("quotes.docCompany")}</p>
                <p className="mt-1.5 text-sm font-semibold">{MOCK_COMPANY.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#5c655e]">
                  {MOCK_COMPANY.address}
                  <br />
                  {MOCK_COMPANY.phone}
                </p>
              </div>
              <div className="rounded-xl bg-[#f4f7f5] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#8a938c]">{t("quotes.docCustomer")}</p>
                <p className="mt-1.5 text-sm font-semibold">{customer?.name ?? "—"}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[#5c655e]">
                  {customer?.address ?? "—"}
                  <br />
                  {customer?.phone ?? ""}
                </p>
              </div>
            </div>

            {/* Descrição */}
            {quote.description && <p className="mt-6 text-sm leading-relaxed text-[#3c453e]">{quote.description}</p>}

            {/* Tabela de itens */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-[#8a938c]" style={{ borderBottom: `2px solid ${primary}` }}>
                    <th className="pb-2 pr-3 font-semibold">{t("quotes.itemDescription")}</th>
                    <th className="pb-2 pr-3 text-right font-semibold">{t("quotes.itemQty")}</th>
                    <th className="pb-2 pr-3 font-semibold">{t("quotes.itemUnit")}</th>
                    <th className="pb-2 pr-3 text-right font-semibold">{t("quotes.itemUnitPrice")}</th>
                    <th className="pb-2 text-right font-semibold">{t("quotes.itemTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.items.map((item, i) => (
                    <tr key={item.id} className={cn("border-b border-[#e8ece9]", i % 2 === 1 && "bg-[#fafcfa]")}>
                      <td className="py-2.5 pr-3">{item.description}</td>
                      <td className="py-2.5 pr-3 text-right">{item.quantity}</td>
                      <td className="py-2.5 pr-3">{item.unit}</td>
                      <td className="py-2.5 pr-3 text-right">{formatCurrency(item.unitPrice)}</td>
                      <td className="py-2.5 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totais */}
            <div className="mt-4 flex justify-end">
              <div className="w-full max-w-[260px] space-y-1.5 text-sm">
                <div className="flex justify-between text-[#5c655e]">
                  <span>{t("common.subtotal")}</span>
                  <span>{formatCurrency(quote.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#5c655e]">
                  <span>{t("common.discount")}</span>
                  <span>− {formatCurrency(quote.discount)}</span>
                </div>
                <div
                  className="flex items-center justify-between rounded-lg px-3 py-2 font-display text-base font-bold text-white"
                  style={{ backgroundColor: primary }}
                >
                  <span>{t("common.total")}</span>
                  <span>{formatCurrency(quote.total)}</span>
                </div>
              </div>
            </div>

            {/* Condições e termos */}
            <div className="mt-8 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: primary }}>
                  {t("quotes.docPaymentTerms")}
                </p>
                <p className="mt-1 text-sm text-[#3c453e]">{quote.paymentTerms}</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: primary }}>
                  {t("quotes.docTerms")}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#5c655e]">{template.terms}</p>
              </div>
            </div>

            {/* Assinaturas */}
            <div className="mt-12 grid gap-10 sm:grid-cols-2">
              <div className="border-t border-[#c8d0ca] pt-2 text-center text-xs text-[#5c655e]">
                {t("quotes.docSignatureCustomer")}
              </div>
              <div className="border-t border-[#c8d0ca] pt-2 text-center text-xs text-[#5c655e]">
                {t("quotes.docSignatureCompany", { company: MOCK_COMPANY.name })}
              </div>
            </div>
          </div>

          {/* Rodapé do documento */}
          <div className="border-t border-[#e8ece9] bg-[#f4f7f5] px-6 py-3 text-center text-[10px] text-[#8a938c]">
            {template.footer}
          </div>
        </div>

        {/* ---------------- Sidebar ---------------- */}
        <div className="space-y-5">
          {/* Linha do tempo */}
          <div className="glass-card !p-5">
            <h2 className="mb-4 font-display text-sm font-semibold text-kyber-white">{t("quotes.timelineTitle")}</h2>
            <ol className="space-y-0">
              {timeline.map((event, i) => (
                <li key={event.labelKey} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < timeline.length - 1 && (
                    <span
                      className={cn(
                        "absolute left-[5px] top-4 h-full w-0.5",
                        event.done ? "bg-kyber-green/40" : "bg-white/10"
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      "relative mt-1 h-3 w-3 shrink-0 rounded-full border-2",
                      event.tone === "green" && "border-kyber-green bg-kyber-green/30 shadow-glow-sm",
                      event.tone === "red" && "border-red-400 bg-red-400/30",
                      event.tone === "pending" && "border-white/20 bg-transparent"
                    )}
                  />
                  <div className="min-w-0">
                    <p className={cn("text-sm font-medium", event.done ? "text-kyber-white" : "text-kyber-dim")}>
                      {t(event.labelKey)}
                    </p>
                    <p className="text-xs text-kyber-dim">
                      {event.date ? formatDateTime(event.date) : t("quotes.timelinePending")}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Valores */}
          <div className="glass-card space-y-3 !p-5">
            <h2 className="font-display text-sm font-semibold text-kyber-white">{t("quotes.valuesTitle")}</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-kyber-gray">{t("common.subtotal")}</span>
              <span className="font-medium text-kyber-soft">{formatCurrency(quote.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-kyber-gray">{t("common.discount")}</span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={quote.discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                aria-label={t("common.discount")}
                className="focus-ring h-9 w-28 rounded-lg border border-border bg-white/[0.04] px-2.5 text-right text-sm text-kyber-soft"
              />
            </div>
            <div>
              <p className="mb-1.5 text-xs text-kyber-dim">{t("quotes.quickDiscount")}</p>
              <div className="flex gap-2">
                {[5, 10].map((percent) => (
                  <Button key={percent} variant="outline" size="sm" onClick={() => applyQuickDiscount(percent)}>
                    <Percent className="h-3 w-3" />
                    {percent}%
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-medium text-kyber-gray">{t("common.total")}</span>
              <span className="font-display text-xl font-bold text-kyber-green">{formatCurrency(quote.total)}</span>
            </div>
          </div>

          {/* Status */}
          <div className="glass-card space-y-3 !p-5">
            <h2 className="font-display text-sm font-semibold text-kyber-white">{t("quotes.statusTitle")}</h2>
            <Select
              value={quote.status}
              onChange={(e) => changeStatus(e.target.value as QuoteStatus)}
              options={statusOptions}
              aria-label={t("quotes.statusTitle")}
            />
          </div>

          {/* Ações */}
          <div className="glass-card space-y-2 !p-5">
            <h2 className="mb-1 font-display text-sm font-semibold text-kyber-white">{t("quotes.actionsTitle")}</h2>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => toast("info", t("quotes.downloadTitle"), t("quotes.downloadDescription", { number: quote.number }))}
            >
              <Download className="h-4 w-4" />
              {t("common.downloadPdf")}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() =>
                toast("success", t("quotes.whatsappSentTitle"), t("quotes.whatsappSentDescription", { name: customer?.name ?? "—" }))
              }
            >
              <MessageCircle className="h-4 w-4" />
              {t("common.sendWhatsApp")}
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() =>
                toast("success", t("quotes.duplicatedTitle"), t("quotes.duplicatedDescription", { number: `${quote.number}-C` }))
              }
            >
              <Copy className="h-4 w-4" />
              {t("common.duplicate")}
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
