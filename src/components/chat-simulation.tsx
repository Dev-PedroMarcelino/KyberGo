"use client";

/**
 * Simulação animada de conversa de WhatsApp.
 * Usada na landing page, na demo interativa e na tela de integração.
 * As mensagens aparecem em sequência, com indicador de digitação.
 */

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CheckCheck, FileText, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessage {
  from: "customer" | "ai";
  text: string;
  kind?: "text" | "audio" | "pdf";
  pdfLabel?: string;
}

export function ChatSimulation({
  messages,
  header = "Calhas ProTech",
  speed = 1400,
  loop = true,
  className,
}: {
  messages: ChatMessage[];
  header?: string;
  speed?: number;
  loop?: boolean;
  className?: string;
}) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVisibleCount(0);
  }, [messages]);

  // Mantém a última mensagem/indicador de digitação sempre visível, rolando
  // apenas a área interna — o card em volta permanece estático na tela.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [visibleCount, typing]);

  useEffect(() => {
    if (visibleCount >= messages.length) {
      if (!loop) return;
      const restart = setTimeout(() => setVisibleCount(0), 5000);
      return () => clearTimeout(restart);
    }
    setTyping(true);
    const timer = setTimeout(() => {
      setTyping(false);
      setVisibleCount((c) => c + 1);
    }, speed);
    return () => clearTimeout(timer);
  }, [visibleCount, messages.length, speed, loop]);

  const visible = messages.slice(0, visibleCount);
  const nextFrom = messages[visibleCount]?.from;

  return (
    <div className={cn("glass-card overflow-hidden !p-0", className)}>
      {/* Cabeçalho estilo WhatsApp */}
      <div className="flex items-center gap-3 border-b border-border bg-white/[0.04] px-4 py-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-green text-xs font-bold text-kyber-black">
          {header.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <p className="text-sm font-semibold text-kyber-white">{header}</p>
          <p className="flex items-center gap-1 text-[11px] text-kyber-green">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-kyber-green" />
            online — IA respondendo
          </p>
        </div>
      </div>

      {/* Mensagens — a área rola internamente (como a tela do WhatsApp),
          enquanto a altura do card permanece fixa e estática na tela. */}
      <div ref={scrollRef} className="h-[360px] overflow-y-auto scroll-smooth">
        <div className="flex min-h-full flex-col justify-end gap-2.5 p-4">
          <AnimatePresence initial={false}>
            {visible.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className={cn("flex shrink-0", msg.from === "ai" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow",
                    msg.from === "ai"
                      ? "rounded-br-sm bg-kyber-deep/90 text-white"
                      : "rounded-bl-sm bg-white/10 text-kyber-soft"
                  )}
                >
                  {msg.kind === "audio" ? (
                    <span className="flex items-center gap-2">
                      <Mic className="h-4 w-4 shrink-0" />
                      <span className="flex items-center gap-0.5">
                        {[6, 12, 8, 14, 10, 16, 9, 13, 7, 11].map((h, j) => (
                          <span key={j} className="w-0.5 rounded-full bg-current/70" style={{ height: h }} />
                        ))}
                      </span>
                      <span className="text-[11px] opacity-70">0:12</span>
                    </span>
                  ) : msg.kind === "pdf" ? (
                    <span className="flex flex-col gap-2">
                      <span className="flex items-center gap-2.5 rounded-xl bg-black/25 p-2.5">
                        <FileText className="h-8 w-8 shrink-0 text-kyber-neon" />
                        <span>
                          <span className="block text-xs font-semibold">{msg.pdfLabel ?? "Proposta.pdf"}</span>
                          <span className="block text-[11px] opacity-70">PDF — 2 páginas</span>
                        </span>
                      </span>
                      {msg.text}
                    </span>
                  ) : (
                    msg.text
                  )}
                  <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                    {msg.from === "ai" ? <CheckCheck className="h-3 w-3 text-sky-300" /> : <Check className="h-3 w-3" />}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Indicador de digitação */}
          {typing && visibleCount < messages.length && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn("flex shrink-0", nextFrom === "ai" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "flex items-center gap-1 rounded-2xl px-4 py-3",
                  nextFrom === "ai" ? "bg-kyber-deep/90" : "bg-white/10"
                )}
              >
                {[0, 1, 2].map((d) => (
                  <motion.span
                    key={d}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: d * 0.2 }}
                    className="h-1.5 w-1.5 rounded-full bg-white/70"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Roteiro padrão: cliente pede orçamento e a IA gera a proposta. */
export const DEFAULT_CHAT_SCRIPT: ChatMessage[] = [
  { from: "customer", text: "Oi! Queria um orçamento pra colocar calha na minha casa" },
  {
    from: "ai",
    text: "Olá! 😊 Sou o assistente da Calhas ProTech. Me conta: quantos metros de calha você precisa, aproximadamente?",
  },
  { from: "customer", text: "", kind: "audio" },
  {
    from: "ai",
    text: "Perfeito! Anotei: 22m de calha ondulada, sobrado acima de 6m. Qual o endereço? Assim calculo o deslocamento. 🚐",
  },
  { from: "customer", text: "Rua Girassol, 55, Vila Madalena" },
  {
    from: "ai",
    kind: "pdf",
    pdfLabel: "Orcamento-ORC-2026-0148.pdf",
    text: "Prontinho! 🎉 Seu orçamento ficou em R$ 2.000,00. Proposta completa em PDF. Qualquer dúvida, é só chamar!",
  },
];
