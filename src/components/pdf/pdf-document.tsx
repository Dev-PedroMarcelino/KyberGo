"use client";

/**
 * Folha A4 que reproduz fielmente a proposta em PDF gerada pelo KyberGo.
 * O documento é sempre claro (fundo branco fixo), independente do tema do app —
 * ele representa o arquivo real que o cliente recebe no WhatsApp.
 */

import React from "react";
import type { Company, Customer, PdfTemplate, Quote } from "@/lib/types";
import { cn, formatCurrency, formatDate, initials } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

export interface PdfDocumentProps {
  template: PdfTemplate;
  quote: Quote;
  customer: Customer;
  company: Company;
  className?: string;
}

/** Converte HEX (#RRGGBB) em rgba() para tintas translúcidas do documento. */
function hexToRgba(hex: string, alpha: number) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return `rgba(0, 168, 90, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Cores muito escuras (ex.: estilo executivo) pedem texto claro por cima. */
function isDarkColor(hex: string) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num) || full.length !== 6) return false;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

const QR_SIZE = 11;

/** Padrão determinístico que imita um QR code (placeholder visual). */
function qrCellFilled(row: number, col: number) {
  // Três "olhos" de localização nos cantos, como num QR real.
  const finder = (r: number, c: number) => r >= 0 && r < 3 && c >= 0 && c < 3;
  if (finder(row, col) || finder(row, QR_SIZE - 1 - col) || finder(QR_SIZE - 1 - row, col)) {
    return true;
  }
  return ((row * 31 + col * 17 + row * col * 7) % 9) < 4;
}

function QrPlaceholder({ color }: { color: string }) {
  return (
    <div
      className="grid shrink-0 gap-[1px] rounded-[3px] border border-neutral-200 bg-white p-1"
      style={{ gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`, width: 52, height: 52 }}
      aria-hidden
    >
      {Array.from({ length: QR_SIZE * QR_SIZE }).map((_, i) => {
        const row = Math.floor(i / QR_SIZE);
        const col = i % QR_SIZE;
        return (
          <span
            key={i}
            className="block h-full w-full rounded-[0.5px]"
            style={{ backgroundColor: qrCellFilled(row, col) ? color : "transparent" }}
          />
        );
      })}
    </div>
  );
}

