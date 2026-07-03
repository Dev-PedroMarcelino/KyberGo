"use client";

/**
 * Blocos do Kanban de vendas: configuração dos estágios, card de negócio
 * (arrastável e versão para o DragOverlay) e coluna droppable.
 */

import React from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CalendarDays } from "lucide-react";
import type { CrmDeal, DealStage } from "@/lib/types";
import { MOCK_CUSTOMERS, MOCK_USERS } from "@/lib/mock/data";
import { Avatar, Tooltip } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { cn, formatCurrency, formatDate } from "@/lib/utils";

/** Data de referência do modo demo (os mocks são ancorados nela). */
export const DEMO_TODAY = new Date("2026-07-03T12:00:00");

export interface StageConfig {
  id: DealStage;
  labelKey: string;
  /** Borda superior do cabeçalho da coluna. */
  accentBorder: string;
  /** Ponto de status ao lado do nome. */
  accentDot: string;
  /** Cor da soma de valores. */
  accentText: string;
}

/** Ordem oficial do funil — won=verde, lost=vermelho, maintenance=azul, demais neutros. */
export const STAGES: StageConfig[] = [
  { id: "new_lead", labelKey: "crm.stageNewLead", accentBorder: "border-t-kyber-green/30", accentDot: "bg-kyber-green/50", accentText: "text-kyber-gray" },
  { id: "qualifying", labelKey: "crm.stageQualifying", accentBorder: "border-t-kyber-green/30", accentDot: "bg-kyber-green/50", accentText: "text-kyber-gray" },
  { id: "quote_sent", labelKey: "crm.stageQuoteSent", accentBorder: "border-t-kyber-green/30", accentDot: "bg-kyber-green/50", accentText: "text-kyber-gray" },
  { id: "negotiating", labelKey: "crm.stageNegotiating", accentBorder: "border-t-kyber-green/30", accentDot: "bg-kyber-green/50", accentText: "text-kyber-gray" },
  { id: "won", labelKey: "crm.stageWon", accentBorder: "border-t-kyber-green", accentDot: "bg-kyber-green", accentText: "text-kyber-green" },
  { id: "lost", labelKey: "crm.stageLost", accentBorder: "border-t-red-500", accentDot: "bg-red-500", accentText: "text-red-400" },
  { id: "maintenance", labelKey: "crm.stageMaintenance", accentBorder: "border-t-sky-400", accentDot: "bg-sky-400", accentText: "text-sky-300" },
];

/** Moeda compacta para as somas dos cabeçalhos (ex.: R$ 10,8 mil). */
export function formatCurrencyCompact(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Dias desde a última atualização do negócio (badge de "parado"). */
export function daysStalled(updatedAt: string) {
  return Math.max(0, Math.floor((DEMO_TODAY.getTime() - new Date(updatedAt).getTime()) / 86_400_000));
}

/* ---------------- Card de negócio (apresentação) ---------------- */

export function DealCard({ deal, overlay }: { deal: CrmDeal; overlay?: boolean }) {
  const { t } = useI18n();
  const customer = MOCK_CUSTOMERS.find((c) => c.id === deal.customerId);
  const assignee = MOCK_USERS.find((u) => u.id === deal.assignedTo);
  const stalled = daysStalled(deal.updatedAt);
  const showStalled = deal.stage !== "won" && deal.stage !== "lost" && stalled >= 3;

  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-kyber-elevated/90 p-4 transition-all duration-200",
        overlay
          ? "rotate-2 shadow-glow ring-1 ring-kyber-green/40"
          : "hover:border-kyber-green/30 hover:shadow-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-kyber-white">{deal.title}</p>
        {showStalled && (
          <Badge tone={stalled >= 10 ? "red" : "yellow"} className="shrink-0 whitespace-nowrap">
            {t("crm.daysStalled", { days: stalled })}
          </Badge>
        )}
      </div>
      {customer && <p className="mt-1 truncate text-xs text-kyber-gray">{customer.name}</p>}
      <p className="mt-2 font-display text-base font-bold tracking-tight text-kyber-green">
        {formatCurrency(deal.value)}
      </p>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-kyber-dim">
          <CalendarDays className="h-3.5 w-3.5" />
          {deal.expectedCloseDate ? formatDate(deal.expectedCloseDate) : t("crm.noCloseDate")}
        </span>
        {assignee && (
          <Tooltip content={assignee.name}>
            <Avatar name={assignee.name} className="h-6 w-6 text-[9px]" />
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/* ---------------- Card arrastável ---------------- */

export function DraggableDealCard({ deal, onClick }: { deal: CrmDeal; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: deal.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={cn(
        // touch-manipulation preserva o scroll no mobile; o drag ativa com toque longo
        "cursor-grab touch-manipulation select-none outline-none active:cursor-grabbing",
        isDragging && "opacity-30"
      )}
    >
      <DealCard deal={deal} />
    </div>
  );
}

/* ---------------- Coluna droppable ---------------- */

export function KanbanColumn({
  stage,
  deals,
  onCardClick,
}: {
  stage: StageConfig;
  deals: CrmDeal[];
  onCardClick: (dealId: string) => void;
}) {
  const { t } = useI18n();
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <section className="flex w-[85vw] shrink-0 snap-center flex-col sm:w-[320px] lg:w-[300px]">
      <header
        className={cn(
          "rounded-t-2xl border border-b-0 border-t-2 border-border bg-white/[0.04] px-4 py-3",
          stage.accentBorder
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn("h-2 w-2 shrink-0 rounded-full", stage.accentDot)} />
            <h2 className="truncate font-display text-sm font-semibold text-kyber-white">{t(stage.labelKey)}</h2>
            <span className="shrink-0 rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium text-kyber-gray">
              {deals.length}
            </span>
          </div>
          <span className={cn("shrink-0 text-xs font-semibold", stage.accentText)}>
            {formatCurrencyCompact(total)}
          </span>
        </div>
      </header>
      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[180px] flex-1 flex-col gap-3 rounded-b-2xl border border-t-0 border-border bg-white/[0.02] p-3 transition-colors duration-200",
          isOver && "bg-kyber-green/[0.07] ring-1 ring-inset ring-kyber-green/30"
        )}
      >
        {deals.map((deal) => (
          <DraggableDealCard key={deal.id} deal={deal} onClick={() => onCardClick(deal.id)} />
        ))}
        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-xs text-kyber-dim">
            {t("crm.columnEmpty")}
          </div>
        )}
      </div>
    </section>
  );
}
