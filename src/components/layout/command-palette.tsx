"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  CalendarDays,
  ChartNoAxesCombined,
  CreditCard,
  FileText,
  Kanban,
  LayoutDashboard,
  MessagesSquare,
  PencilRuler,
  Search,
  Settings,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Command {
  labelKey: string;
  href: string;
  icon: React.ReactNode;
  keywords: string;
}

const COMMANDS: Command[] = [
  { labelKey: "nav.overview", href: "/app", icon: <LayoutDashboard className="h-4 w-4" />, keywords: "dashboard visao geral inicio home" },
  { labelKey: "nav.newQuoteAi", href: "/app/orcamentos/inteligente", icon: <Sparkles className="h-4 w-4" />, keywords: "novo orcamento ia inteligente criar quote" },
  { labelKey: "nav.newQuoteSimple", href: "/app/orcamentos/simples", icon: <PencilRuler className="h-4 w-4" />, keywords: "documento simples descricao livre pdf" },
  { labelKey: "nav.quotes", href: "/app/orcamentos", icon: <FileText className="h-4 w-4" />, keywords: "orcamentos propostas lista" },
  { labelKey: "nav.crm", href: "/app/crm", icon: <Kanban className="h-4 w-4" />, keywords: "crm kanban pipeline funil negocios" },
  { labelKey: "nav.customers", href: "/app/clientes", icon: <UsersRound className="h-4 w-4" />, keywords: "clientes leads contatos" },
  { labelKey: "nav.automations", href: "/app/automacoes", icon: <Zap className="h-4 w-4" />, keywords: "automacoes follow-up manutencao regras" },
  { labelKey: "nav.calendar", href: "/app/automacoes/calendario", icon: <CalendarDays className="h-4 w-4" />, keywords: "calendario mensagens agendadas" },
  { labelKey: "nav.whatsapp", href: "/app/whatsapp", icon: <MessagesSquare className="h-4 w-4" />, keywords: "whatsapp conexao qr code instancia" },
  { labelKey: "nav.reports", href: "/app/relatorios", icon: <ChartNoAxesCombined className="h-4 w-4" />, keywords: "relatorios analytics metricas receita" },
  { labelKey: "nav.billing", href: "/app/assinatura", icon: <CreditCard className="h-4 w-4" />, keywords: "assinatura plano pagamento upgrade" },
  { labelKey: "nav.settings", href: "/app/configuracoes", icon: <Settings className="h-4 w-4" />, keywords: "configuracoes empresa preferencias" },
];

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => t(c.labelKey).toLowerCase().includes(q) || c.keywords.includes(q)
    );
  }, [query, t]);

  useEffect(() => {
    setSelected(0);
  }, [query, open]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const run = (cmd: Command) => {
    onClose();
    router.push(cmd.href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter" && filtered[selected]) {
      run(filtered[selected]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-kyber-rich shadow-card"
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-4 w-4 text-kyber-dim" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("common.commandPalettePlaceholder")}
                className="h-13 w-full bg-transparent py-4 text-sm text-kyber-soft placeholder:text-kyber-dim focus:outline-none"
              />
              <kbd className="rounded-md border border-border bg-white/5 px-1.5 py-0.5 text-[10px] text-kyber-gray">esc</kbd>
            </div>
            <div className="max-h-[320px] overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-kyber-dim">{t("common.commandPaletteEmpty")}</p>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.href}
                    onClick={() => run(cmd)}
                    onMouseEnter={() => setSelected(i)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                      i === selected ? "bg-kyber-green/10 text-kyber-green" : "text-kyber-soft"
                    )}
                  >
                    {cmd.icon}
                    {t(cmd.labelKey)}
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