/** Logo enviado pelo usuário ou monograma com as iniciais da empresa. */
function CompanyMark({
  company,
  logoUrl,
  primary,
  accent,
  size = "md",
  onDark = false,
}: {
  company: Company;
  logoUrl: string | null;
  primary: string;
  accent: string;
  size?: "sm" | "md";
  onDark?: boolean;
}) {
  const box = size === "sm" ? "h-8 w-8 rounded-md" : "h-10 w-10 rounded-lg";
  if (logoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={logoUrl}
        alt={company.name}
        className={cn(box, "shrink-0 border border-neutral-200 bg-white object-contain p-0.5")}
      />
    );
  }
  return (
    <span
      className={cn(box, "flex shrink-0 items-center justify-center font-bold text-white transition-colors duration-300", size === "sm" ? "text-[10px]" : "text-xs")}
      style={{
        background: onDark
          ? accent
          : `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
        color: onDark && !isDarkColor(accent) ? "#0B0F0C" : "#FFFFFF",
      }}
    >
      {initials(company.name)}
    </span>
  );
}

export function PdfDocument({ template, quote, customer, company, className }: PdfDocumentProps) {
  const { t } = useI18n();
  const { primary, accent, text } = template.colors;
  const { sections, style } = template;
  const fontClass = template.font === "Space Grotesk" ? "font-display" : "font-sans";
  const darkHeader = isDarkColor(primary);

  const metaRow = (
    <div className="grid grid-cols-3 gap-3 rounded-md border border-neutral-200 bg-neutral-50/80 px-3 py-2">
      {[
        { label: t("pdf.docQuoteNumber"), value: quote.number },
        { label: t("pdf.docIssueDate"), value: formatDate(quote.createdAt) },
        { label: t("pdf.docValidUntil"), value: formatDate(quote.validUntil) },
      ].map((cell) => (
        <div key={cell.label} className="min-w-0">
          <p className="text-[7px] font-semibold uppercase tracking-[0.12em] text-neutral-400">{cell.label}</p>
          <p className="mt-0.5 truncate text-[10px] font-semibold" style={{ color: text }}>
            {cell.value}
          </p>
        </div>
      ))}
    </div>
  );

  const header = sections.header ? (
    <>
      {style === "moderno" && (
        <div className="relative flex items-start justify-between gap-4 px-8 pb-5 pl-10 pt-8">
          <div className="flex items-center gap-3">
            <CompanyMark company={company} logoUrl={template.logoUrl} primary={primary} accent={accent} />
            <div>
              <p className="text-sm font-bold leading-tight transition-colors duration-300" style={{ color: primary }}>
                {company.name}
              </p>
              <p className="text-[9px] text-neutral-500">{company.segment}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[8px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
              {t("pdf.docProposalLabel")}
            </p>
            <p className="text-sm font-bold transition-colors duration-300" style={{ color: primary }}>
              {quote.number}
            </p>
          </div>
        </div>
      )}

      {style === "classico" && (
        <div className="px-8 pb-4 pt-8 text-center">
          <div className="mb-2 flex justify-center">
            <CompanyMark company={company} logoUrl={template.logoUrl} primary={primary} accent={accent} />
          </div>
          <p className="text-base font-bold tracking-wide transition-colors duration-300" style={{ color: text }}>
            {company.name}
          </p>
          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">{company.segment}</p>
          <div
            className="mx-auto mt-3 w-full transition-colors duration-300"
            style={{ borderBottom: `4px double ${primary}` }}
          />
          <p className="mt-2 text-[9px] font-semibold uppercase tracking-[0.25em] text-neutral-400">
            {t("pdf.docProposalLabel")} · {quote.number}
          </p>
        </div>
      )}

      {style === "minimalista" && (
        <div className="px-8 pb-4 pt-9">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] transition-colors duration-300" style={{ color: text }}>
              {company.name}
            </p>
            <p className="text-[9px] uppercase tracking-[0.18em] text-neutral-400">
              {t("pdf.docProposalLabel")} {quote.number}
            </p>
          </div>
          <div className="mt-3 h-px w-full bg-neutral-200" />
        </div>
      )}

      {style === "executivo" && (
        <div className="px-8 py-7 transition-colors duration-300" style={{ backgroundColor: primary }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CompanyMark company={company} logoUrl={template.logoUrl} primary={primary} accent={accent} onDark />
              <div>
                <p className="text-sm font-bold leading-tight" style={{ color: darkHeader ? "#FFFFFF" : "#0B0F0C" }}>
                  {company.name}
                </p>
                <p className="text-[9px]" style={{ color: darkHeader ? "rgba(255,255,255,0.65)" : "rgba(11,15,12,0.65)" }}>
                  {company.segment}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p
                className="text-[8px] font-semibold uppercase tracking-[0.25em]"
                style={{ color: darkHeader ? "rgba(255,255,255,0.6)" : "rgba(11,15,12,0.6)" }}
              >
                {t("pdf.docProposalLabel")}
              </p>
              <p className="text-sm font-bold" style={{ color: darkHeader ? "#FFFFFF" : "#0B0F0C" }}>
                {quote.number}
              </p>
            </div>
          </div>
          <div className="mt-4 h-0.5 w-16 transition-colors duration-300" style={{ backgroundColor: accent }} />
        </div>
      )}
    </>
  ) : (
    <div className="pt-8" />
  );

  return (
    <div
      className={cn(
        "relative flex aspect-[1/1.414] w-full flex-col overflow-hidden rounded-sm bg-white text-left",
        fontClass,
        className
      )}
      style={{ color: text }}
    >
      {/* Barra lateral do estilo moderno */}
      {style === "moderno" && sections.header && (
        <div
          className="absolute inset-y-0 left-0 z-10 w-2 transition-colors duration-300"
          style={{ background: `linear-gradient(180deg, ${primary} 0%, ${accent} 100%)` }}
        />
      )}

      {/* Marca d'água diagonal */}
      {sections.watermark && (
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center overflow-hidden">
          <span
            className="-rotate-[32deg] select-none whitespace-nowrap text-[64px] font-black uppercase tracking-[0.3em] transition-colors duration-300"
            style={{ color: hexToRgba(isDarkColor(primary) ? accent : primary, 0.07) }}
          >
            {t("pdf.docWatermark")}
          </span>
        </div>
      )}

      <div className="relative z-10">{header}</div>

      <div className={cn("relative z-10 flex flex-1 flex-col gap-4 px-8 pb-5 pt-3", style === "moderno" && sections.header && "pl-10")}>
        {metaRow}

        {/* Dados da empresa e do cliente */}
        {(sections.companyData || sections.clientData) && (
          <div className="grid grid-cols-2 gap-4">
            {sections.clientData && (
              <div className={cn(!sections.companyData && "col-span-2")}>
                <p
                  className="mb-1 text-[7px] font-bold uppercase tracking-[0.18em] transition-colors duration-300"
                  style={{ color: isDarkColor(primary) ? accent : primary }}
                >
                  {t("pdf.docClientData")}
                </p>
                <p className="text-[10px] font-semibold">{customer.name}</p>
                {customer.address && <p className="text-[9px] leading-snug text-neutral-500">{customer.address}</p>}
                <p className="text-[9px] text-neutral-500">{customer.phone}</p>
                {customer.email && <p className="text-[9px] text-neutral-500">{customer.email}</p>}
              </div>
            )}
            {sections.companyData && (
              <div className={cn(!sections.clientData && "col-span-2", sections.clientData && "text-right")}>
                <p
                  className="mb-1 text-[7px] font-bold uppercase tracking-[0.18em] transition-colors duration-300"
                  style={{ color: isDarkColor(primary) ? accent : primary }}
                >
                  {t("pdf.docCompanyData")}
                </p>
                <p className="text-[10px] font-semibold">{company.name}</p>
                <p className="text-[9px] leading-snug text-neutral-500">{company.address}</p>
                <p className="text-[9px] text-neutral-500">{company.phone}</p>
                <p className="text-[9px] text-neutral-500">{company.whatsappNumber}</p>
              </div>
            )}
          </div>
        )}

        {/* Título e descrição da proposta */}
        <div>
          <h2 className="text-sm font-bold leading-snug">{quote.title}</h2>
          <p className="mt-0.5 text-[10px] leading-relaxed text-neutral-500">{quote.description}</p>
        </div>

        {/* Tabela de itens */}
        {sections.itemsTable && (
          <table className="w-full border-collapse text-[9px]">
            <thead>
              <tr
                className="border-b-2 text-left transition-colors duration-300"
                style={{ borderColor: primary, color: isDarkColor(primary) ? text : primary }}
              >
                <th className="py-1.5 pr-2 text-[7px] font-bold uppercase tracking-[0.15em]">{t("pdf.docColItem")}</th>
                <th className="px-2 py-1.5 text-center text-[7px] font-bold uppercase tracking-[0.15em]">{t("pdf.docColQty")}</th>
                <th className="px-2 py-1.5 text-center text-[7px] font-bold uppercase tracking-[0.15em]">{t("pdf.docColUnit")}</th>
                <th className="px-2 py-1.5 text-right text-[7px] font-bold uppercase tracking-[0.15em]">{t("pdf.docColUnitPrice")}</th>
                <th className="py-1.5 pl-2 text-right text-[7px] font-bold uppercase tracking-[0.15em]">{t("pdf.docColTotal")}</th>
              </tr>
            </thead>
            <tbody>
              {quote.items.map((item, i) => (
                <tr
                  key={item.id}
                  className="border-b border-neutral-100"
                  style={{ backgroundColor: i % 2 === 1 ? hexToRgba(primary, 0.035) : "transparent" }}
                >
                  <td className="py-1.5 pr-2 font-medium">{item.description}</td>
                  <td className="px-2 py-1.5 text-center text-neutral-500">{item.quantity}</td>
                  <td className="px-2 py-1.5 text-center text-neutral-500">{item.unit}</td>
                  <td className="px-2 py-1.5 text-right text-neutral-500">{formatCurrency(item.unitPrice)}</td>
                  <td className="py-1.5 pl-2 text-right font-semibold">{formatCurrency(item.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totais */}
        <div className="flex justify-end">
          <div className="w-[46%] min-w-[150px] space-y-1">
            <div className="flex items-center justify-between text-[9px] text-neutral-500">
              <span>{t("pdf.docSubtotal")}</span>
              <span>{formatCurrency(quote.subtotal)}</span>
            </div>
            {quote.discount > 0 && (
              <div className="flex items-center justify-between text-[9px] text-neutral-500">
                <span>{t("pdf.docDiscount")}</span>
                <span>- {formatCurrency(quote.discount)}</span>
              </div>
            )}
            <div
              className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-[11px] font-bold transition-colors duration-300"
              style={{
                backgroundColor: hexToRgba(primary, 0.08),
                color: isDarkColor(primary) ? text : primary,
              }}
            >
              <span>{t("pdf.docTotal")}</span>
              <span>{formatCurrency(quote.total)}</span>
            </div>
          </div>
        </div>

        {/* Condições de pagamento */}
        {sections.paymentTerms && (
          <div
            className="rounded-md border-l-2 bg-neutral-50/80 px-3 py-2 transition-colors duration-300"
            style={{ borderColor: isDarkColor(primary) ? accent : primary }}
          >
            <p
              className="text-[7px] font-bold uppercase tracking-[0.18em] transition-colors duration-300"
              style={{ color: isDarkColor(primary) ? accent : primary }}
            >
              {t("pdf.docPaymentTerms")}
            </p>
            <p className="mt-0.5 text-[9px] leading-relaxed">{quote.paymentTerms}</p>
          </div>
        )}

        {/* Termos e condições */}
        {sections.terms && (
          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.18em] text-neutral-400">{t("pdf.docTerms")}</p>
            <p className="mt-0.5 text-[8px] leading-relaxed text-neutral-400">{template.terms}</p>
          </div>
        )}

        <div className="flex-1" />

        {/* Assinaturas */}
        {sections.signature && (
          <div className="grid grid-cols-2 gap-10 pt-6">
            <div className="text-center">
              <div className="border-t border-neutral-300" />
              <p className="mt-1 text-[9px] font-semibold">{company.name}</p>
              <p className="text-[8px] text-neutral-400">{t("pdf.docSignatureCompany")}</p>
            </div>
            <div className="text-center">
              <div className="border-t border-neutral-300" />
              <p className="mt-1 text-[9px] font-semibold">{customer.name}</p>
              <p className="text-[8px] text-neutral-400">{t("pdf.docSignatureClient")}</p>
            </div>
          </div>
        )}

        {/* QR code de validação */}
        {sections.qrCode && (
          <div className="flex items-center gap-2.5">
            <QrPlaceholder color={text} />
            <div>
              <p className="text-[8px] font-semibold">{t("pdf.docQrTitle")}</p>
              <p className="max-w-[200px] text-[7px] leading-snug text-neutral-400">{t("pdf.docQrCaption")}</p>
            </div>
          </div>
        )}
      </div>

      {/* Rodapé */}
      {sections.footer && (
        <div
          className={cn(
            "relative z-10 border-t border-neutral-200 px-8 py-2.5",
            style === "moderno" && sections.header && "pl-10"
          )}
        >
          <p className="text-center text-[7.5px] leading-snug text-neutral-400">{template.footer}</p>
        </div>
      )}
    </div>
  );
}
