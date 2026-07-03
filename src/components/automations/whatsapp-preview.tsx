"use client";

/**
 * Utilitários de prévia de mensagens de WhatsApp usados pelos módulos
 * de automações e templates: substituição de variáveis por dados de
 * exemplo e bolha visual no estilo WhatsApp.
 */

import React from "react";
import { CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Dados de exemplo usados na prévia (cliente fictício João Silva). */
export const SAMPLE_TEMPLATE_VARS: Record<string, string> = {
  customer_name: "João Silva",
  company_name: "Calhas ProTech",
  service_name: "instalação de calhas",
  last_service_date: "14/05/2026",
  maintenance_due_date: "14/11/2026",
  quote_link: "kybergo.app/o/ORC-2026-0148",
  seller_name: "Carlos Mendes",
};

/** Variáveis disponíveis para inserção nos templates. */
export const TEMPLATE_VARIABLES = Object.keys(SAMPLE_TEMPLATE_VARS);

/** Substitui {{variavel}} pelos dados de exemplo; mantém desconhecidas intactas. */
export function renderTemplatePreview(content: string) {
  return content.replace(/\{\{(\w+)\}\}/g, (raw, name: string) => SAMPLE_TEMPLATE_VARS[name] ?? raw);
}

/** Extrai as variáveis {{...}} presentes no conteúdo, sem duplicatas. */
export function extractVariables(content: string): string[] {
  const found = new Set<string>();
  for (const match of content.matchAll(/\{\{(\w+)\}\}/g)) found.add(match[1]);
  return [...found];
}

/** Bolha de mensagem enviada, no estilo WhatsApp (fundo verde-escuro, canto de bolha). */
export function WhatsAppBubble({
  text,
  time = "09:41",
  className,
}: {
  text: string;
  time?: string;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-border bg-black/40 p-3", className)}>
      <div className="flex justify-end">
        <div className="max-w-[92%] rounded-2xl rounded-br-sm bg-kyber-deep/90 px-3.5 py-2.5 text-[13px] leading-relaxed text-white shadow">
          <span className="whitespace-pre-wrap break-words">{text}</span>
          <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
            {time}
            <CheckCheck className="h-3 w-3 text-sky-300" />
          </span>
        </div>
      </div>
    </div>
  );
}
