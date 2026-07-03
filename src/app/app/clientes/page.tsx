"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarClock, History, MessageCircle, Plus, Search, UsersRound } from "lucide-react";
import { PageTransition, StaggerContainer, staggerItem } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Avatar, EmptyState, Switch } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_CUSTOMERS } from "@/lib/mock/data";
import type { Customer } from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

/** Data de referência do modo demo (os mocks são ancorados nela). */
const DEMO_TODAY = new Date("2026-07-03T12:00:00");

type MaintenanceInfo = { kind: "overdue" | "soon" | "later"; days: number } | null;

/** Situação da próxima manutenção: vencida, nos próximos 30 dias ou mais distante. */
function maintenanceInfo(customer: Customer): MaintenanceInfo {
  if (!customer.maintenanceDueDate) return null;
  const due = new Date(customer.maintenanceDueDate);
  const days = Math.ceil((due.getTime() - DEMO_TODAY.getTime()) / 86_400_000);
  if (days < 0) return { kind: "overdue", days: Math.abs(days) };
  if (days <= 30) return { kind: "soon", days };
  return { kind: "later", days };
}

function MaintenanceBadge({ customer }: { customer: Customer }) {
  const { t } = useI18n();
  const info = maintenanceInfo(customer);
  if (!info) return <span className="text-xs text-kyber-dim">{t("customers.noMaintenance")}</span>;
  if (info.kind === "overdue") {
    return <Badge tone="red">{t("customers.maintenanceOverdue", { days: info.days })}</Badge>;
  }
  if (info.kind === "soon") {
    return (
      <Badge tone="yellow">
        {info.days === 0 ? t("customers.maintenanceToday") : t("customers.maintenanceDue", { days: info.days })}
      </Badge>
    );
  }
  return <span className="text-xs text-kyber-soft">{formatDate(customer.maintenanceDueDate!)}</span>;
}

const EMPTY_FORM = { name: "", phone: "", email: "", address: "", tags: "", notes: "" };

