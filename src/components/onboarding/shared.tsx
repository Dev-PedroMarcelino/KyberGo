"use client";

/** Peças compartilhadas entre as etapas do onboarding. */

import React from "react";

type Translate = (key: string, vars?: Record<string, string | number>) => string;

/** Cabeçalho padrão de cada etapa do wizard. */
export function StepHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="mb-6">
      <h2 className="font-display text-xl font-bold tracking-tight text-kyber-white sm:text-2xl">{title}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-kyber-gray">{subtitle}</p>
    </div>
  );
}

/** Opções de segmento — usadas na etapa 1 e na revisão final. */
export function buildSegmentOptions(t: Translate) {
  return [
    { value: "calhas", label: t("onboarding.segGutters") },
    { value: "ar", label: t("onboarding.segAc") },
    { value: "marcenaria", label: t("onboarding.segCarpentry") },
    { value: "gesso", label: t("onboarding.segPlaster") },
    { value: "manutencao", label: t("onboarding.segMaintenance") },
    { value: "eletrica", label: t("onboarding.segElectrical") },
    { value: "outro", label: t("onboarding.segOther") },
  ];
}

/** Opções de tipo de campo dos critérios de orçamento. */
export function buildFieldTypeOptions(t: Translate) {
  return [
    { value: "number", label: t("onboarding.typeNumber") },
    { value: "text", label: t("onboarding.typeText") },
    { value: "select", label: t("onboarding.typeSelect") },
    { value: "boolean", label: t("onboarding.typeBoolean") },
    { value: "currency", label: t("onboarding.typeCurrency") },
  ];
}

/** Rótulos dos estilos de PDF. */
export function buildPdfStyleLabels(t: Translate): Record<string, string> {
  return {
    moderno: t("onboarding.styleModern"),
    classico: t("onboarding.styleClassic"),
    minimalista: t("onboarding.styleMinimal"),
    executivo: t("onboarding.styleExecutive"),
  };
}
