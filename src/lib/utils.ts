import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Combina classes Tailwind com resolução de conflitos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formata um valor numérico como moeda BRL. */
export function formatCurrency(value: number, locale = "pt-BR", currency = "BRL") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(value);
}

/** Formata data curta (ex.: 12 jan 2026). */
export function formatDate(date: string | Date, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(
    typeof date === "string" ? new Date(date) : date
  );
}

/** Formata data e hora (ex.: 12/01/2026 14:30). */
export function formatDateTime(date: string | Date, locale = "pt-BR") {
  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}

/** Formata número compacto (ex.: 1,2 mil). */
export function formatCompact(value: number, locale = "pt-BR") {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

/** Gera iniciais a partir de um nome. */
export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Delay auxiliar para simulações de carregamento. */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
