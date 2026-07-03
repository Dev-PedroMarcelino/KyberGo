"use client";

/**
 * Tabela editável de itens do orçamento — usada pelos geradores
 * inteligente e simples. Edita descrição, quantidade, unidade e valor
 * unitário, com adicionar/remover linha e totais recalculados ao vivo.
 */

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn, formatCurrency } from "@/lib/utils";
import type { QuoteItem } from "@/lib/types";

let itemSeq = 0;

/** Cria um item vazio com id único (estado local). */
export function newQuoteItem(description: string, quantity = 1, unit = "un", unitPrice = 0): QuoteItem {
  itemSeq += 1;
  return {
    id: `qi_${Date.now()}_${itemSeq}`,
    description,
    quantity,
    unit,
    unitPrice,
    total: Math.round(quantity * unitPrice * 100) / 100,
  };
}

const cellInput =
  "focus-ring h-9 w-full rounded-lg border border-transparent bg-transparent px-2 text-sm text-kyber-soft transition-colors hover:border-white/15 focus:border-kyber-green/50 focus:bg-white/[0.04]";

export function QuoteItemsEditor({
  items,
  onChange,
  className,
}: {
  items: QuoteItem[];
  onChange: (items: QuoteItem[]) => void;
  className?: string;
}) {
  const { t } = useI18n();

  const update = (id: string, patch: Partial<QuoteItem>) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const next = { ...item, ...patch };
        next.total = Math.round(next.quantity * next.unitPrice * 100) / 100;
        return next;
      })
    );
  };

  const remove = (id: string) => onChange(items.filter((item) => item.id !== id));
  const add = () => onChange([...items, newQuoteItem(t("quotes.newItemDescription"))]);

  return (
    <div className={className}>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-border bg-white/[0.03] text-left text-xs uppercase tracking-wide text-kyber-dim">
              <th className="px-3 py-2.5 font-medium">{t("quotes.itemDescription")}</th>
              <th className="w-20 px-2 py-2.5 font-medium">{t("quotes.itemQty")}</th>
              <th className="w-16 px-2 py-2.5 font-medium">{t("quotes.itemUnit")}</th>
              <th className="w-28 px-2 py-2.5 font-medium">{t("quotes.itemUnitPrice")}</th>
              <th className="w-28 px-3 py-2.5 text-right font-medium">{t("quotes.itemTotal")}</th>
              <th className="w-10 px-1 py-2.5" />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.tr
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-1.5 py-1">
                    <input
                      value={item.description}
                      onChange={(e) => update(item.id, { description: e.target.value })}
                      className={cellInput}
                      aria-label={t("quotes.itemDescription")}
                    />
                  </td>
                  <td className="px-0.5 py-1">
                    <input
                      type="number"
                      min={0}
                      step="any"
                      value={item.quantity}
                      onChange={(e) => update(item.id, { quantity: Number(e.target.value) || 0 })}
                      className={cn(cellInput, "text-right")}
                      aria-label={t("quotes.itemQty")}
                    />
                  </td>
                  <td className="px-0.5 py-1">
                    <input
                      value={item.unit}
                      onChange={(e) => update(item.id, { unit: e.target.value })}
                      className={cn(cellInput, "text-center")}
                      aria-label={t("quotes.itemUnit")}
                    />
                  </td>
                  <td className="px-0.5 py-1">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => update(item.id, { unitPrice: Number(e.target.value) || 0 })}
                      className={cn(cellInput, "text-right")}
                      aria-label={t("quotes.itemUnitPrice")}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-1 text-right font-medium text-kyber-white">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="px-1 py-1">
                    <button
                      onClick={() => remove(item.id)}
                      aria-label={t("quotes.itemRemove")}
                      className="focus-ring rounded-lg p-1.5 text-kyber-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <Button variant="ghost" size="sm" onClick={add} className="mt-2">
        <Plus className="h-3.5 w-3.5" />
        {t("quotes.addItem")}
      </Button>
    </div>
  );
}
