/**
 * Estado local do wizard de onboarding.
 * Tudo vive em memória (modo demo) — em produção a persistência acontece na camada de serviços.
 */

import type { CriteriaFieldType } from "@/lib/types";

export type WhatsappSetupStatus = "waiting" | "connecting" | "connected";
export type OnboardingQuoteMode = "intelligent" | "simple" | "both";
export type PdfStyle = "moderno" | "classico" | "minimalista" | "executivo";
export type MaintenanceInterval = "3" | "6" | "12";

export interface CriterionDraft {
  id: string;
  label: string;
  fieldType: CriteriaFieldType;
  required: boolean;
  calculationRule: string;
}

export interface PipelineStageDraft {
  id: string;
  name: string;
}

export interface OnboardingData {
  // Etapa 1 — identidade
  companyName: string;
  logoPreview: string | null;
  brandColor: string;
  segment: string;
  address: string;
  phone: string;
  website: string;
  // Etapa 2 — WhatsApp
  whatsappStatus: WhatsappSetupStatus;
  // Etapa 3 — modo de orçamento
  quoteMode: OnboardingQuoteMode;
  // Etapa 4 — critérios
  quoteTypeName: string;
  quoteTypeDescription: string;
  criteria: CriterionDraft[];
  // Etapa 5 — PDF
  pdfStyle: PdfStyle;
  pdfPrimaryColor: string;
  pdfAccentColor: string;
  pdfTerms: string;
  pdfPayment: string;
  pdfSections: { header: boolean; signature: boolean; footer: boolean; qrCode: boolean };
  // Etapa 6 — pipeline
  stages: PipelineStageDraft[];
  // Etapa 7 — automações
  maintenanceInterval: MaintenanceInterval;
  followUpTemplate: string;
  autoMessages: boolean;
  optOutEnabled: boolean;
}

export interface StepProps {
  data: OnboardingData;
  update: (patch: Partial<OnboardingData>) => void;
}

let seq = 0;
/** Id sequencial simples para itens criados em memória. */
export function uid(prefix: string) {
  seq += 1;
  return `${prefix}_${seq}`;
}

/** Estado inicial do wizard — pré-populado com exemplos do segmento de calhas. */
export const DEFAULT_ONBOARDING: OnboardingData = {
  companyName: "",
  logoPreview: null,
  brandColor: "#00E676",
  segment: "",
  address: "",
  phone: "",
  website: "",
  whatsappStatus: "waiting",
  quoteMode: "both",
  quoteTypeName: "Instalação de calhas",
  quoteTypeDescription: "Orçamento completo de instalação de calhas com cálculo por metro linear.",
  criteria: [
    {
      id: uid("cr"),
      label: "Metros lineares de calha",
      fieldType: "number",
      required: true,
      calculationRule: "metros × preço do metro",
    },
    {
      id: uid("cr"),
      label: "Tipo de calha",
      fieldType: "select",
      required: true,
      calculationRule: "lisa: R$ 45/m | ondulada: R$ 52/m | premium: R$ 78/m",
    },
  ],
  pdfStyle: "moderno",
  pdfPrimaryColor: "#00A85A",
  pdfAccentColor: "#00E676",
  pdfTerms:
    "Orçamento válido por 15 dias. Garantia de 12 meses para serviços de instalação. Valores sujeitos a alteração após visita técnica.",
  pdfPayment: "PIX, cartão em até 3x sem juros ou boleto. 50% na aprovação e 50% na conclusão do serviço.",
  pdfSections: { header: true, signature: true, footer: true, qrCode: true },
  stages: [
    { id: uid("st"), name: "Novo lead" },
    { id: uid("st"), name: "Em qualificação" },
    { id: uid("st"), name: "Orçamento enviado" },
    { id: uid("st"), name: "Em negociação" },
    { id: uid("st"), name: "Fechado" },
    { id: uid("st"), name: "Perdido" },
    { id: uid("st"), name: "Manutenção futura" },
  ],
  maintenanceInterval: "6",
  followUpTemplate:
    "Oi, {{customer_name}}! Tudo bem? Aqui é da {{company_name}}. Vi que você recebeu nosso orçamento de {{service_name}}. Ficou alguma dúvida? Estou à disposição para ajustar o que precisar. 😊",
  autoMessages: true,
  optOutEnabled: true,
};
