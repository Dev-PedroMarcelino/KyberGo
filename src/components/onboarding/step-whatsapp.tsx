"use client";

/** Etapa 2 — Conexão WhatsApp: explicação, QR fake e simulação de conexão. */

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessagesSquare, TriangleAlert, Zap } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/components/ui/toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_WHATSAPP_INSTANCE } from "@/lib/mock/data";
import { FakeQr } from "./fake-qr";
import type { StepProps } from "./types";

export function StepWhatsapp({ data, update }: StepProps) {
  const { t } = useI18n();
  const { toast } = useToast();
  const [connecting, setConnecting] = useState(false);

  const simulate = () => {
    setConnecting(true);
    update({ whatsappStatus: "connecting" });
    window.setTimeout(() => {
      setConnecting(false);
      update({ whatsappStatus: "connected" });
      toast("success", t("onboarding.waToastConnected"));
    }, 1800);
  };

  const status = data.whatsappStatus;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold tracking-tight text-kyber-white sm:text-2xl">
          {t("onboarding.waTitle")}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-kyber-gray">{t("onboarding.waSubtitle")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
        {/* Como funciona + status */}
        <div className="space-y-5">
          <div className="rounded-xl border border-border bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-kyber-white">
              <MessagesSquare className="h-4 w-4 text-kyber-green" />
              {t("onboarding.waHowTitle")}
            </p>
            <ol className="mt-4 space-y-3">
              {["waHow1", "waHow2", "waHow3"].map((key, i) => (
                <li key={key} className="flex items-start gap-3 text-sm text-kyber-gray">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-kyber-green/10 text-xs font-bold text-kyber-green">
                    {i + 1}
                  </span>
                  {t(`onboarding.${key}`)}
                </li>
              ))}
            </ol>
            <p className="mt-4 flex items-start gap-2 border-t border-border pt-4 text-xs leading-relaxed text-kyber-dim">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-kyber-green" />
              {t("onboarding.waHowNote")}
            </p>
          </div>

          {/* Status da instância */}
          <div className="rounded-xl border border-border bg-white/[0.03] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-medium text-kyber-soft">{t("onboarding.waStatusLabel")}</p>
              {status === "connected" ? (
                <Badge tone="green" dot>{t("onboarding.waStatusConnected")}</Badge>
              ) : status === "connecting" ? (
                <Badge tone="neon" dot>{t("onboarding.waStatusConnecting")}</Badge>
              ) : (
                <Badge tone="yellow" dot>{t("onboarding.waStatusWaiting")}</Badge>
              )}
            </div>

            <AnimatePresence mode="wait">
              {status === "connected" ? (
                <motion.div
                  key="connected"
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className="mt-4 flex items-center gap-3 rounded-xl border border-kyber-green/30 bg-kyber-green/10 p-4"
                >
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.1 }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-kyber-green shadow-glow-sm"
                  >
                    <Check className="h-5 w-5 text-kyber-black" />
                  </motion.span>
                  <div>
                    <p className="text-sm font-semibold text-kyber-white">{t("onboarding.waConnectedTitle")}</p>
                    <p className="mt-0.5 text-xs text-kyber-gray">
                      {t("onboarding.waConnectedDescription", {
                        number: MOCK_WHATSAPP_INSTANCE.connectedNumber ?? "",
                      })}
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-4">
                  <Button onClick={simulate} loading={connecting} className="w-full sm:w-auto">
                    {connecting ? t("onboarding.waStatusConnecting") : t("onboarding.waSimulate")}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Aviso quando não conectado */}
          <AnimatePresence>
            {status !== "connected" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4">
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <p className="text-xs leading-relaxed text-amber-200/90">{t("onboarding.waWarning")}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* QR code */}
        <div className="mx-auto w-full max-w-[260px] lg:mx-0">
          <div className="relative overflow-hidden rounded-2xl bg-white p-4 shadow-card">
            <FakeQr className={status === "connected" ? "opacity-15 transition-opacity duration-500" : undefined} />
            <AnimatePresence>
              {status === "connected" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-kyber-green shadow-glow">
                    <Check className="h-8 w-8 text-kyber-black" />
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <p className="mt-3 text-center text-xs text-kyber-dim">{t("onboarding.waQrCaption")}</p>
        </div>
      </div>
    </div>
  );
}
