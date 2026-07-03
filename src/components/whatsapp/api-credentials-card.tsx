"use client";

/**
 * Configuração da API de WhatsApp por empresa (PRD 4.3c).
 * Cada tenant informa o provedor e as credenciais que conectam
 * o agente de IA ao seu próprio número.
 */

import React, { useState } from "react";
import { Copy, Eye, EyeOff, KeyRound, Link2, ShieldCheck } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ApiCredentialsCard() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [provider, setProvider] = useState("zapi");
  const [baseUrl, setBaseUrl] = useState("https://api.z-api.io/instances");
  const [token, setToken] = useState("tok_demo_9f3k2m8x1q");
  const [secret, setSecret] = useState("whsec_demo_77aa22bb");
  const [showToken, setShowToken] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  const webhookUrl = "https://app.kybergo.com.br/api/webhooks/whatsapp";

  const save = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast("success", t("whatsapp.credsSaved"), t("whatsapp.credsSavedDescription"));
    }, 900);
  };

  const copyWebhook = () => {
    void navigator.clipboard?.writeText(webhookUrl);
    toast("info", t("common.copied"));
  };

  return (
    <GlassCard hover={false} className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-kyber-white">
            <KeyRound className="h-5 w-5 text-kyber-green" />
            {t("whatsapp.credsTitle")}
          </h2>
          <p className="mt-1 text-sm text-kyber-gray">{t("whatsapp.credsSubtitle")}</p>
        </div>
        <Badge tone="green" dot>
          {t("whatsapp.credsValidBadge")}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Select
          label={t("whatsapp.credsProvider")}
          options={[
            { value: "zapi", label: "Z-API" },
            { value: "uazapi", label: "UAZ API" },
            { value: "azapi", label: "AZ API" },
            { value: "custom", label: t("whatsapp.credsProviderCustom") },
          ]}
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
        />
        <Input
          label={t("whatsapp.credsBaseUrl")}
          value={baseUrl}
          onChange={(e) => setBaseUrl(e.target.value)}
          icon={<Link2 className="h-4 w-4" />}
        />
        <Input
          type={showToken ? "text" : "password"}
          label={t("whatsapp.credsToken")}
          value={token}
          onChange={(e) => setToken(e.target.value)}
          hint={t("whatsapp.credsTokenHint")}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowToken((s) => !s)}
              aria-label={t("whatsapp.credsToggleVisibility")}
              className="focus-ring rounded-lg p-1.5 text-kyber-dim hover:text-kyber-soft"
            >
              {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
        <Input
          type={showSecret ? "text" : "password"}
          label={t("whatsapp.credsWebhookSecret")}
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          hint={t("whatsapp.credsWebhookSecretHint")}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowSecret((s) => !s)}
              aria-label={t("whatsapp.credsToggleVisibility")}
              className="focus-ring rounded-lg p-1.5 text-kyber-dim hover:text-kyber-soft"
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white/[0.03] px-4 py-3">
        <ShieldCheck className="h-4 w-4 shrink-0 text-kyber-green" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-kyber-soft">{t("whatsapp.credsWebhookUrl")}</p>
          <p className="truncate font-mono text-xs text-kyber-gray">{webhookUrl}</p>
        </div>
        <Button variant="secondary" size="sm" onClick={copyWebhook}>
          <Copy className="h-3.5 w-3.5" />
          {t("common.copy")}
        </Button>
      </div>

      <div className="mt-5 flex justify-end">
        <Button onClick={save} loading={saving}>
          {t("common.save")}
        </Button>
      </div>
    </GlassCard>
  );
}