export default function CustomersPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [maintenanceOnly, setMaintenanceOnly] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  /** Tags únicas derivadas da carteira, para os chips de filtro. */
  const allTags = useMemo(
    () => Array.from(new Set(customers.flatMap((c) => c.tags))).sort((a, b) => a.localeCompare(b, "pt-BR")),
    [customers]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const queryDigits = query.replace(/\D/g, "");
    return customers.filter((c) => {
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        (c.email ?? "").toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        (queryDigits.length > 0 && c.phone.replace(/\D/g, "").includes(queryDigits));
      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => c.tags.includes(tag));
      const info = maintenanceInfo(c);
      const matchesMaintenance = !maintenanceOnly || (info !== null && info.kind !== "later");
      return matchesSearch && matchesTags && matchesMaintenance;
    });
  }, [customers, search, selectedTags, maintenanceOnly]);

  function toggleTag(tag: string) {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]));
  }

  function clearFilters() {
    setSearch("");
    setSelectedTags([]);
    setMaintenanceOnly(false);
  }

  function toggleAutomation(customer: Customer, enabled: boolean) {
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, automationEnabled: enabled } : c)));
    toast(
      enabled ? "success" : "info",
      enabled ? t("customers.automationOnToast") : t("customers.automationOffToast"),
      t(enabled ? "customers.automationOnToastDesc" : "customers.automationOffToastDesc", { name: customer.name })
    );
  }

  function createCustomer() {
    if (!form.name.trim() || !form.phone.trim()) {
      toast("error", t("customers.formError"));
      return;
    }
    const now = new Date().toISOString();
    const customer: Customer = {
      id: `cu_local_${Date.now()}`,
      companyId: "co_demo_001",
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim() || null,
      notes: form.notes.trim() || null,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
      automationEnabled: true,
      lastServiceDate: null,
      maintenanceDueDate: null,
      createdAt: now,
      updatedAt: now,
    };
    setCustomers((prev) => [customer, ...prev]);
    toast("success", t("customers.createdToast"), t("customers.createdToastDesc", { name: customer.name }));
    setForm(EMPTY_FORM);
    setModalOpen(false);
  }

  return (
    <PageTransition>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("customers.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("customers.subtitle")}</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("customers.newCustomer")}
        </Button>
      </div>

      {/* Busca e filtros */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Input
              icon={<Search className="h-4 w-4" />}
              placeholder={t("customers.searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Switch
            checked={maintenanceOnly}
            onChange={setMaintenanceOnly}
            label={t("customers.maintenanceToggle")}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {allTags.map((tag) => {
            const active = selectedTags.includes(tag);
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={cn(
                  "focus-ring rounded-full border px-3 py-1 text-xs font-medium transition-colors duration-200",
                  active
                    ? "border-kyber-green/40 bg-kyber-green/15 text-kyber-green"
                    : "border-white/10 bg-white/[0.03] text-kyber-gray hover:border-white/20 hover:text-kyber-soft"
                )}
              >
                {tag}
              </button>
            );
          })}
          <span className="ml-auto text-xs text-kyber-dim">
            {filtered.length === 1
              ? t("customers.countOne")
              : t("customers.count", { count: filtered.length })}
          </span>
        </div>
      </div>

      {/* Grade de clientes */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<UsersRound className="h-7 w-7" />}
          title={t("customers.emptyTitle")}
          description={t("customers.emptyDescription")}
          action={
            <Button variant="outline" onClick={clearFilters}>
              {t("customers.clearFilters")}
            </Button>
          }
        />
      ) : (
        <StaggerContainer className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((customer) => (
            <motion.div key={customer.id} variants={staggerItem}>
              <Link
                href={`/app/clientes/${customer.id}`}
                className="glass-card focus-ring block h-full p-5 transition-all duration-300 hover:border-kyber-green/25 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={customer.name} className="h-11 w-11 text-sm" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-kyber-white">{customer.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-xs text-kyber-gray">
                        <MessageCircle className="h-3.5 w-3.5 shrink-0 text-kyber-green" />
                        <span className="truncate">{customer.phone}</span>
                      </p>
                    </div>
                  </div>
                  {/* O wrapper impede que o toggle navegue para o perfil */}
                  <span
                    className="origin-top-right scale-90"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <Switch
                      checked={customer.automationEnabled}
                      onChange={(enabled) => toggleAutomation(customer, enabled)}
                    />
                  </span>
                </div>

                {customer.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {customer.tags.map((tag) => (
                      <Badge key={tag} tone="gray">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="mt-4 space-y-2.5 border-t border-white/10 pt-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-kyber-dim">
                      <History className="h-3.5 w-3.5" />
                      {t("customers.lastService")}
                    </span>
                    <span className="text-xs text-kyber-soft">
                      {customer.lastServiceDate ? formatDate(customer.lastServiceDate) : t("customers.noServiceYet")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-xs text-kyber-dim">
                      <CalendarClock className="h-3.5 w-3.5" />
                      {t("customers.nextMaintenance")}
                    </span>
                    <MaintenanceBadge customer={customer} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </StaggerContainer>
      )}

      {/* Modal de novo cliente */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t("customers.modalTitle")}
        description={t("customers.modalDescription")}
      >
        <div className="space-y-4">
          <Input
            label={t("customers.formName")}
            placeholder={t("customers.formNamePlaceholder")}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t("customers.formPhone")}
              placeholder={t("customers.formPhonePlaceholder")}
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
            />
            <Input
              label={t("customers.formEmail")}
              type="email"
              placeholder={t("customers.formEmailPlaceholder")}
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <Input
            label={t("customers.formAddress")}
            placeholder={t("customers.formAddressPlaceholder")}
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          />
          <Input
            label={t("customers.formTags")}
            placeholder={t("customers.formTagsPlaceholder")}
            hint={t("customers.formTagsHint")}
            value={form.tags}
            onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
          />
          <Textarea
            label={t("customers.formNotes")}
            placeholder={t("customers.formNotesPlaceholder")}
            value={form.notes}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={createCustomer}>
              <Plus className="h-4 w-4" />
              {t("customers.formSubmit")}
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
