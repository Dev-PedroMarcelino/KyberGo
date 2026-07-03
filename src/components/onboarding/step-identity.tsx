"use client";

/** Etapa 1 — Identidade da empresa: nome, logo, cor da marca, segmento e contatos. */

import React, { useRef } from "react";
import { Building2, Globe, ImageIcon, MapPin, Phone, Trash2, Upload } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { StepHeader, buildSegmentOptions } from "./shared";
import type { StepProps } from "./types";

const BRAND_PRESETS = ["#00E676", "#00A85A", "#0EA5E9", "#2563EB", "#8B5CF6", "#F59E0B", "#EF4444", "#111827"];

export function StepIdentity({ data, update, errors }: StepProps & { errors: Record<string, string> }) {
  const { t } = useI18n();
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (data.logoPreview) URL.revokeObjectURL(data.logoPreview);
    update({ logoPreview: URL.createObjectURL(file) });
    e.target.value = "";
  };

  const removeLogo = () => {
    if (data.logoPreview) URL.revokeObjectURL(data.logoPreview);
    update({ logoPreview: null });
  };

  return (
    <div>
      <StepHeader title={t("onboarding.identityTitle")} subtitle={t("onboarding.identitySubtitle")} />

      <div className="space-y-5">
        <Input
          label={t("onboarding.companyName")}
          placeholder={t("onboarding.companyNamePlaceholder")}
          value={data.companyName}
          onChange={(e) => update({ companyName: e.target.value })}
          error={errors.companyName}
          icon={<Building2 className="h-4 w-4" />}
        />

        {/* Upload de logo com preview */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("onboarding.logoLabel")}</p>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-white/[0.03] p-4">
            <div
              className={cn(
                "flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border",
                data.logoPreview ? "border-kyber-green/40 bg-white/5" : "border-dashed border-white/20 bg-white/[0.03]"
              )}
            >
              {data.logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.logoPreview} alt={t("onboarding.logoLabel")} className="h-full w-full object-contain p-1.5" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-kyber-dim">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-[10px]">{t("onboarding.logoEmpty")}</span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" size="sm" type="button" onClick={() => fileRef.current?.click()}>
                  <Upload className="h-3.5 w-3.5" />
                  {data.logoPreview ? t("onboarding.logoChange") : t("onboarding.logoUpload")}
                </Button>
                {data.logoPreview && (
                  <Button variant="ghost" size="sm" type="button" onClick={removeLogo}>
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("onboarding.logoRemove")}
                  </Button>
                )}
              </div>
              <p className="mt-2 text-xs text-kyber-dim">{t("onboarding.logoHint")}</p>
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml" className="hidden" onChange={onFile} />
          </div>
        </div>

        {/* Cor da marca */}
        <div>
          <p className="mb-1.5 text-sm font-medium text-kyber-soft">{t("onboarding.brandColor")}</p>
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-white/[0.03] p-4">
            <label className="relative h-10 w-14 cursor-pointer overflow-hidden rounded-xl border border-white/15">
              <input
                type="color"
                value={data.brandColor}
                onChange={(e) => update({ brandColor: e.target.value })}
                aria-label={t("onboarding.brandColor")}
                className="absolute -inset-2 h-[150%] w-[150%] cursor-pointer border-0 bg-transparent p-0"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {BRAND_PRESETS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => update({ brandColor: color })}
                  className={cn(
                    "focus-ring h-7 w-7 rounded-full border border-white/15 transition-transform hover:scale-110",
                    data.brandColor.toLowerCase() === color.toLowerCase() &&
                      "ring-2 ring-kyber-green ring-offset-2 ring-offset-kyber-rich"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="ml-auto font-mono text-xs uppercase text-kyber-gray">{data.brandColor}</span>
          </div>
          <p className="mt-1.5 text-xs text-kyber-dim">{t("onboarding.brandColorHint")}</p>
        </div>

        <Select
          label={t("onboarding.segment")}
          placeholder={t("onboarding.segmentPlaceholder")}
          options={buildSegmentOptions(t)}
          value={data.segment}
          onChange={(e) => update({ segment: e.target.value })}
          error={errors.segment}
        />

        <Input
          label={t("onboarding.address")}
          placeholder={t("onboarding.addressPlaceholder")}
          value={data.address}
          onChange={(e) => update({ address: e.target.value })}
          icon={<MapPin className="h-4 w-4" />}
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <Input
            label={t("onboarding.phone")}
            placeholder={t("onboarding.phonePlaceholder")}
            value={data.phone}
            onChange={(e) => update({ phone: e.target.value })}
            error={errors.phone}
            icon={<Phone className="h-4 w-4" />}
          />
          <Input
            label={t("onboarding.website")}
            placeholder={t("onboarding.websitePlaceholder")}
            value={data.website}
            onChange={(e) => update({ website: e.target.value })}
            icon={<Globe className="h-4 w-4" />}
          />
        </div>
      </div>
    </div>
  );
}
