"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Building2,
  Check,
  ChevronDown,
  CreditCard,
  Globe,
  LogOut,
  Menu,
  Moon,
  Search,
  Settings,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LOCALES, LOCALE_FLAGS, LOCALE_LABELS } from "@/lib/i18n/locales";
import { cn, formatDateTime } from "@/lib/utils";
import { MOCK_COMPANY, MOCK_CURRENT_USER, MOCK_NOTIFICATIONS } from "@/lib/mock/data";
import { Avatar, Dropdown, DropdownItem, Tooltip } from "@/components/ui/misc";
import { Badge } from "@/components/ui/badge";

export function Topbar({ onOpenMenu, onOpenPalette }: { onOpenMenu: () => void; onOpenPalette: () => void }) {
  const { t, locale, setLocale } = useI18n();
  const [dark, setDark] = useState(true);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const unread = notifications.filter((n) => !n.read).length;

  const toggleTheme = () => {
    setDark((d) => {
      document.documentElement.classList.toggle("light", d);
      return !d;
    });
  };

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-border bg-kyber-black/70 px-4 backdrop-blur-xl lg:px-6">
      <button
        onClick={onOpenMenu}
        aria-label={t("nav.openMenu")}
        className="focus-ring rounded-lg p-2 text-kyber-gray hover:bg-white/5 hover:text-kyber-soft lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Seletor de empresa */}
      <Dropdown
        align="left"
        trigger={
          <button className="focus-ring hidden items-center gap-2 rounded-xl border border-border bg-white/[0.03] px-3 py-2 text-sm text-kyber-soft transition-colors hover:border-kyber-green/30 sm:flex">
            <Building2 className="h-4 w-4 text-kyber-green" />
            <span className="max-w-[140px] truncate font-medium">{MOCK_COMPANY.name}</span>
            <ChevronDown className="h-3.5 w-3.5 text-kyber-dim" />
          </button>
        }
      >
        <DropdownItem>
          <Check className="h-4 w-4 text-kyber-green" />
          {MOCK_COMPANY.name}
        </DropdownItem>
        <DropdownItem className="text-kyber-dim">+ Adicionar empresa</DropdownItem>
      </Dropdown>

      {/* Busca / paleta de comandos */}
      <button
        onClick={onOpenPalette}
        className="focus-ring group ml-auto flex h-10 w-full max-w-xs items-center gap-2.5 rounded-xl border border-border bg-white/[0.03] px-3.5 text-sm text-kyber-dim transition-colors hover:border-kyber-green/30 sm:ml-4"
      >
        <Search className="h-4 w-4" />
        <span className="hidden truncate sm:inline">{t("common.search")}</span>
        <kbd className="ml-auto hidden rounded-md border border-border bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-kyber-gray md:inline">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-1.5 sm:ml-auto">
        {/* Idioma */}
        <Dropdown
          trigger={
            <button aria-label={t("common.language")} className="focus-ring rounded-xl p-2.5 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft">
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

        {/* Tema */}
        <Tooltip content={dark ? t("common.lightMode") : t("common.darkMode")}>
          <button onClick={toggleTheme} aria-label={t("common.theme")} className="focus-ring rounded-xl p-2.5 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={dark ? "moon" : "sun"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="block"
              >
                {dark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </Tooltip>

        {/* Notificações */}
        <Dropdown
          className="w-[340px] max-w-[90vw]"
          trigger={
            <button aria-label={t("common.notifications")} className="focus-ring relative rounded-xl p-2.5 text-kyber-gray transition-colors hover:bg-white/5 hover:text-kyber-soft">
              <Bell className="h-[18px] w-[18px]" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-kyber-green text-[9px] font-bold text-kyber-black shadow-glow-sm">
                  {unread}
                </span>
              )}
            </button>
          }
        >
          <div className="flex items-center justify-between px-3 py-2">
            <p className="text-sm font-semibold text-kyber-white">{t("common.notifications")}</p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              }}
              className="text-xs text-kyber-green hover:underline"
            >
              Marcar todas como lidas
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5",
                  !item.read && "bg-kyber-green/5"
                )}
              >
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", item.read ? "bg-white/15" : "bg-kyber-green")} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-kyber-soft">{item.title}</p>
                  <p className="mt-0.5 text-xs text-kyber-gray">{item.description}</p>
                  <p className="mt-1 text-[10px] text-kyber-dim">{formatDateTime(item.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </Dropdown>

        {/* Perfil */}
        <Dropdown
          trigger={
            <button className="focus-ring ml-1 flex items-center gap-2 rounded-xl p-1 transition-colors hover:bg-white/5">
              <Avatar name={MOCK_CURRENT_USER.name} />
            </button>
          }
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="text-sm font-medium text-kyber-white">{MOCK_CURRENT_USER.name}</p>
            <p className="text-xs text-kyber-gray">{MOCK_CURRENT_USER.email}</p>
            <Badge tone="green" className="mt-1.5">Proprietário</Badge>
          </div>
          <DropdownItem>
            <UserIcon className="h-4 w-4" /> {t("common.profile")}
          </DropdownItem>
          <Link href="/app/assinatura">
            <DropdownItem>
              <CreditCard className="h-4 w-4" /> {t("nav.billing")}
            </DropdownItem>
          </Link>
          <Link href="/app/configuracoes">
            <DropdownItem>
              <Settings className="h-4 w-4" /> {t("common.settings")}
            </DropdownItem>
          </Link>
          <Link href="/login">
            <DropdownItem className="text-red-400">
              <LogOut className="h-4 w-4" /> {t("common.logout")}
            </DropdownItem>
          </Link>
        </Dropdown>
      </div>
    </header>
  );
}
