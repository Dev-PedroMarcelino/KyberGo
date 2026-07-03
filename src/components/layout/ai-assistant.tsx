"use client";

/** Botão flutuante do Assistente Kyber com mini-chat. */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AiAssistant() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ from: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((prev) => [...prev, { from: "user", text }]);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          from: "ai",
          text: "Em modo demonstração eu respondo de forma limitada — mas na versão conectada posso criar orçamentos, buscar clientes e agendar follow-ups para você. ✨",
        },
      ]);
    }, 900);
  };

  return (
    <>
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        aria-label={t("common.aiAssistant")}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-green text-kyber-black shadow-glow animate-pulse-glow"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? "close" : "bot"}
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed bottom-24 right-5 z-[60] flex h-[420px] w-[340px] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-border bg-kyber-rich shadow-card"
          >
            <div className="flex items-center gap-2.5 border-b border-border bg-gradient-green px-4 py-3">
              <Bot className="h-5 w-5 text-kyber-black" />
              <p className="text-sm font-semibold text-kyber-black">{t("common.aiAssistant")}</p>
            </div>
            <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5 text-[13px] leading-relaxed text-kyber-soft">
                {t("common.aiAssistantGreeting")}
              </div>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={msg.from === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      msg.from === "user"
                        ? "max-w-[85%] rounded-2xl rounded-br-sm bg-kyber-deep px-3.5 py-2.5 text-[13px] text-white"
                        : "max-w-[85%] rounded-2xl rounded-bl-sm bg-white/8 px-3.5 py-2.5 text-[13px] leading-relaxed text-kyber-soft"
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Pergunte algo..."
                className="focus-ring h-10 flex-1 rounded-xl border border-border bg-white/[0.04] px-3.5 text-sm text-kyber-soft placeholder:text-kyber-dim"
              />
              <button
                onClick={send}
                aria-label={t("common.send")}
                className="focus-ring flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-green text-kyber-black transition-transform hover:scale-105 active:scale-95"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
