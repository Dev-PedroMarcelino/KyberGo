"use client";

/**
 * Editor visual de templates de PDF.
 * Painel de controles à esquerda + preview ao vivo (PdfDocument) à direita.
 */

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Copy, Download, Maximize2, Plus, Save, Star, Trash2, Upload } from "lucide-react";
import { PageTransition } from "@/components/motion";
import { PdfDocument } from "@/components/pdf/pdf-document";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Accordion, Switch } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";
import { MOCK_COMPANY, MOCK_CUSTOMERS, MOCK_PDF_TEMPLATES, MOCK_QUOTES } from "@/lib/mock/data";
import type { PdfTemplate, PdfTemplateSections } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Presets de cor alinhados à paleta do produto + tons corporativos comuns. */
const COLOR_PRESETS = ["#00A85A", "#00E676", "#0B0F0C", "#1D4ED8", "#7C3AED", "#DB2777", "#EA580C", "#0D9488"];

const STYLE_OPTIONS: PdfTemplate["style"][] = ["moderno", "classico", "minimalista", "executivo"];

const SECTION_KEYS: (keyof PdfTemplateSections)[] = [
  "header",
  "companyData",
  "clientData",
  "itemsTable",
  "paymentTerms",
  "terms",
  "signature",
  "footer",
  "qrCode",
  "watermark",
];

/** Miniatura visual de cada estilo de layout. */
function StyleThumb({ style, active }: { style: PdfTemplate["style"]; active: boolean }) {
  const bar = active ? "bg-kyber-green" : "bg-kyber-dim";
  const line = active ? "bg-kyber-green/40" : "bg-white/15";
  return (
    <div className="relative h-16 w-full overflow-hidden rounded-md border border-white/10 bg-white/[0.06] p-1.5">
      {style === "moderno" && (
        <>
          <div className={cn("absolute inset-y-0 left-0 w-1", bar)} />
          <div className="ml-2 space-y-1">
            <div className={cn("h-1.5 w-7 rounded-sm", bar)} />
            <div className={cn("h-1 w-12 rounded-sm", line)} />
            <div className={cn("h-1 w-10 rounded-sm", line)} />
            <div className={cn("h-1 w-12 rounded-sm", line)} />
          </div>
        </>
      )}
      {style === "classico" && (
        <div className="flex flex-col items-center gap-1 pt-0.5">
          <div className={cn("h-1.5 w-8 rounded-sm", bar)} />
          <div className={cn("h-px w-full", bar)} />
          <div className={cn("mt-0.5 h-1 w-12 rounded-sm", line)} />
          <div className={cn("h-1 w-10 rounded-sm", line)} />
          <div className={cn("h-1 w-12 rounded-sm", line)} />
        </div>
      )}
      {style === "minimalista" && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <div className={cn("h-1 w-6 rounded-sm", bar)} />
            <div className={cn("h-1 w-4 rounded-sm", line)} />
          </div>
          <div className={cn("h-px w-full", line)} />
          <div className={cn("h-1 w-10 rounded-sm", line)} />
          <div className={cn("h-1 w-12 rounded-sm", line)} />
        </div>
      )}
      {style === "executivo" && (
        <>
          <div className={cn("-m-1.5 mb-1 h-5", bar)} />
          <div className="space-y-1 pt-0.5">
            <div className={cn("h-1 w-12 rounded-sm", line)} />
            <div className={cn("h-1 w-9 rounded-sm", line)} />
            <div className={cn("h-1 w-12 rounded-sm", line)} />
          </div>
        </>
      )}
    </div>
  );
}

