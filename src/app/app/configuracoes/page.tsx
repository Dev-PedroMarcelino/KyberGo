"use client";

/**
 * Configurações — empresa, IA, idioma e região, CRM, notificações e segurança.
 * Navegação por abas verticais no desktop e lista horizontal rolável no mobile.
 * Todo o estado é local (modo demo); cada aba possui seu próprio botão de salvar.
 */

import React, { useRef, useState } from "react";
import {
  Bell,
  Bot,
  Building2,
  Globe,
  KanbanSquare,
  LogOut,
  Monitor,
  Plus,
  ShieldCheck,
  Smartphone,
  Trash2,
  Upload,
} from "lucide-react";
import { PageTransition } from "@/components/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { LOCALE_LABELS, LOCALES, type Locale } from "@/lib/i18n/locales";
import { MOCK_COMPANY, MOCK_USERS } from "@/lib/mock/data";
import { cn, formatDateTime } from "@/lib/utils";

/* ---------------- Tipos e dados locais (modo demo) ---------------- */

type SettingsTab = "company" | "ai" | "locale" | "crm" | "notifications" | "security";

interface PipelineStage {
  id: string;
  name: string;
}

interface MockSession {
  id: string;
  device: string;
  location: string;
  lastActiveAt: string;
  current: boolean;
  mobile: boolean;
}

interface MockAuditEntry {
  id: string;
  userName: string;
  action: string;
  createdAt: string;
}

const INITIAL_STAGES: PipelineStage[] = [
  { id: "st_1", name: "Novo lead" },
  { id: "st_2", name: "Qualificação" },
  { id: "st_3", name: "Orçamento enviado" },
  { id: "st_4", name: "Negociação" },
  { id: "st_5", name: "Fechado" },
  { id: "st_6", name: "Manutenção" },
];

const INITIAL_SESSIONS: MockSession[] = [
  {
    id: "se_1",
    device: "MacBook Pro — Chrome 126",
    location: "São Paulo, Brasil",
    lastActiveAt: "2026-07-03T09:12:00Z",
    current: true,
    mobile: false,
  },
  {
    id: "se_2",
    device: "iPhone 15 — Safari",
    location: "São Paulo, Brasil",
    lastActiveAt: "2026-07-02T21:40:00Z",
    current: false,
    mobile: true,
  },
  {
    id: "se_3",
    device: "Windows 11 — Edge",
    location: "Campinas, Brasil",
    lastActiveAt: "2026-06-30T14:05:00Z",
    current: false,
    mobile: false,
  },
];

const MOCK_AUDIT_TRAIL: MockAuditEntry[] = [
  {
    id: "au_1",
    userName: MOCK_USERS[0].name,
    action: "Alterou o template padrão de PDF para 'Proposta padrão'",
    createdAt: "2026-07-02T16:40:00Z",
  },
  {
    id: "au_2",
    userName: MOCK_USERS[1].name,
    action: "Ativou a automação 'Follow-up 2 dias após envio'",
    createdAt: "2026-07-02T11:18:00Z",
  },
  {
    id: "au_3",
    userName: MOCK_USERS[2].name,
    action: "Enviou o orçamento ORC-2026-0148 por WhatsApp",
    createdAt: "2026-07-01T17:02:00Z",
  },
  {
    id: "au_4",
    userName: MOCK_USERS[0].name,
    action: "Convidou juliana@calhasprotech.com.br como Vendedor",
    createdAt: "2026-06-30T10:25:00Z",
  },
  {
    id: "au_5",
    userName: MOCK_USERS[1].name,
    action: "Atualizou os estágios do pipeline do CRM",
    createdAt: "2026-06-28T09:47:00Z",
  },
];

const BRAND_PRESETS = ["#00E676", "#00A85A", "#0EA5E9", "#8B5CF6", "#F59E0B", "#EF4444"];

/** QR fictício determinístico para o placeholder do 2FA. */
function QrPlaceholder() {
  const size = 21;
  const cells: React.ReactNode[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder =
        (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);
      const on = inFinder
        ? x % 6 === 0 || y % 6 === 0 || (x > 1 && x < 5 && y > 1 && y < 5) ||
          (x > size - 6 && x < size - 2 && y > 1 && y < 5) ||
          (x > 1 && x < 5 && y > size - 6 && y < size - 2)
        : (x * 7 + y * 13 + x * y) % 3 === 0;
      if (on) cells.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />);
    }
  }
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="h-36 w-36 rounded-lg bg-white p-2 text-kyber-black" aria-hidden>
      <g fill="currentColor">{cells}</g>
    </svg>
  );
}

