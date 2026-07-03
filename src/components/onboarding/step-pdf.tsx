"use client";

/** Etapa 5 — Personalização do PDF: estilo, cores, textos e seções do documento. */

import React from "react";
import { Check } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/misc";
import { cn } from "@/lib/utils";
import { StepHeader, buildPdfStyleLabels } from "./shared";
import type { OnboardingData, PdfStyle, StepProps } from "./types";

const PDF_STYLES: PdfStyle[] = ["moderno", "classico", "minimalista", "executivo"];
const COLOR_PRESETS = ["#00A85A", "#00E676", "#0B0F0C", "#2563EB", "#7C3AED", "#B45309", "#DC2626", "#334155"];

/** Linhas de texto simuladas nas miniaturas. */
function Lines({ widths, centered }: { widths: string[]; centered?: boolean }) {
  return (
    <>
      {widths.map((w, i) => (
        <div key={i} className={cn("h-1 rounded-full bg-zinc-300", w, centered && "mx-auto")} />
      ))}
    </>
  );
}

/** Miniatura estilizada de cada template de PDF. */
function StyleThumb({ style, primary, accent }: { style: PdfStyle; primary: string; accent: string }) {
  return (
    <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-white shadow-sm">
      {style === "moderno" && (
        <div className="flex h-full flex-col p-2">
          <div className="h-3 rounded-sm" style={{ backgroundColor: primary }} />
          <div className="mt-2 h-1.5 w-2/3 rounded-full bg-zinc-800" />
          <div className="mt-2 space-y-1">
            <Lines widths={["w-full", "w-5/6", "w-4/6"]} />
          </div>
          <div className="mt-auto flex items-center justify-between">
            <div className="h-1 w-1/3 rounded-full bg-zinc-300" />
            <div className="h-2.5 w-8 rounded-sm" style={{ backgroundColor: accent }} />
          </div>
        </div>
      )}
      {style === "classico" && (
        <div className="flex h-full flex-col items-center p-2">
          <div className="h-1.5 w-1/2 rounded-full bg-zinc-800" />
          <div className="mt-1 h-px w-3/4" style={{ backgroundColor: primary }} />
          <div className="mt-2.5 w-full space-y-1">
            <Lines widths={["w-5/6", "w-4/6", "w-5/6"]} centered />
          </div>
          <div className="mt-auto w-full border-t border-zinc-200 pt-1.5">
            <div className="mx-auto h-1 w-1/2 rounded-full bg-zinc-300" />
          </div>
        </div>
      )}
      {style === "minimalista" && (
        <div className="flex h-full flex-col p-2.5">
          <div className="h-1.5 w-1/3 rounded-full bg-zinc-800" />
          <div className="mt-3 space-y-1.5">
            <Lines widths={["w-3/4", "w-1/2"]} />
          </div>
          <div className="mt-auto h-1 w-1/4 rounded-full" style={{ backgroundColor: primary }} />
        </div>
      )}
      {style === "executivo" && (
        <div className="flex h-full">
          <div className="h-full w-1/4" style={{ backgroundColor: primary }} />
          <div className="flex flex-1 flex-col p-2">
            <div className="h-1.5 w-3/4 rounded-full bg-zinc-800" />
            <div className="mt-2 space-y-1">
              <Lines widths={["w-full", "w-5/6", "w-4/6"]} />
            </div>
            <div className="mt-auto h-2 w-10 rounded-sm" style={{ backgroundColor: accent }} />
          </div>
        </div>
      )}
    </div>
  );
}

/** Seletor de cor com presets. */
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
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-white/[0.03] p-3">
        <label className="relative h-9 w-11 cursor-pointer overflow-hidden rounded-lg border border-white/15">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={label}
            className="absolute -inset-2 h-[150%] w-[150%] cursor-pointer border-0 bg-transparent p-0"
          />
        </label>
        {COLOR_PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            aria-label={color}
            onClick={() => onChange(color)}
            className={cn(
              "focus-ring h-6 w-6 rounded-full border border-white/15 transition-transform hover:scale-110",
              value.toLowerCase() === color.toLowerCase() &&
                "ring-2 ring-kyber-green ring-offset-2 ring-offset-kyber-rich"
            )}
            style={{ backgroundColor: color }}
          />
        ))}
        <span className="ml-auto font-mono text-[11px] uppercase text-kyber-gray">{value}</span>
      </div>
    </div>
  );
}

export function StepPdf({ data, update }: StepProps) {
  const { t } = useI18n();
  const styleLabels = buildPdfStyleLabels(t);

  const sections: Array<{ key: keyof OnboardingData["pdfSections"]; label: string }> = [
    { key: "header", label: t("onboarding.secHeader") },
    { key: "signature", label: t("onboarding.secSignature") },
    { key: "footer", label: t("onboarding.secFooter") },
    { key: "qrCode", label: t("onboarding.secQr") },
  ];

  return (
    <div>
      <StepHeader title={t("onboarding.pdfTitle")} subtitle={t("onboarding.pdfSubtitle")} />

      <div className="space-y-6">
        {/* Estilo do template */}
        <div>
          <p className="mb-3 text-sm font-medium text-kyber-soft">{t("onboarding.pdfStyleLabel")}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {PDF_STYLES.map((style) => {
              const selected = data.pdfStyle === style;
              return (
                <button
                  key={style}
                  type="button"
                  onClick={() => update({ pdfStyle: style })}
                  className={cn(
                    "focus-ring relative rounded-xl border p-3 transition-all duration-200",
                    selected
                      ? "border-kyber-green/60 bg-kyber-green/10 shadow-glow-sm"
                      : "border-border bg-white/[0.03] hover:border-white/25"
                  )}
                >
                  {selected && (
                    <span className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-kyber-green">
                      <Check className="h-3 w-3 text-kyber-black" />
                    </span>
                  )}
                  <StyleThumb style={style} primary={data.pdfPrimaryColor} accent={data.pdfAccentColor} />
                  <span className={cn("mt-2 block text-center text-xs font-medium", selected ? "text-kyber-green" : "text-kyber-gray")}>
                    {styleLabels[style]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cores */}
        <div>
          <p className="mb-3 text-sm font-medium text-kyber-soft">{t("onboarding.pdfColorsLabel")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <ColorField
              label={t("onboarding.pdfPrimary")}
              value={data.pdfPrimaryColor}
              onChange={(color) => update({ pdfPrimaryColor: color })}
            />
            <ColorField
              label={t("onboarding.pdfAccent")}
              value={data.pdfAccentColor}
              onChange={(color) => update({ pdfAccentColor: color })}
            />
          </div>
        </div>

        {/* Textos */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Textarea
            label={t("onboarding.pdfTermsLabel")}
            placeholder={t("onboarding.pdfTermsPlaceholder")}
            value={data.pdfTerms}
            onChange={(e) => update({ pdfTerms: e.target.value })}
          />
          <Textarea
            label={t("onboarding.pdfPaymentLabel")}
            placeholder={t("onboarding.pdfPaymentPlaceholder")}
            value={data.pdfPayment}
            onChange={(e) => update({ pdfPayment: e.target.value })}
          />
        </div>

        {/* Seções */}
        <div>
          <p className="mb-3 text-sm font-medium text-kyber-soft">{t("onboarding.pdfSectionsLabel")}</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {sections.map((section) => (
              <div key={section.key} className="rounded-xl border border-border bg-white/[0.03] p-4">
                <Switch
                  checked={data.pdfSections[section.key]}
                  onChange={(v) => update({ pdfSections: { ...data.pdfSections, [section.key]: v } })}
                  label={section.label}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
