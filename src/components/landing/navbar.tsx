"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_FLAGS, LOCALE_LABELS } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dropdown, DropdownItem } from "@/components/ui/misc";
import { KyberLogo } from "@/components/layout/sidebar";

const LINKS = [
  { href: "#funcionalidades", labelKey: "nav.features" },
  { href: "#demo", labelKey: "nav.watchDemo" },
  { href: "#planos", labelKey: "nav.pricing" },
  { href: "#faq", labelKey: "nav.faq" },
];

export function LandingNavbar() {
  const { t, locale, setLocale } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-border bg-kyber-black/80 backdrop-blur-xl" : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 lg:px-8">
        <KyberLogo />

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3.5 py-2 text-sm text-kyber-gray transition-colors hover:text-kyber-white"
            >
              {t(link.labelKey)}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <button aria-label={t("common.language")} className="focus-ring hidden rounded-xl p-2.5 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft sm:block">
                <Globe className="h-[18px] w-[18px]" />
              </button>
            }
          >
            {LOCALES.map((loc) => (
              <DropdownItem key={loc} onClick={() => setLocale(loc)}>
                <span>{LOCALE_FLAGS[loc]}</span>
                {LOCALE_LABELS[loc]}
                {locale === loc && <Check className="ml-auto h-4 w-4 text-kyber-green" />}
              </DropdownItem>
            ))}
          </Dropdown>

          <Link href="/login" className="hidden sm:block">
            <Button variant="ghost" size="md">
              {t("nav.login")}
            </Button>
          </Link>
          <Link href="/cadastro">
            <Button variant="primary" size="md">
              {t("nav.startNow")}
            </Button>
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            className="focus-ring rounded-lg p-2 text-kyber-gray hover:text-kyber-soft lg:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border bg-kyber-black/95 backdrop-blur-xl lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-kyber-soft hover:bg-white/5"
                >
                  {t(link.labelKey)}
                </a>
              ))}
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block rounded-xl px-4 py-3 text-sm text-kyber-soft hover:bg-white/5">
                {t("nav.login")}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
