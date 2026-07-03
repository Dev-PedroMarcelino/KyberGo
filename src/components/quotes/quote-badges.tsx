"use client";

/**
 * Badges e rótulos compartilhados do módulo de orçamentos:
 * status, modo (inteligente/simples) e origem (WhatsApp/Web/Manual).
 */

import React from "react";
import { Globe, MessageCircle, PencilRuler, PenLine, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import type { Quote, QuoteMode, QuoteStatus } from "@/lib/types";

type BadgeTone = "green" | "gray" | "yellow" | "red" | "blue" | "purple" | "neon";

export const QUOTE_STATUS_TONES: Record<QuoteStatus, BadgeTone> = {
  draft: "gray",
  sent: "blue",
  viewed: "purple",
  negotiating: "yellow",
  accepted: "green",
  rejected: "red",
  expired: "red",
};

export const QUOTE_STATUS_KEYS: Record<QuoteStatus, string> = {
  draft: "quotes.statusDraft",
  sent: "quotes.statusSent",
  viewed: "quotes.statusViewed",
  negotiating: "quotes.statusNegotiating",
  accepted: "quotes.statusAccepted",
  rejected: "quotes.statusRejected",
  expired: "quotes.statusExpired",
};

export function QuoteStatusBadge({ status, className }: { status: QuoteStatus; className?: string }) {
  const { t } = useI18n();
  return (
    <Badge tone={QUOTE_STATUS_TONES[status]} dot className={className}>
      {t(QUOTE_STATUS_KEYS[status])}
    </Badge>
  );
}

export function QuoteModeBadge({ mode, className }: { mode: QuoteMode; className?: string }) {
  const { t } = useI18n();
  return mode === "intelligent" ? (
    <Badge tone="neon" className={className}>
      <Sparkles className="h-3 w-3" />
      {t("quotes.modeIntelligent")}
    </Badge>
  ) : (
    <Badge tone="gray" className={className}>
      <PencilRuler className="h-3 w-3" />
      {t("quotes.modeSimple")}
    </Badge>
  );
}

const SOURCE_META: Record<Quote["source"], { icon: React.ReactNode; key: string; className: string }> = {
  whatsapp: { icon: <MessageCircle className="h-3.5 w-3.5" />, key: "quotes.sourceWhatsapp", className: "text-kyber-green" },
  web: { icon: <Globe className="h-3.5 w-3.5" />, key: "quotes.sourceWeb", className: "text-sky-300" },
  manual: { icon: <PenLine className="h-3.5 w-3.5" />, key: "quotes.sourceManual", className: "text-kyber-gray" },
};

export function QuoteSourceLabel({ source }: { source: Quote["source"] }) {
  const { t } = useI18n();
  const meta = SOURCE_META[source];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-kyber-gray">
      <span className={meta.className}>{meta.icon}</span>
      {t(meta.key)}
    </span>
  );
}
