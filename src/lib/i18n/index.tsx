"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, LOCALES, type Locale, type Namespace } from "./locales";
import { common } from "./dictionaries/common";
import { nav } from "./dictionaries/nav";
import { landing } from "./dictionaries/landing";
import { auth } from "./dictionaries/auth";
import { onboarding } from "./dictionaries/onboarding";
import { dashboard } from "./dictionaries/dashboard";
import { quotes } from "./dictionaries/quotes";
import { pdf } from "./dictionaries/pdf";
import { customers } from "./dictionaries/customers";
import { crm } from "./dictionaries/crm";
import { automations } from "./dictionaries/automations";
import { whatsapp } from "./dictionaries/whatsapp";
import { billing } from "./dictionaries/billing";
import { team } from "./dictionaries/team";
import { settings } from "./dictionaries/settings";
import { help } from "./dictionaries/help";
import { admin } from "./dictionaries/admin";
import { reports } from "./dictionaries/reports";
import { states } from "./dictionaries/states";

/** Registro central de namespaces. Cada área de produto possui o seu. */
const NAMESPACES: Record<string, Namespace> = {
  common,
  nav,
  landing,
  auth,
  onboarding,
  dashboard,
  quotes,
  pdf,
  customers,
  crm,
  automations,
  whatsapp,
  billing,
  team,
  settings,
  help,
  admin,
  reports,
  states,
};

const STORAGE_KEY = "kybergo.locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  /**
   * Busca uma tradução por chave "namespace.chave".
   * Faz fallback para pt-BR quando a chave não existe no idioma ativo.
   * Suporta interpolação: t("crm.dealValue", { value: "R$ 100" }) → "Valor: {{value}}".
   */
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function resolve(locale: Locale, key: string): string | undefined {
  const dotIndex = key.indexOf(".");
  if (dotIndex === -1) return undefined;
  const ns = key.slice(0, dotIndex);
  const k = key.slice(dotIndex + 1);
  const namespace = NAMESPACES[ns];
  if (!namespace) return undefined;
  return namespace[locale]?.[k] ?? namespace["pt-BR"]?.[k];
}

function interpolate(text: string, vars?: Record<string, string | number>) {
  if (!vars) return text;
  return text.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] !== undefined ? String(vars[name]) : `{{${name}}}`
  );
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && (LOCALES as readonly string[]).includes(stored)) {
      setLocaleState(stored as Locale);
    }
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const text = resolve(locale, key);
      if (text === undefined) {
        if (process.env.NODE_ENV !== "production") {
          console.warn(`[i18n] Chave ausente: ${key}`);
        }
        return key;
      }
      return interpolate(text, vars);
    },
    [locale]
  );

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n deve ser usado dentro de <I18nProvider>");
  return ctx;
}
