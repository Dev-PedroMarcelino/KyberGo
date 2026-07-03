export const LOCALES = ["pt-BR", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt-BR";

export const LOCALE_LABELS: Record<Locale, string> = {
  "pt-BR": "Português (BR)",
  en: "English",
  es: "Español",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  "pt-BR": "🇧🇷",
  en: "🇺🇸",
  es: "🇪🇸",
};

/** Um namespace de tradução: mapa de chaves → texto, por idioma. */
export type Namespace = Partial<Record<Locale, Record<string, string>>> & {
  "pt-BR": Record<string, string>;
};
