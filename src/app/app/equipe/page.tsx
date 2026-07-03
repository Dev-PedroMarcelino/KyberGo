"use client";

/**
 * Equipe e permissões — membros, convites, papéis e matriz de permissões.
 * Estado local inicializado a partir de MOCK_USERS (modo demo).
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  Mail,
  MoreVertical,
  Send,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { PageTransition, Reveal } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Avatar, Dropdown, DropdownItem, Progress } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_CURRENT_USER, MOCK_PLANS, MOCK_USERS } from "@/lib/mock/data";
import type { UserRole } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";

/* ---------------- Tipos e dados locais ---------------- */

type TeamRole = Extract<UserRole, "company_owner" | "company_manager" | "salesperson">;

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: "active" | "pending";
  lastAccessAt: string | null;
}

/** Últimos acessos fictícios por usuário (modo demo). */
const MOCK_LAST_ACCESS: Record<string, string | null> = {
  us_001: "2026-07-03T08:45:00Z",
  us_002: "2026-07-02T17:20:00Z",
  us_003: "2026-07-01T11:05:00Z",
  us_004: null,
};

const INITIAL_MEMBERS: TeamMember[] = MOCK_USERS.map((user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role as TeamRole,
  status: user.id === "us_004" ? "pending" : "active",
  lastAccessAt: MOCK_LAST_ACCESS[user.id] ?? null,
}));

/** Matriz de permissões por papel (recurso × papel). */
const PERMISSION_MATRIX: { resourceKey: string; owner: boolean; manager: boolean; salesperson: boolean }[] = [
  { resourceKey: "team.permQuotes", owner: true, manager: true, salesperson: true },
  { resourceKey: "team.permCustomers", owner: true, manager: true, salesperson: true },
  { resourceKey: "team.permCrm", owner: true, manager: true, salesperson: true },
  { resourceKey: "team.permAutomations", owner: true, manager: true, salesperson: false },
  { resourceKey: "team.permReports", owner: true, manager: true, salesperson: false },
  { resourceKey: "team.permSettings", owner: true, manager: true, salesperson: false },
  { resourceKey: "team.permBilling", owner: true, manager: false, salesperson: false },
];

const roleTone: Record<TeamRole, "green" | "blue" | "gray"> = {
  company_owner: "green",
  company_manager: "blue",
  salesperson: "gray",
};

