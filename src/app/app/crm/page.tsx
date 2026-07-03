"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  ArrowUpRight,
  CalendarClock,
  FileText,
  Kanban,
  Plus,
  Target,
  TrendingUp,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Avatar, MetricCard } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_CUSTOMERS, MOCK_DEALS, MOCK_QUOTES, MOCK_USERS } from "@/lib/mock/data";
import type { CrmDeal, DealStage } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { DealCard, KanbanColumn, STAGES } from "@/components/crm/kanban";

/** Motivos de perda disponíveis no modal de confirmação. */
const LOST_REASONS = [
  { value: "price", labelKey: "crm.reasonPrice" },
  { value: "competitor", labelKey: "crm.reasonCompetitor" },
  { value: "postponed", labelKey: "crm.reasonPostponed" },
  { value: "no_response", labelKey: "crm.reasonNoResponse" },
] as const;

/* ---------------- Formulário do drawer de detalhes ---------------- */

function DealDrawerForm({
  deal,
  onSave,
  onFollowUp,
}: {
  deal: CrmDeal;
  onSave: (changes: Pick<CrmDeal, "value" | "stage" | "assignedTo" | "expectedCloseDate">) => void;
  onFollowUp: (deal: CrmDeal) => void;
}) {
  const { t } = useI18n();
  const customer = MOCK_CUSTOMERS.find((c) => c.id === deal.customerId);
  const quote = deal.quoteId ? MOCK_QUOTES.find((q) => q.id === deal.quoteId) : undefined;

  const [value, setValue] = useState(String(deal.value));
  const [stage, setStage] = useState<DealStage>(deal.stage);
  const [assignee, setAssignee] = useState(deal.assignedTo ?? "");
  const [date, setDate] = useState(deal.expectedCloseDate?.slice(0, 10) ?? "");

  const stageOptions = STAGES.map((s) => ({ value: s.id, label: t(s.labelKey) }));
  const userOptions = MOCK_USERS.map((u) => ({ value: u.id, label: u.name }));

  return (
    <div className="space-y-5">
      {/* Cliente */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("crm.drawerCustomer")}</p>
        {customer ? (
          <Link
            href={`/app/clientes/${customer.id}`}
            className="focus-ring flex items-center gap-3 rounded-xl border border-border bg-white/[0.03] p-3 transition-colors hover:border-kyber-green/30"
          >
            <Avatar name={customer.name} className="h-10 w-10" />
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-kyber-white">{customer.name}</span>
              <span className="block truncate text-xs text-kyber-gray">{customer.phone}</span>
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-kyber-dim" />
          </Link>
        ) : (
          <p className="text-sm text-kyber-gray">—</p>
        )}
      </div>

      <Input
        label={t("crm.drawerValue")}
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      <Select
        label={t("crm.drawerStage")}
        options={stageOptions}
        value={stage}
        onChange={(e) => setStage(e.target.value as DealStage)}
      />

      <Select
        label={t("crm.drawerAssignee")}
        options={userOptions}
        placeholder={t("crm.unassigned")}
        value={assignee}
        onChange={(e) => setAssignee(e.target.value)}
      />

      <Input
        label={t("crm.drawerExpectedDate")}
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {deal.stage === "lost" && deal.lostReason && (
        <div>
          <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("crm.drawerLostReason")}</p>
          <p className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-300">
            {deal.lostReason}
          </p>
        </div>
      )}

      {/* Orçamento vinculado */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("crm.drawerQuote")}</p>
        {quote ? (
          <Link
            href={`/app/orcamentos/${quote.id}`}
            className="focus-ring flex items-center gap-3 rounded-xl border border-border bg-white/[0.03] p-3 transition-colors hover:border-kyber-green/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-kyber-green/10 text-kyber-green">
              <FileText className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-kyber-white">
                {t("crm.drawerOpenQuote", { number: quote.number })}
              </span>
              <span className="block text-xs text-kyber-gray">{formatCurrency(quote.total)}</span>
            </span>
            <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-kyber-dim" />
          </Link>
        ) : (
          <p className="rounded-xl border border-dashed border-white/10 p-3 text-xs text-kyber-dim">
            {t("crm.drawerNoQuote")}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-2 sm:flex-row">
        <Button variant="outline" className="flex-1" onClick={() => onFollowUp(deal)}>
          <CalendarClock className="h-4 w-4" />
          {t("crm.scheduleFollowUp")}
        </Button>
        <Button
          className="flex-1"
          onClick={() =>
            onSave({
              value: Number.parseFloat(value) > 0 ? Number.parseFloat(value) : deal.value,
              stage,
              assignedTo: assignee || null,
              expectedCloseDate: date ? `${date}T00:00:00Z` : null,
            })
          }
        >
          {t("common.save")}
        </Button>
      </div>
    </div>
  );
}

/* ---------------- Página ---------------- */

export default function CrmPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [deals, setDeals] = useState<CrmDeal[]>(MOCK_DEALS);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Drawer de detalhes (o id fica guardado para a animação de saída não perder o conteúdo)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDealId, setDrawerDealId] = useState<string | null>(null);

  // Modal de perda (aberto ao soltar em "Perdido")
  const [lostOpen, setLostOpen] = useState(false);
  const [lostDealId, setLostDealId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [lostNote, setLostNote] = useState("");

  // Modal de novo negócio
  const [newOpen, setNewOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newStage, setNewStage] = useState<DealStage>("new_lead");

  // Distância mínima no mouse preserva o clique; toque longo preserva o scroll no mobile
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } })
  );

  const activeDeal = deals.find((d) => d.id === activeId) ?? null;
  const drawerDeal = deals.find((d) => d.id === drawerDealId) ?? null;
  const lostDeal = deals.find((d) => d.id === lostDealId) ?? null;

  const summary = useMemo(() => {
    const active = deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
    const total = active.reduce((sum, d) => sum + d.value, 0);
    return {
      total,
      avgTicket: active.length > 0 ? total / active.length : 0,
      count: active.length,
    };
  }, [deals]);

  function moveDeal(dealId: string, stage: DealStage, lostReasonText: string | null = null) {
    setDeals((prev) =>
      prev.map((d) =>
        d.id === dealId
          ? { ...d, stage, lostReason: stage === "lost" ? lostReasonText : null, updatedAt: new Date().toISOString() }
          : d
      )
    );
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const targetStage = over.id as DealStage;
    const deal = deals.find((d) => d.id === active.id);
    if (!deal || deal.stage === targetStage) return;

    if (targetStage === "lost") {
      // A confirmação (com motivo) acontece no modal antes de mover
      setLostDealId(deal.id);
      setLostReason("");
      setLostNote("");
      setLostOpen(true);
      return;
    }

    moveDeal(deal.id, targetStage);
    if (targetStage === "won") {
      toast("success", t("crm.wonToast"), t("crm.wonToastDesc", { title: deal.title }));
    }
  }

  function confirmLost() {
    if (!lostDeal || !lostReason) return;
    const reasonLabel = t(LOST_REASONS.find((r) => r.value === lostReason)?.labelKey ?? "crm.reasonNoResponse");
    const composed = lostNote.trim() ? `${reasonLabel} — ${lostNote.trim()}` : reasonLabel;
    moveDeal(lostDeal.id, "lost", composed);
    toast("info", t("crm.lostToast"), t("crm.lostToastDesc", { title: lostDeal.title }));
    setLostOpen(false);
  }

  function saveDrawer(changes: Pick<CrmDeal, "value" | "stage" | "assignedTo" | "expectedCloseDate">) {
    if (!drawerDeal) return;
    setDeals((prev) =>
      prev.map((d) => (d.id === drawerDeal.id ? { ...d, ...changes, updatedAt: new Date().toISOString() } : d))
    );
    toast("success", t("crm.dealSaved"), t("crm.dealSavedDesc", { title: drawerDeal.title }));
    setDrawerOpen(false);
  }

  function scheduleFollowUp(deal: CrmDeal) {
    const customer = MOCK_CUSTOMERS.find((c) => c.id === deal.customerId);
    toast("success", t("crm.followUpToast"), t("crm.followUpToastDesc", { name: customer?.name ?? deal.title }));
  }

  function openNewDeal() {
    setNewTitle("");
    setNewCustomer("");
    setNewValue("");
    setNewStage("new_lead");
    setNewOpen(true);
  }

  function createDeal() {
    const value = Number.parseFloat(newValue);
    if (!newTitle.trim() || !newCustomer || !(value > 0)) {
      toast("error", t("crm.formError"));
      return;
    }
    const now = new Date().toISOString();
    const deal: CrmDeal = {
      id: `dl_local_${Date.now()}`,
      companyId: "co_demo_001",
      customerId: newCustomer,
      quoteId: null,
      title: newTitle.trim(),
      stage: newStage,
      value,
      expectedCloseDate: null,
      assignedTo: MOCK_USERS[0].id,
      lostReason: null,
      createdAt: now,
      updatedAt: now,
    };
    setDeals((prev) => [deal, ...prev]);
    toast("success", t("crm.dealCreated"), t("crm.dealCreatedDesc", { title: deal.title }));
    setNewOpen(false);
  }

  const customerOptions = MOCK_CUSTOMERS.map((c) => ({ value: c.id, label: c.name }));
  const stageOptions = STAGES.map((s) => ({ value: s.id, label: t(s.labelKey) }));

  return (
    <PageTransition>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("crm.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("crm.subtitle")}</p>
        </div>
        <Button onClick={openNewDeal}>
          <Plus className="h-4 w-4" />
          {t("crm.newDeal")}
        </Button>
      </div>

      {/* Barra de resumo */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label={t("crm.pipelineTotal")}
          value={formatCurrency(summary.total)}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          label={t("crm.avgTicket")}
          value={formatCurrency(summary.avgTicket)}
          icon={<Target className="h-4 w-4" />}
        />
        <MetricCard
          label={t("crm.activeDeals")}
          value={summary.count}
          icon={<Kanban className="h-4 w-4" />}
        />
      </div>

      <p className="mb-4 text-xs text-kyber-dim lg:hidden">{t("crm.dragHint")}</p>

      {/* Quadro Kanban */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div className="-mx-4 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-4 pb-6 lg:mx-0 lg:snap-none lg:px-0">
          {STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              deals={deals.filter((d) => d.stage === stage.id)}
              onCardClick={(dealId) => {
                setDrawerDealId(dealId);
                setDrawerOpen(true);
              }}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }}>
          {activeDeal ? <DealCard deal={activeDeal} overlay /> : null}
        </DragOverlay>
      </DndContext>

      {/* Drawer de detalhes do negócio */}
      <Modal
        open={drawerOpen && drawerDeal !== null}
        onClose={() => setDrawerOpen(false)}
        drawer
        title={t("crm.drawerTitle")}
        description={drawerDeal?.title}
      >
        {drawerDeal && (
          <>
            <div className="mb-5 flex items-center gap-2">
              <Badge tone={drawerDeal.stage === "won" ? "green" : drawerDeal.stage === "lost" ? "red" : drawerDeal.stage === "maintenance" ? "blue" : "gray"} dot>
                {t(STAGES.find((s) => s.id === drawerDeal.stage)?.labelKey ?? "crm.stageNewLead")}
              </Badge>
              <span className="font-display text-lg font-bold text-kyber-green">
                {formatCurrency(drawerDeal.value)}
              </span>
            </div>
            <DealDrawerForm
              key={drawerDeal.id}
              deal={drawerDeal}
              onSave={saveDrawer}
              onFollowUp={scheduleFollowUp}
            />
          </>
        )}
      </Modal>

      {/* Modal de motivo da perda */}
      <Modal
        open={lostOpen && lostDeal !== null}
        onClose={() => setLostOpen(false)}
        title={t("crm.lostModalTitle")}
        description={t("crm.lostModalDescription")}
      >
        <div className="space-y-4">
          <Select
            label={t("crm.lostReasonLabel")}
            placeholder={t("crm.lostReasonPlaceholder")}
            options={LOST_REASONS.map((r) => ({ value: r.value, label: t(r.labelKey) }))}
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
          />
          <Textarea
            label={t("crm.lostNoteLabel")}
            placeholder={t("crm.lostNotePlaceholder")}
            value={lostNote}
            onChange={(e) => setLostNote(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setLostOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button variant="danger" disabled={!lostReason} onClick={confirmLost}>
              {t("crm.confirmLost")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de novo negócio */}
      <Modal
        open={newOpen}
        onClose={() => setNewOpen(false)}
        title={t("crm.newDealTitle")}
        description={t("crm.newDealDescription")}
      >
        <div className="space-y-4">
          <Input
            label={t("crm.formTitle")}
            placeholder={t("crm.formTitlePlaceholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Select
            label={t("crm.formCustomer")}
            placeholder={t("crm.formCustomerPlaceholder")}
            options={customerOptions}
            value={newCustomer}
            onChange={(e) => setNewCustomer(e.target.value)}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("crm.formValue")}
              type="number"
              min={0}
              step="0.01"
              placeholder={t("crm.formValuePlaceholder")}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
            />
            <Select
              label={t("crm.formStage")}
              options={stageOptions}
              value={newStage}
              onChange={(e) => setNewStage(e.target.value as DealStage)}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setNewOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={createDeal}>
              <Plus className="h-4 w-4" />
              {t("crm.createDeal")}
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