export default function ConfiguracoesPage() {
  const { t, locale, setLocale } = useI18n();
  const { toast } = useToast();

  const [tab, setTab] = useState<SettingsTab>("company");

  /* ------------ (a) Empresa ------------ */
  const [companyName, setCompanyName] = useState(MOCK_COMPANY.name);
  const [segment, setSegment] = useState(MOCK_COMPANY.segment);
  const [phone, setPhone] = useState(MOCK_COMPANY.phone);
  const [whatsapp, setWhatsapp] = useState(MOCK_COMPANY.whatsappNumber);
  const [address, setAddress] = useState(MOCK_COMPANY.address);
  const [website, setWebsite] = useState("https://calhasprotech.com.br");
  const [logoPreview, setLogoPreview] = useState<string | null>(MOCK_COMPANY.logoUrl);
  const [brandColor, setBrandColor] = useState(MOCK_COMPANY.brandColor);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------ (b) IA ------------ */
  const [aiTone, setAiTone] = useState("professional");
  const [aiInstructions, setAiInstructions] = useState(
    "Sempre mencionar a garantia de 12 meses nos serviços de instalação."
  );
  const [questionLimit, setQuestionLimit] = useState(6);
  const [autoDiscount, setAutoDiscount] = useState(true);
  const [maxDiscount, setMaxDiscount] = useState(10);
  const [answerAudio, setAnswerAudio] = useState(true);

  /* ------------ (c) Idioma e região ------------ */
  const [currency, setCurrency] = useState("BRL");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");

  /* ------------ (d) CRM ------------ */
  const [stages, setStages] = useState<PipelineStage[]>(INITIAL_STAGES);
  const [newStageName, setNewStageName] = useState("");
  const [autoLead, setAutoLead] = useState(true);

  /* ------------ (e) Notificações ------------ */
  const [notifNewLead, setNotifNewLead] = useState(true);
  const [notifQuoteViewed, setNotifQuoteViewed] = useState(true);
  const [notifFollowUp, setNotifFollowUp] = useState(false);
  const [notifMaintenance, setNotifMaintenance] = useState(true);
  const [notifPayment, setNotifPayment] = useState(true);

  /* ------------ (f) Segurança ------------ */
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState<MockSession[]>(INITIAL_SESSIONS);

  const tabs: { value: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { value: "company", label: t("settings.tabCompany"), icon: <Building2 className="h-4 w-4" /> },
    { value: "ai", label: t("settings.tabAi"), icon: <Bot className="h-4 w-4" /> },
    { value: "locale", label: t("settings.tabLocale"), icon: <Globe className="h-4 w-4" /> },
    { value: "crm", label: t("settings.tabCrm"), icon: <KanbanSquare className="h-4 w-4" /> },
    { value: "notifications", label: t("settings.tabNotifications"), icon: <Bell className="h-4 w-4" /> },
    { value: "security", label: t("settings.tabSecurity"), icon: <ShieldCheck className="h-4 w-4" /> },
  ];

  const saveTab = (descriptionKey: string) => {
    toast("success", t("settings.savedToast"), t(descriptionKey));
  };

  const onLogoSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoPreview(String(reader.result));
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const addStage = () => {
    const name = newStageName.trim();
    if (!name) return;
    setStages((prev) => [...prev, { id: `st_${Date.now()}`, name }]);
    setNewStageName("");
  };

  const removeStage = (id: string) => {
    if (stages.length <= 2) {
      toast("error", t("settings.crmMinStagesToast"), t("settings.crmMinStagesToastDesc"));
      return;
    }
    setStages((prev) => prev.filter((s) => s.id !== id));
  };

  const changePassword = () => {
    if (newPassword.length < 8) {
      toast("error", t("settings.passwordTooShortToast"), t("settings.passwordTooShortToastDesc"));
      return;
    }
    if (newPassword !== confirmPassword) {
      toast("error", t("settings.passwordMismatchToast"), t("settings.passwordMismatchToastDesc"));
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    toast("success", t("settings.passwordChangedToast"), t("settings.passwordChangedToastDesc"));
  };

  const endSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    toast("success", t("settings.sessionEndedToast"), t("settings.sessionEndedToastDesc"));
  };

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("settings.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("settings.subtitle")}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
        {/* Navegação: vertical no desktop, lista rolável no mobile */}
        <nav className="flex shrink-0 gap-1.5 overflow-x-auto pb-1 lg:w-52 lg:flex-col lg:overflow-visible lg:pb-0">
          {tabs.map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={cn(
                "focus-ring flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                tab === item.value
                  ? "bg-kyber-green/10 text-kyber-green"
                  : "text-kyber-gray hover:bg-white/5 hover:text-kyber-soft"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="min-w-0 flex-1">
          {/* (a) Empresa */}
          {tab === "company" && (
            <Card>
              <CardTitle>{t("settings.companyTitle")}</CardTitle>
              <CardDescription>{t("settings.companyDescription")}</CardDescription>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Input label={t("settings.companyName")} value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                <Input label={t("settings.companySegment")} value={segment} onChange={(e) => setSegment(e.target.value)} />
                <Input label={t("settings.companyPhone")} value={phone} onChange={(e) => setPhone(e.target.value)} />
                <Input label={t("settings.companyWhatsapp")} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                <div className="sm:col-span-2">
                  <Input label={t("settings.companyAddress")} value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label={t("settings.companyWebsite")}
                    placeholder={t("settings.companyWebsitePlaceholder")}
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>

              {/* Logo */}
              <div className="mt-6">
                <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("settings.companyLogo")}</p>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border border-border bg-white/[0.04]">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt={t("settings.companyLogo")} className="h-full w-full object-contain" />
                    ) : (
                      <Building2 className="h-7 w-7 text-kyber-dim" />
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="h-3.5 w-3.5" />
                        {t("settings.companyLogoUpload")}
                      </Button>
                      {logoPreview && (
                        <Button variant="ghost" size="sm" onClick={() => setLogoPreview(null)}>
                          {t("settings.companyLogoRemove")}
                        </Button>
                      )}
                    </div>
                    <p className="text-xs text-kyber-dim">
                      {logoPreview ? t("settings.companyLogoHint") : t("settings.companyLogoEmpty")}
                    </p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={onLogoSelected} />
                </div>
              </div>

              {/* Cor da marca */}
              <div className="mt-6">
                <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("settings.brandColor")}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-white/[0.04] px-3 py-2">
                    <input
                      type="color"
                      value={brandColor}
                      onChange={(e) => setBrandColor(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                      aria-label={t("settings.brandColor")}
                    />
                    <span className="font-mono text-sm uppercase text-kyber-soft">{brandColor}</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-kyber-dim">{t("settings.brandPresets")}:</span>
                    {BRAND_PRESETS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setBrandColor(preset)}
                        aria-label={preset}
                        className={cn(
                          "focus-ring h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                          brandColor.toLowerCase() === preset.toLowerCase()
                            ? "border-white"
                            : "border-transparent"
                        )}
                        style={{ backgroundColor: preset }}
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-2 text-xs text-kyber-dim">{t("settings.brandColorHint")}</p>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => saveTab("settings.companySavedToastDesc")}>{t("settings.saveButton")}</Button>
              </div>
            </Card>
          )}

          {/* (b) IA */}
          {tab === "ai" && (
            <Card>
              <CardTitle>{t("settings.aiTitle")}</CardTitle>
              <CardDescription>{t("settings.aiDescription")}</CardDescription>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Select
                  label={t("settings.aiTone")}
                  options={[
                    { value: "professional", label: t("settings.aiToneProfessional") },
                    { value: "friendly", label: t("settings.aiToneFriendly") },
                    { value: "direct", label: t("settings.aiToneDirect") },
                  ]}
                  value={aiTone}
                  onChange={(e) => setAiTone(e.target.value)}
                />
                <Input
                  type="number"
                  min={1}
                  max={20}
                  label={t("settings.aiQuestionLimit")}
                  hint={t("settings.aiQuestionLimitHint")}
                  value={questionLimit}
                  onChange={(e) => setQuestionLimit(Number(e.target.value))}
                />
              </div>

              <div className="mt-4">
                <Textarea
                  label={t("settings.aiInstructions")}
                  placeholder={t("settings.aiInstructionsPlaceholder")}
                  hint={t("settings.aiInstructionsHint")}
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                />
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-white/[0.02] p-4">
                  <Switch checked={autoDiscount} onChange={setAutoDiscount} label={t("settings.aiAutoDiscount")} />
                  {autoDiscount && (
                    <div className="w-40">
                      <Input
                        type="number"
                        min={0}
                        max={50}
                        label={t("settings.aiMaxDiscount")}
                        value={maxDiscount}
                        onChange={(e) => setMaxDiscount(Number(e.target.value))}
                      />
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-white/[0.02] p-4">
                  <Switch checked={answerAudio} onChange={setAnswerAudio} label={t("settings.aiAnswerAudio")} />
                  <p className="ml-14 mt-1 text-xs text-kyber-dim">{t("settings.aiAnswerAudioHint")}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => saveTab("settings.aiSavedToastDesc")}>{t("settings.saveButton")}</Button>
              </div>
            </Card>
          )}

          {/* (c) Idioma e região */}
          {tab === "locale" && (
            <Card>
              <CardTitle>{t("settings.localeTitle")}</CardTitle>
              <CardDescription>{t("settings.localeDescription")}</CardDescription>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Select
                  label={t("settings.localeLanguage")}
                  options={LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l] }))}
                  value={locale}
                  onChange={(e) => setLocale(e.target.value as Locale)}
                />
                <Select
                  label={t("settings.localeCurrency")}
                  options={[
                    { value: "BRL", label: t("settings.currencyBRL") },
                    { value: "USD", label: t("settings.currencyUSD") },
                    { value: "EUR", label: t("settings.currencyEUR") },
                  ]}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                />
                <Select
                  label={t("settings.localeTimezone")}
                  options={[
                    { value: "America/Sao_Paulo", label: t("settings.tzSaoPaulo") },
                    { value: "America/Manaus", label: t("settings.tzManaus") },
                    { value: "Europe/Lisbon", label: t("settings.tzLisbon") },
                  ]}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => saveTab("settings.localeSavedToastDesc")}>{t("settings.saveButton")}</Button>
              </div>
            </Card>
          )}

          {/* (d) CRM */}
          {tab === "crm" && (
            <Card>
              <CardTitle>{t("settings.crmTitle")}</CardTitle>
              <CardDescription>{t("settings.crmDescription")}</CardDescription>

              <div className="mt-6">
                <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("settings.crmStages")}</p>
                <p className="mb-3 text-xs text-kyber-dim">{t("settings.crmStagesHint")}</p>
                <ul className="space-y-2">
                  {stages.map((stage, index) => (
                    <li key={stage.id} className="flex items-center gap-2">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kyber-green/10 text-xs font-semibold text-kyber-green">
                        {index + 1}
                      </span>
                      <Input
                        value={stage.name}
                        onChange={(e) =>
                          setStages((prev) =>
                            prev.map((s) => (s.id === stage.id ? { ...s, name: e.target.value } : s))
                          )
                        }
                        className="h-10"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={t("settings.crmRemoveStage")}
                        onClick={() => removeStage(stage.id)}
                        className="shrink-0 text-kyber-dim hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex items-center gap-2">
                  <Input
                    placeholder={t("settings.crmNewStagePlaceholder")}
                    value={newStageName}
                    onChange={(e) => setNewStageName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addStage()}
                    className="h-10"
                  />
                  <Button variant="secondary" size="sm" onClick={addStage} disabled={!newStageName.trim()} className="h-10 shrink-0">
                    <Plus className="h-4 w-4" />
                    {t("settings.crmAddStage")}
                  </Button>
                </div>
              </div>

              <div className="mt-6 rounded-xl border border-border bg-white/[0.02] p-4">
                <Switch checked={autoLead} onChange={setAutoLead} label={t("settings.crmAutoLead")} />
                <p className="ml-14 mt-1 text-xs text-kyber-dim">{t("settings.crmAutoLeadHint")}</p>
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => saveTab("settings.crmSavedToastDesc")}>{t("settings.saveButton")}</Button>
              </div>
            </Card>
          )}

          {/* (e) Notificações */}
          {tab === "notifications" && (
            <Card>
              <CardTitle>{t("settings.notifTitle")}</CardTitle>
              <CardDescription>{t("settings.notifDescription")}</CardDescription>

              <div className="mt-6 space-y-3">
                {(
                  [
                    { label: "settings.notifNewLead", hint: "settings.notifNewLeadHint", checked: notifNewLead, set: setNotifNewLead },
                    { label: "settings.notifQuoteViewed", hint: "settings.notifQuoteViewedHint", checked: notifQuoteViewed, set: setNotifQuoteViewed },
                    { label: "settings.notifFollowUp", hint: "settings.notifFollowUpHint", checked: notifFollowUp, set: setNotifFollowUp },
                    { label: "settings.notifMaintenance", hint: "settings.notifMaintenanceHint", checked: notifMaintenance, set: setNotifMaintenance },
                    { label: "settings.notifPayment", hint: "settings.notifPaymentHint", checked: notifPayment, set: setNotifPayment },
                  ] as const
                ).map((item) => (
                  <div key={item.label} className="rounded-xl border border-border bg-white/[0.02] p-4">
                    <Switch checked={item.checked} onChange={item.set} label={t(item.label)} />
                    <p className="ml-14 mt-1 text-xs text-kyber-dim">{t(item.hint)}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <Button onClick={() => saveTab("settings.notifSavedToastDesc")}>{t("settings.saveButton")}</Button>
              </div>
            </Card>
          )}

          {/* (f) Segurança */}
          {tab === "security" && (
            <div className="space-y-6">
              <Card>
                <CardTitle>{t("settings.passwordSection")}</CardTitle>
                <CardDescription>{t("settings.securityDescription")}</CardDescription>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Input
                    type="password"
                    label={t("settings.currentPassword")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    label={t("settings.newPassword")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <Input
                    type="password"
                    label={t("settings.confirmPassword")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <div className="mt-6 flex justify-end">
                  <Button onClick={changePassword} disabled={!currentPassword || !newPassword || !confirmPassword}>
                    {t("settings.changePasswordButton")}
                  </Button>
                </div>
              </Card>

              <Card>
                <CardTitle>{t("settings.twoFactorSection")}</CardTitle>
                <div className="mt-4 rounded-xl border border-border bg-white/[0.02] p-4">
                  <Switch checked={twoFactor} onChange={setTwoFactor} label={t("settings.twoFactorLabel")} />
                  <p className="ml-14 mt-1 text-xs text-kyber-dim">{t("settings.twoFactorHint")}</p>
                </div>
                {twoFactor && (
                  <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border border-kyber-green/25 bg-kyber-green/[0.05] p-6 sm:flex-row sm:items-center sm:gap-6">
                    <QrPlaceholder />
                    <div>
                      <p className="text-sm font-medium text-kyber-white">{t("settings.twoFactorQrTitle")}</p>
                      <p className="mt-1 text-xs text-kyber-gray">{t("settings.twoFactorQrHint")}</p>
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <CardTitle>{t("settings.sessionsSection")}</CardTitle>
                <ul className="mt-4 space-y-2">
                  {sessions.map((session) => (
                    <li
                      key={session.id}
                      className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white/[0.02] p-4"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-kyber-green/10 text-kyber-green">
                        {session.mobile ? <Smartphone className="h-5 w-5" /> : <Monitor className="h-5 w-5" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium text-kyber-white">{session.device}</p>
                          {session.current && <Badge tone="green">{t("settings.sessionCurrent")}</Badge>}
                        </div>
                        <p className="mt-0.5 text-xs text-kyber-gray">
                          {session.location} · {formatDateTime(session.lastActiveAt)}
                        </p>
                      </div>
                      {!session.current && (
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => endSession(session.id)}>
                          <LogOut className="h-3.5 w-3.5" />
                          {t("settings.sessionEnd")}
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="!p-0">
                <div className="border-b border-border p-6 pb-4">
                  <CardTitle>{t("settings.auditSection")}</CardTitle>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[520px] text-left text-sm">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider text-kyber-dim">
                        <th className="px-6 py-3 font-medium">{t("settings.auditUser")}</th>
                        <th className="px-6 py-3 font-medium">{t("settings.auditAction")}</th>
                        <th className="px-6 py-3 font-medium">{t("settings.auditDate")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MOCK_AUDIT_TRAIL.map((entry) => (
                        <tr key={entry.id} className="border-b border-border/60 last:border-0">
                          <td className="px-6 py-3.5 font-medium text-kyber-soft">{entry.userName}</td>
                          <td className="px-6 py-3.5 text-kyber-gray">{entry.action}</td>
                          <td className="px-6 py-3.5 whitespace-nowrap text-kyber-dim">
                            {formatDateTime(entry.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
