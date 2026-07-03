"use client";

/** Lista de orçamentos — busca, filtros por status/modo e ações rápidas. */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Copy, Download, FileText, ListChecks, MessageCircle, MoreHorizontal, PencilRuler, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Avatar, Dropdown, DropdownItem, EmptyState, Tabs } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { PageTransition } from "@/components/motion";
import { QuoteModeBadge, QuoteSourceLabel, QuoteStatusBadge } from "@/components/quotes/quote-badges";
import { useI18n } from "@/lib/i18n";
import { MOCK_CUSTOMERS, MOCK_QUOTES } from "@/lib/mock/data";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import type { Quote, QuoteStatus } from "@/lib/types";

/** Cada aba pode agrupar mais de um status (ex.: Enviado inclui Visualizado). */
const TAB_STATUS: Record<string, QuoteStatus[]> = {
  all: [],
  draft: ["draft"],
  sent: ["sent", "viewed"],
  negotiating: ["negotiating"],
  accepted: ["accepted"],
  expired: ["expired", "rejected"],
};

export default function QuotesListPage() {
  const { t } = useI18n();
  const { toast } = useToast();
  const router = useRouter();

  const [quotes, setQuotes] = useState<Quote[]>(MOCK_QUOTES);
  const [search, setSearch] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [modeFilter, setModeFilter] = useState("");

  const customerById = useMemo(() => new Map(MOCK_CUSTOMERS.map((c) => [c.id, c])), []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return quotes.filter((quote) => {
      const statuses = TAB_STATUS[statusTab] ?? [];
      if (statuses.length > 0 && !statuses.includes(quote.status)) return false;
      if (modeFilter && quote.mode !== modeFilter) return false;
      if (!term) return true;
      const customer = customerById.get(quote.customerId);
      return (
        quote.title.toLowerCase().includes(term) ||
        quote.number.toLowerCase().includes(term) ||
        (customer?.name.toLowerCase().includes(term) ?? false)
      );
    });
  }, [quotes, search, statusTab, modeFilter, customerById]);

  const duplicate = (quote: Quote) => {
    const number = `ORC-2026-${String(160 + quotes.length).padStart(4, "0")}`;
    const copy: Quote = {
      ...quote,
      id: `qo_copy_${Date.now()}`,
      number,
      status: "draft",
      source: "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setQuotes((prev) => [copy, ...prev]);
    toast("success", t("quotes.duplicatedTitle"), t("quotes.duplicatedDescription", { number }));
  };

  const downloadPdf = (quote: Quote) =>
    toast("info", t("quotes.downloadTitle"), t("quotes.downloadDescription", { number: quote.number }));

  const sendWhatsApp = (quote: Quote) => {
    const customer = customerById.get(quote.customerId);
    toast("success", t("quotes.whatsappSentTitle"), t("quotes.whatsappSentDescription", { name: customer?.name ?? "—" }));
  };

  const clearFilters = () => {
    setSearch("");
    setStatusTab("all");
    setModeFilter("");
  };

  const tabs = [
    { value: "all", label: t("quotes.tabAll") },
    { value: "draft", label: t("quotes.tabDraft") },
    { value: "sent", label: t("quotes.tabSent") },
    { value: "negotiating", label: t("quotes.tabNegotiating") },
    { value: "accepted", label: t("quotes.tabAccepted") },
    { value: "expired", label: t("quotes.tabExpired") },
  ];

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("quotes.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("quotes.subtitle")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/orcamentos/tipos">
            <Button variant="ghost">
              <ListChecks className="h-4 w-4" />
              {t("quotes.manageTypes")}
            </Button>
          </Link>
          <Link href="/app/orcamentos/simples">
            <Button variant="secondary">
              <PencilRuler className="h-4 w-4" />
              {t("quotes.newSimple")}
            </Button>
          </Link>
          <Link href="/app/orcamentos/inteligente">
            <Button variant="glow">
              <Sparkles className="h-4 w-4" />
              {t("quotes.newIntelligent")}
            </Button>
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="w-full sm:max-w-sm">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("quotes.searchPlaceholder")}
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={modeFilter}
              onChange={(e) => setModeFilter(e.target.value)}
              placeholder={t("quotes.modeFilterAll")}
              options={[
                { value: "intelligent", label: t("quotes.modeIntelligent") },
                { value: "simple", label: t("quotes.modeSimple") },
              ]}
              aria-label={t("quotes.colMode")}
            />
          </div>
        </div>
        <div className="overflow-x-auto pb-1">
          <Tabs items={tabs} value={statusTab} onChange={setStatusTab} />
        </div>
      </div>

      {/* Tabela */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title={t("quotes.emptyTitle")}
          description={t("quotes.emptyDescription")}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t("quotes.emptyAction")}
            </Button>
          }
        />
      ) : (
        <div className="glass-card overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-border bg-white/[0.03] text-left text-xs uppercase tracking-wide text-kyber-dim">
                  <th className="px-4 py-3 font-medium">{t("quotes.colNumber")}</th>
                  <th className="px-4 py-3 font-medium">{t("quotes.colTitle")}</th>
                  <th className="px-4 py-3 font-medium">{t("quotes.colCustomer")}</th>
                  <th className="px-4 py-3 font-medium">{t("quotes.colMode")}</th>
                  <th className="px-4 py-3 text-right font-medium">{t("quotes.colValue")}</th>
                  <th className="px-4 py-3 font-medium">{t("quotes.colStatus")}</th>
                  <th className="px-4 py-3 font-medium">{t("quotes.colValidUntil")}</th>
                  <th className="px-4 py-3 font-medium">{t("quotes.colSource")}</th>
                  <th className="w-12 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((quote) => {
                  const customer = customerById.get(quote.customerId);
                  const isExpired = quote.status === "expired" || new Date(quote.validUntil) < new Date();
                  return (
                    <tr
                      key={quote.id}
                      onClick={() => router.push(`/app/orcamentos/${quote.id}`)}
                      className="group cursor-pointer border-b border-border/50 transition-colors last:border-0 hover:bg-kyber-green/[0.04]"
                    >
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs text-kyber-gray">{quote.number}</td>
                      <td className="max-w-[260px] px-4 py-3.5">
                        <p className="truncate font-medium text-kyber-white transition-colors group-hover:text-kyber-green">
                          {quote.title}
                        </p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-2.5">
                          <Avatar name={customer?.name ?? "—"} className="h-7 w-7 text-[10px]" />
                          <span className="max-w-[160px] truncate text-kyber-soft">{customer?.name ?? "—"}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <QuoteModeBadge mode={quote.mode} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right font-medium text-kyber-white">
                        {formatCurrency(quote.total)}
                      </td>
                      <td className="px-4 py-3.5">
                        <QuoteStatusBadge status={quote.status} />
                      </td>
                      <td className={cn("whitespace-nowrap px-4 py-3.5 text-xs", isExpired ? "text-red-400" : "text-kyber-gray")}>
                        {formatDate(quote.validUntil)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <QuoteSourceLabel source={quote.source} />
                      </td>
                      <td className="px-2 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          trigger={
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={t("common.actions")}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          }
                        >
                          <DropdownItem onClick={() => router.push(`/app/orcamentos/${quote.id}`)}>
                            <FileText className="h-4 w-4 text-kyber-gray" />
                            {t("quotes.actionView")}
                          </DropdownItem>
                          <DropdownItem onClick={() => duplicate(quote)}>
                            <Copy className="h-4 w-4 text-kyber-gray" />
                            {t("quotes.actionDuplicate")}
                          </DropdownItem>
                          <DropdownItem onClick={() => downloadPdf(quote)}>
                            <Download className="h-4 w-4 text-kyber-gray" />
                            {t("quotes.actionDownload")}
                          </DropdownItem>
                          <DropdownItem onClick={() => sendWhatsApp(quote)}>
                            <MessageCircle className="h-4 w-4 text-kyber-green" />
                            {t("quotes.actionSendWhatsApp")}
                          </DropdownItem>
                        </Dropdown>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border px-4 py-3 text-xs text-kyber-dim">
            {t("quotes.listCount", { count: filtered.length, total: quotes.length })}
          </p>
        </div>
      )}
    </PageTransition>
  );
}