/** Seletor de cor com input nativo + presets da paleta. */
function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium text-kyber-soft">{label}</p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="focus-ring relative h-9 w-14 cursor-pointer overflow-hidden rounded-lg border border-border">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] cursor-pointer border-0 p-0"
            aria-label={label}
          />
        </label>
        <span className="font-mono text-xs uppercase text-kyber-gray">{value}</span>
        <div className="flex flex-wrap gap-1.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              aria-label={preset}
              className={cn(
                "focus-ring h-5 w-5 rounded-full border transition-transform hover:scale-110",
                value.toLowerCase() === preset.toLowerCase()
                  ? "border-kyber-green ring-1 ring-kyber-green/60"
                  : "border-white/20"
              )}
              style={{ backgroundColor: preset }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function PdfTemplatesPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [templates, setTemplates] = useState<PdfTemplate[]>(MOCK_PDF_TEMPLATES);
  const [selectedId, setSelectedId] = useState<string>(
    MOCK_PDF_TEMPLATES.find((tp) => tp.isDefault)?.id ?? MOCK_PDF_TEMPLATES[0].id
  );
  const counter = useRef(MOCK_PDF_TEMPLATES.length);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const template = templates.find((tp) => tp.id === selectedId) ?? templates[0];

  // Amostra usada no preview ao vivo: primeiro orçamento + seu cliente.
  const quote = MOCK_QUOTES[0];
  const customer = MOCK_CUSTOMERS.find((c) => c.id === quote.customerId) ?? MOCK_CUSTOMERS[0];

  const patch = (partial: Partial<PdfTemplate>) => {
    setTemplates((prev) =>
      prev.map((tp) =>
        tp.id === template.id ? { ...tp, ...partial, updatedAt: new Date().toISOString() } : tp
      )
    );
  };

  const patchSection = (key: keyof PdfTemplateSections, value: boolean) => {
    patch({ sections: { ...template.sections, [key]: value } });
  };

  const handleNewTemplate = () => {
    counter.current += 1;
    const base = templates.find((tp) => tp.isDefault) ?? templates[0];
    const fresh: PdfTemplate = {
      ...base,
      id: `pt_new_${counter.current}_${Date.now()}`,
      name: t("pdf.newTemplateName", { n: counter.current }),
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, fresh]);
    setSelectedId(fresh.id);
    toast("success", t("pdf.newTemplateToastTitle"), t("pdf.newTemplateToastDesc", { name: fresh.name }));
  };

  const handleDuplicate = () => {
    counter.current += 1;
    const copy: PdfTemplate = {
      ...template,
      id: `pt_copy_${counter.current}_${Date.now()}`,
      name: `${template.name} ${t("pdf.copySuffix")}`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [...prev, copy]);
    setSelectedId(copy.id);
    toast("success", t("pdf.duplicatedToastTitle"), t("pdf.duplicatedToastDesc", { name: copy.name }));
  };

  const handleSave = () => {
    toast("success", t("pdf.savedToastTitle"), t("pdf.savedToastDesc", { name: template.name }));
  };

  const handleDownload = () => {
    toast("info", t("pdf.downloadToastTitle"), t("pdf.downloadToastDesc"));
  };

  const handleSetDefault = (checked: boolean) => {
    setTemplates((prev) =>
      prev.map((tp) => ({
        ...tp,
        isDefault: checked ? tp.id === template.id : tp.isDefault && tp.id !== template.id,
      }))
    );
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      patch({ logoUrl: typeof reader.result === "string" ? reader.result : null });
      toast("success", t("pdf.logoUploadedTitle"), t("pdf.logoUploadedDesc"));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <PageTransition>
      {/* Cabeçalho da página + barra de ações */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("pdf.templatesTitle")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("pdf.templatesSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4" />
            {t("pdf.downloadTest")}
          </Button>
          <Link href="/app/pdf/preview">
            <Button variant="outline" size="sm">
              <Maximize2 className="h-4 w-4" />
              {t("pdf.fullPreview")}
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={handleDuplicate}>
            <Copy className="h-4 w-4" />
            {t("common.duplicate")}
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Save className="h-4 w-4" />
            {t("common.save")}
          </Button>
        </div>
      </div>

      {/* Seletor de templates */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {templates.map((tp) => (
          <button
            key={tp.id}
            onClick={() => setSelectedId(tp.id)}
            className={cn(
              "focus-ring flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200",
              tp.id === template.id
                ? "border-kyber-green/50 bg-kyber-green/15 text-kyber-green shadow-glow-sm"
                : "border-border bg-white/[0.03] text-kyber-gray hover:border-white/25 hover:text-kyber-soft"
            )}
          >
            {tp.isDefault && <Star className="h-3.5 w-3.5 fill-current" />}
            {tp.name}
          </button>
        ))}
        <button
          onClick={handleNewTemplate}
          className="focus-ring flex items-center gap-1.5 rounded-full border border-dashed border-kyber-green/40 px-4 py-1.5 text-sm font-medium text-kyber-green transition-colors hover:bg-kyber-green/10"
        >
          <Plus className="h-4 w-4" />
          {t("pdf.newTemplate")}
        </button>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Painel de controles (embaixo no mobile) */}
        <div className="order-2 flex w-full flex-col gap-3 lg:order-1 lg:w-[380px] lg:shrink-0">
          {/* (a) Estilo */}
          <Accordion title={t("pdf.styleSection")} defaultOpen>
            <div className="grid grid-cols-2 gap-3">
              {STYLE_OPTIONS.map((style) => (
                <button
                  key={style}
                  onClick={() => patch({ style })}
                  className={cn(
                    "focus-ring rounded-xl border p-2.5 text-left transition-all duration-200",
                    template.style === style
                      ? "border-kyber-green/60 bg-kyber-green/[0.08] shadow-glow-sm"
                      : "border-border bg-white/[0.02] hover:border-white/25"
                  )}
                >
                  <StyleThumb style={style} active={template.style === style} />
                  <p
                    className={cn(
                      "mt-2 text-xs font-semibold",
                      template.style === style ? "text-kyber-green" : "text-kyber-soft"
                    )}
                  >
                    {t(`pdf.style_${style}`)}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-snug text-kyber-dim">{t(`pdf.styleDesc_${style}`)}</p>
                </button>
              ))}
            </div>
          </Accordion>

          {/* (b) Marca */}
          <Accordion title={t("pdf.brandSection")} defaultOpen>
            <div className="space-y-5">
              <div>
                <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("pdf.logoLabel")}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-white/[0.04]">
                    {template.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={template.logoUrl} alt={t("pdf.logoLabel")} className="h-full w-full object-contain p-1" />
                    ) : (
                      <Upload className="h-5 w-5 text-kyber-dim" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <Button variant="secondary" size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-3.5 w-3.5" />
                      {t("pdf.logoUpload")}
                    </Button>
                    {template.logoUrl && (
                      <Button variant="ghost" size="sm" onClick={() => patch({ logoUrl: null })}>
                        <Trash2 className="h-3.5 w-3.5" />
                        {t("pdf.logoRemove")}
                      </Button>
                    )}
                  </div>
                </div>
                <p className="mt-1.5 text-xs text-kyber-dim">{t("pdf.logoHint")}</p>
              </div>

              <ColorField
                label={t("pdf.primaryColor")}
                value={template.colors.primary}
                onChange={(primary) => patch({ colors: { ...template.colors, primary } })}
              />
              <ColorField
                label={t("pdf.accentColor")}
                value={template.colors.accent}
                onChange={(accent) => patch({ colors: { ...template.colors, accent } })}
              />

              <Select
                label={t("pdf.fontLabel")}
                value={template.font}
                onChange={(e) => patch({ font: e.target.value })}
                options={[
                  { value: "Inter", label: "Inter" },
                  { value: "Space Grotesk", label: "Space Grotesk" },
                ]}
              />
            </div>
          </Accordion>

          {/* (c) Seções */}
          <Accordion title={t("pdf.sectionsSection")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {SECTION_KEYS.map((key) => (
                <div key={key} className="flex items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                  <span className="text-xs text-kyber-soft">{t(`pdf.sec_${key}`)}</span>
                  <Switch checked={template.sections[key]} onChange={(checked) => patchSection(key, checked)} />
                </div>
              ))}
            </div>
          </Accordion>

          {/* (d) Textos */}
          <Accordion title={t("pdf.textsSection")}>
            <div className="space-y-4">
              <Textarea
                label={t("pdf.termsLabel")}
                value={template.terms}
                onChange={(e) => patch({ terms: e.target.value })}
                placeholder={t("pdf.termsPlaceholder")}
                rows={4}
              />
              <Input
                label={t("pdf.footerLabel")}
                value={template.footer}
                onChange={(e) => patch({ footer: e.target.value })}
                placeholder={t("pdf.footerPlaceholder")}
              />
            </div>
          </Accordion>

          {/* (e) Padrão */}
          <Accordion title={t("pdf.defaultSection")}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-kyber-soft">{t("pdf.defaultLabel")}</p>
                <p className="mt-0.5 text-xs text-kyber-dim">{t("pdf.defaultHint")}</p>
              </div>
              <Switch checked={template.isDefault} onChange={handleSetDefault} />
            </div>
          </Accordion>
        </div>

        {/* Preview ao vivo (primeiro no mobile) */}
        <div className="order-1 min-w-0 flex-1 lg:order-2 lg:sticky lg:top-2">
          <div className="bg-grid relative overflow-hidden rounded-2xl border border-border bg-kyber-black/60 p-4 sm:p-8">
            <div className="mb-4 flex items-center justify-between gap-2">
              <Badge tone="neon" dot>
                {t("pdf.livePreview")}
              </Badge>
              <span className="text-xs text-kyber-dim">
                {quote.number} · {customer.name}
              </span>
            </div>
            <div className="mx-auto w-full max-w-[560px]">
              <motion.div
                key={`${template.id}-${template.style}-${template.font}`}
                initial={{ opacity: 0, y: 10, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                <PdfDocument
                  template={template}
                  quote={quote}
                  customer={customer}
                  company={MOCK_COMPANY}
                  className="shadow-2xl"
                />
              </motion.div>
            </div>
            <p className="mt-4 text-center text-xs text-kyber-dim">{t("pdf.previewHint")}</p>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