export default function EquipePage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const userLimit = MOCK_PLANS.find((p) => p.slug === "professional")?.limits.users ?? 5;

  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("salesperson");
  const [inviteError, setInviteError] = useState<string | undefined>(undefined);
  const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<TeamRole>("salesperson");
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const roleLabel: Record<TeamRole, string> = {
    company_owner: t("team.roleOwner"),
    company_manager: t("team.roleManager"),
    salesperson: t("team.roleSalesperson"),
  };

  const roleDescription: Record<TeamRole, string> = {
    company_owner: t("team.roleOwnerDescription"),
    company_manager: t("team.roleManagerDescription"),
    salesperson: t("team.roleSalespersonDescription"),
  };

  const usagePercent = Math.round((members.length / userLimit) * 100);
  const limitTone = usagePercent > 90 ? "red" : usagePercent > 75 ? "yellow" : "green";

  const inviteRoleOptions = useMemo(
    () => [
      { value: "company_manager", label: t("team.roleManager") },
      { value: "salesperson", label: t("team.roleSalesperson") },
    ],
    [t]
  );

  /* ---------------- Ações ---------------- */

  const openInvite = () => {
    if (members.length >= userLimit) {
      toast("error", t("team.inviteLimitToast"), t("team.inviteLimitToastDesc", { limit: userLimit }));
      return;
    }
    setInviteEmail("");
    setInviteRole("salesperson");
    setInviteError(undefined);
    setInviteOpen(true);
  };

  const sendInvite = () => {
    const email = inviteEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setInviteError(t("team.inviteEmailInvalid"));
      return;
    }
    const localPart = email.split("@")[0].replace(/[._-]+/g, " ");
    const name = localPart.replace(/\b\w/g, (c) => c.toUpperCase());
    setMembers((prev) => [
      ...prev,
      {
        id: `us_${Date.now()}`,
        name,
        email,
        role: inviteRole,
        status: "pending",
        lastAccessAt: null,
      },
    ]);
    setInviteOpen(false);
    toast("success", t("team.inviteSentToast"), t("team.inviteSentToastDesc", { email }));
  };

  const openChangeRole = (member: TeamMember) => {
    setNewRole(member.role === "company_owner" ? "company_manager" : member.role);
    setRoleTarget(member);
  };

  const saveRole = () => {
    if (!roleTarget) return;
    setMembers((prev) => prev.map((m) => (m.id === roleTarget.id ? { ...m, role: newRole } : m)));
    toast("success", t("team.roleChangedToast"), t("team.roleChangedToastDesc", { name: roleTarget.name, role: roleLabel[newRole] }));
    setRoleTarget(null);
  };

  const resendInvite = (member: TeamMember) => {
    toast("success", t("team.inviteResentToast"), t("team.inviteResentToastDesc", { email: member.email }));
  };

  const tryRemove = (member: TeamMember) => {
    if (member.role === "company_owner") {
      toast("error", t("team.cannotRemoveOwnerToast"), t("team.cannotRemoveOwnerToastDesc"));
      return;
    }
    setRemoveTarget(member);
  };

  const confirmRemove = () => {
    if (!removeTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== removeTarget.id));
    toast("success", t("team.removedToast"), t("team.removedToastDesc", { name: removeTarget.name }));
    setRemoveTarget(null);
  };

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("team.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("team.subtitle")}</p>
        </div>
        <Button onClick={openInvite}>
          <UserPlus className="h-4 w-4" />
          {t("team.inviteUser")}
        </Button>
      </div>

      {/* Callout do limite do plano */}
      <Card className="mb-6 !p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kyber-green/10 text-kyber-green">
            <Users className="h-5 w-5" />
          </span>
          <div className="min-w-[200px] flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium text-kyber-white">{t("team.limitTitle")}</p>
              <p className="text-xs text-kyber-gray">
                {t("team.limitDescription", { used: members.length, limit: userLimit })}
              </p>
            </div>
            <Progress value={usagePercent} tone={limitTone} className="mt-2" />
          </div>
          <div className="flex items-center gap-3">
            <p className="hidden max-w-[260px] text-xs text-kyber-dim md:block">{t("team.limitUpgradeHint")}</p>
            <Link href="/app/assinatura">
              <Button variant="outline" size="sm">
                {t("team.limitUpgradeCta")}
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Lista de membros */}
      <Card className="!p-0">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-6 pb-4">
          <CardTitle>{t("team.membersTitle")}</CardTitle>
          <Badge tone="gray">{t("team.membersCount", { count: members.length })}</Badge>
        </div>
        <ul>
          {members.map((member) => (
            <li
              key={member.id}
              className="flex flex-wrap items-center gap-3 border-b border-border/60 px-6 py-4 transition-colors last:border-0 hover:bg-white/[0.02] sm:flex-nowrap"
            >
              <Avatar name={member.name} className="h-10 w-10 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-kyber-white">{member.name}</p>
                  {member.id === MOCK_CURRENT_USER.id && <Badge tone="neon">{t("team.youBadge")}</Badge>}
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-kyber-gray">
                  <Mail className="h-3 w-3 shrink-0" />
                  {member.email}
                </p>
              </div>
              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <Badge tone={roleTone[member.role]}>{roleLabel[member.role]}</Badge>
                {member.status === "pending" ? (
                  <Badge tone="yellow" dot>
                    {t("team.statusPending")}
                  </Badge>
                ) : (
                  <Badge tone="green" dot>
                    {t("team.statusActive")}
                  </Badge>
                )}
                <span className="hidden text-xs text-kyber-dim lg:block">
                  {member.lastAccessAt
                    ? t("team.lastAccess", { date: formatDateTime(member.lastAccessAt) })
                    : t("team.neverAccessed")}
                </span>
                <Dropdown
                  trigger={
                    <Button variant="ghost" size="icon" aria-label={t("team.memberActions")}>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                >
                  {member.role !== "company_owner" && (
                    <DropdownItem onClick={() => openChangeRole(member)}>
                      <UserCog className="h-4 w-4 text-kyber-gray" />
                      {t("team.changeRole")}
                    </DropdownItem>
                  )}
                  {member.status === "pending" && (
                    <DropdownItem onClick={() => resendInvite(member)}>
                      <Send className="h-4 w-4 text-kyber-gray" />
                      {t("team.resendInvite")}
                    </DropdownItem>
                  )}
                  <DropdownItem className="text-red-400 hover:bg-red-500/10" onClick={() => tryRemove(member)}>
                    <Trash2 className="h-4 w-4" />
                    {t("team.removeMember")}
                  </DropdownItem>
                </Dropdown>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Matriz de permissões */}
      <Reveal className="mt-10">
        <Card className="!p-0">
          <div className="border-b border-border p-6 pb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-kyber-green" />
              <CardTitle>{t("team.permissionsTitle")}</CardTitle>
            </div>
            <CardDescription>{t("team.permissionsSubtitle")}</CardDescription>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-kyber-dim">
                  <th className="px-6 py-3 font-medium">{t("team.permResource")}</th>
                  <th className="px-6 py-3 text-center font-medium">{t("team.roleOwner")}</th>
                  <th className="px-6 py-3 text-center font-medium">{t("team.roleManager")}</th>
                  <th className="px-6 py-3 text-center font-medium">{t("team.roleSalesperson")}</th>
                </tr>
              </thead>
              <tbody>
                {PERMISSION_MATRIX.map((row) => (
                  <tr key={row.resourceKey} className="border-b border-border/60 last:border-0">
                    <td className="px-6 py-3.5 font-medium text-kyber-soft">{t(row.resourceKey)}</td>
                    {([row.owner, row.manager, row.salesperson] as const).map((allowed, i) => (
                      <td key={i} className="px-6 py-3.5 text-center">
                        <span
                          aria-label={allowed ? t("team.permAllowed") : t("team.permDenied")}
                          className={cn(
                            "inline-flex h-7 w-7 items-center justify-center rounded-full",
                            allowed ? "bg-kyber-green/15 text-kyber-green" : "bg-white/5 text-kyber-dim"
                          )}
                        >
                          {allowed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Reveal>

      {/* Modal de convite */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title={t("team.inviteModalTitle")}
        description={t("team.inviteModalDescription")}
      >
        <div className="space-y-4">
          <Input
            type="email"
            label={t("team.inviteEmailLabel")}
            placeholder={t("team.inviteEmailPlaceholder")}
            icon={<Mail className="h-4 w-4" />}
            value={inviteEmail}
            onChange={(e) => {
              setInviteEmail(e.target.value);
              setInviteError(undefined);
            }}
            error={inviteError}
          />
          <div>
            <Select
              label={t("team.inviteRoleLabel")}
              options={inviteRoleOptions}
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as TeamRole)}
            />
            <p className="mt-2 rounded-lg border border-border bg-white/[0.03] p-3 text-xs leading-relaxed text-kyber-gray">
              {roleDescription[inviteRole]}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={sendInvite}>
              <Send className="h-4 w-4" />
              {t("team.sendInvite")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de alteração de papel */}
      <Modal
        open={roleTarget !== null}
        onClose={() => setRoleTarget(null)}
        title={t("team.changeRoleModalTitle")}
        description={roleTarget ? t("team.changeRoleModalDescription", { name: roleTarget.name }) : undefined}
      >
        <div className="space-y-4">
          <div>
            <Select
              label={t("team.newRoleLabel")}
              options={inviteRoleOptions}
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as TeamRole)}
            />
            <p className="mt-2 rounded-lg border border-border bg-white/[0.03] p-3 text-xs leading-relaxed text-kyber-gray">
              {roleDescription[newRole]}
            </p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setRoleTarget(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={saveRole}>{t("team.saveRole")}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal de remoção */}
      <Modal
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title={t("team.removeModalTitle")}
        description={removeTarget ? t("team.removeModalDescription", { name: removeTarget.name }) : undefined}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setRemoveTarget(null)}>
            {t("team.cancelRemove")}
          </Button>
          <Button variant="danger" onClick={confirmRemove}>
            <Trash2 className="h-4 w-4" />
            {t("team.confirmRemove")}
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
