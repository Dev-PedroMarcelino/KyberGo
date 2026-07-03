"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Image as ImageIcon,
  Info,
  MessageCircle,
  MessageSquareText,
  Mic,
  Plug,
  Smartphone,
  TriangleAlert,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { MOCK_CONVERSATIONS, MOCK_CUSTOMERS, MOCK_DASHBOARD_METRICS, MOCK_WHATSAPP_INSTANCE } from "@/lib/mock/data";
import type { MessageType, WhatsAppInstance } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { PageTransition } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { EmptyState, MetricCard, Progress, Tabs, Tooltip } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { ApiCredentialsCard } from "@/components/whatsapp/api-credentials-card";

const QR_SIZE = 21;
const QR_TTL_SECONDS = 45;

/** Gera uma matriz pseudo-QR determinística a partir de uma semente. */
function buildQrMatrix(seed: number): boolean[][] {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  const matrix: boolean[][] = Array.from({ length: QR_SIZE }, () =>
    Array.from({ length: QR_SIZE }, () => rand() > 0.52)
  );
  // Padrões de localização (cantos), como em um QR real, com zona de silêncio ao redor.
  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r < 8; r++) {
      for (let c = -1; c < 8; c++) {
        const rr = top + r;
        const cc = left + c;
        if (rr < 0 || cc < 0 || rr >= QR_SIZE || cc >= QR_SIZE) continue;
        const inside = r >= 0 && r <= 6 && c >= 0 && c <= 6;
        const ring = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[rr][cc] = inside && (ring || core);
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, QR_SIZE - 7);
  drawFinder(QR_SIZE - 7, 0);
  return matrix;
}

const TYPE_ICONS: Record<MessageType, React.ReactNode> = {
  text: <MessageSquareText className="h-3.5 w-3.5" />,
  audio: <Mic className="h-3.5 w-3.5" />,
  image: <ImageIcon className="h-3.5 w-3.5" />,
  document: <FileText className="h-3.5 w-3.5" />,
  pdf: <FileText className="h-3.5 w-3.5" />,
};

type Flow = "connected" | "disconnected" | "qr" | "success";

export default function WhatsAppPage() {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [instance, setInstance] = useState<WhatsAppInstance>(MOCK_WHATSAPP_INSTANCE);
  const [flow, setFlow] = useState<Flow>(MOCK_WHATSAPP_INSTANCE.status === "connected" ? "connected" : "disconnected");
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [qrSeed, setQrSeed] = useState(1);
  const [qrSeconds, setQrSeconds] = useState(QR_TTL_SECONDS);
  const [dirFilter, setDirFilter] = useState("all");

  const qrMatrix = useMemo(() => buildQrMatrix(qrSeed), [qrSeed]);
  const qrExpired = qrSeconds <= 0;

  /* ---- Timer de expiração do QR ---- */
  useEffect(() => {
    if (flow !== "qr") return;
    const id = setInterval(() => setQrSeconds((sec) => (sec > 0 ? sec - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [flow]);

  /* ---- Animação de sucesso → estado conectado ---- */
  useEffect(() => {
    if (flow !== "success") return;
    const id = setTimeout(() => {
      setInstance((inst) => ({ ...inst, status: "connected", lastConnectionAt: new Date().toISOString() }));
      setFlow("connected");
      toast("success", t("whatsapp.connectedToastTitle"), t("whatsapp.connectedToastDescription"));
    }, 1600);
    return () => clearTimeout(id);
  }, [flow, t, toast]);

  const disconnect = () => {
    setInstance((inst) => ({ ...inst, status: "disconnected" }));
    setFlow("disconnected");
    setConfirmDisconnect(false);
    toast("warning", t("whatsapp.disconnectedToastTitle"), t("whatsapp.disconnectedToastDescription"));
  };

  const showQr = () => {
    setQrSeed(Date.now());
    setQrSeconds(QR_TTL_SECONDS);
    setInstance((inst) => ({ ...inst, status: "qr_pending" }));
    setFlow("qr");
  };

  const isConnected = flow === "connected";

  const statusBadge = isConnected ? (
    <Badge tone="green" dot>{t("whatsapp.statusConnected")}</Badge>
  ) : flow === "qr" ? (
    <Badge tone="yellow" dot>{t("whatsapp.statusQrPending")}</Badge>
  ) : (
    <Badge tone="red">{t("whatsapp.statusDisconnected")}</Badge>
  );

  const conversations = useMemo(
    () =>
      [...MOCK_CONVERSATIONS]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .filter((c) => dirFilter === "all" || c.direction === dirFilter),
    [dirFilter]
  );

  const customerName = (id: string | null) =>
    (id && MOCK_CUSTOMERS.find((c) => c.id === id)?.name) || t("whatsapp.unknownCustomer");

  const { conversationUsage } = MOCK_DASHBOARD_METRICS;

  const steps = [
    { icon: <MessageCircle className="h-5 w-5" />, title: t("whatsapp.howStep1Title"), description: t("whatsapp.howStep1Description") },
    { icon: <Mic className="h-5 w-5" />, title: t("whatsapp.howStep2Title"), description: t("whatsapp.howStep2Description") },
    { icon: <Bot className="h-5 w-5" />, title: t("whatsapp.howStep3Title"), description: t("whatsapp.howStep3Description") },
    { icon: <FileText className="h-5 w-5" />, title: t("whatsapp.howStep4Title"), description: t("whatsapp.howStep4Description") },
    { icon: <Database className="h-5 w-5" />, title: t("whatsapp.howStep5Title"), description: t("whatsapp.howStep5Description") },
  ];

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("whatsapp.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("whatsapp.subtitle")}</p>
        </div>
      </div>

      {/* Banner de instância desconectada */}
      {flow === "disconnected" && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <TriangleAlert className="h-4 w-4 shrink-0" />
          {t("whatsapp.disconnectedBanner")}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Card de status da instância */}
        <GlassCard hover={false} className="p-5 sm:p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green">
                <Smartphone className="h-5 w-5" />
                <span
                  className={cn(
                    "absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-kyber-rich",
                    isConnected ? "animate-pulse bg-kyber-green" : flow === "qr" ? "bg-amber-400" : "bg-red-500"
                  )}
                />
              </span>
              <h2 className="font-display text-base font-semibold text-kyber-white">{t("whatsapp.instanceTitle")}</h2>
            </div>
            {statusBadge}
          </div>

          <dl className="mt-5 grid gap-x-6 gap-y-4 border-t border-border pt-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-kyber-dim">{t("whatsapp.connectedNumber")}</dt>
              <dd className="mt-0.5 text-sm font-medium text-kyber-soft">
                {isConnected ? instance.connectedNumber : t("whatsapp.noNumber")}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-kyber-dim">{t("whatsapp.provider")}</dt>
              <dd className="mt-0.5 text-sm font-medium text-kyber-soft">
                {instance.provider === "generic" ? t("whatsapp.providerGeneric") : instance.provider}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-kyber-dim">{t("whatsapp.lastConnection")}</dt>
              <dd className="mt-0.5 text-sm font-medium text-kyber-soft">
                {instance.lastConnectionAt ? formatDateTime(instance.lastConnectionAt, locale) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-kyber-dim">{t("whatsapp.instanceId")}</dt>
              <dd className="mt-0.5 font-mono text-sm font-medium text-kyber-soft">{instance.providerInstanceId}</dd>
            </div>
          </dl>

          {/* Fluxo de conexão */}
          <div className="mt-5 border-t border-border pt-5">
            {flow === "connected" && (
              <Button variant="danger" onClick={() => setConfirmDisconnect(true)}>
                <Plug className="h-4 w-4" />
                {t("whatsapp.disconnect")}
              </Button>
            )}

            {flow === "disconnected" && (
              <Button onClick={showQr}>
                <Plug className="h-4 w-4" />
                {t("whatsapp.reconnect")}
              </Button>
            )}

            {flow === "qr" && (
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                {/* QR code placeholder gerado com divs */}
                <div className="relative shrink-0 overflow-hidden rounded-xl bg-white p-2.5 shadow-card">
                  <div
                    className={cn("grid gap-px transition-opacity", qrExpired && "opacity-20 blur-[2px]")}
                    style={{ gridTemplateColumns: `repeat(${QR_SIZE}, 1fr)`, width: 176, height: 176 }}
                  >
                    {qrMatrix.flatMap((row, r) =>
                      row.map((cell, c) => (
                        <span key={`${r}-${c}`} className={cell ? "bg-kyber-black" : "bg-white"} />
                      ))
                    )}
                  </div>
                  {/* Linha de escaneamento animada */}
                  {!qrExpired && (
                    <motion.span
                      animate={{ top: ["6%", "90%", "6%"] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                      className="pointer-events-none absolute inset-x-2.5 h-0.5 rounded-full bg-kyber-green shadow-glow-sm"
                    />
                  )}
                  {qrExpired && (
                    <span className="absolute inset-0 flex items-center justify-center px-4 text-center text-xs font-semibold text-kyber-black">
                      {t("whatsapp.qrExpiredTitle")}
                    </span>
                  )}
                </div>

                <div className="w-full min-w-0">
                  <h3 className="font-display text-sm font-semibold text-kyber-white">
                    {qrExpired ? t("whatsapp.qrExpiredTitle") : t("whatsapp.qrTitle")}
                  </h3>
                  <p className="mt-1 text-sm text-kyber-gray">
                    {qrExpired ? t("whatsapp.qrExpiredDescription") : t("whatsapp.qrInstruction")}
                  </p>

                  {!qrExpired && (
                    <>
                      <p className="mt-3 flex items-center gap-2 text-xs font-medium text-kyber-green">
                        <motion.span
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ duration: 1.4, repeat: Infinity }}
                          className="inline-flex"
                        >
                          <Smartphone className="h-3.5 w-3.5" />
                        </motion.span>
                        {t("whatsapp.qrScanHint")}
                      </p>
                      <div className="mt-2">
                        <Progress value={(qrSeconds / QR_TTL_SECONDS) * 100} tone={qrSeconds <= 10 ? "yellow" : "green"} />
                        <p className="mt-1.5 text-xs text-kyber-dim">{t("whatsapp.qrExpiresIn", { seconds: qrSeconds })}</p>
                      </div>
                    </>
                  )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    {qrExpired ? (
                      <Button size="sm" onClick={showQr}>
                        {t("whatsapp.qrRegenerate")}
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setFlow("success")}>
                        <CheckCircle2 className="h-4 w-4" />
                        {t("whatsapp.qrSimulate")}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => setFlow("disconnected")}>
                      {t("common.cancel")}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {flow === "success" && (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <motion.span
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 14 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full bg-kyber-green/15 text-kyber-green shadow-glow"
                >
                  <CheckCircle2 className="h-9 w-9" />
                </motion.span>
                <div>
                  <p className="font-display text-base font-semibold text-kyber-white">{t("whatsapp.successTitle")}</p>
                  <p className="mt-1 text-sm text-kyber-gray">{t("whatsapp.successDescription")}</p>
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Como funciona */}
        <GlassCard hover={false} className="p-5 sm:p-6">
          <h2 className="font-display text-base font-semibold text-kyber-white">{t("whatsapp.howTitle")}</h2>
          <p className="mt-1 text-sm text-kyber-gray">{t("whatsapp.howSubtitle")}</p>
          <ol className="mt-5 flex flex-col gap-4">
            {steps.map((step, i) => (
              <li key={step.title} className="flex items-start gap-3">
                <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green">
                  {step.icon}
                  <span className="absolute -left-1.5 -top-1.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-kyber-green text-[10px] font-bold text-kyber-black">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <p className="text-sm font-medium text-kyber-white">{step.title}</p>
                  <p className="text-xs text-kyber-gray">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </GlassCard>
      </div>

      {/* Aviso de instância única */}
      <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-400/25 bg-sky-400/[0.07] px-4 py-3 text-sm text-sky-300">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        {t("whatsapp.singleInstanceNotice")}
      </div>

      {/* Credenciais da API por empresa (PRD 4.3c) */}
      <ApiCredentialsCard />

      {/* Métricas */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label={t("whatsapp.metricConversations")}
          value={conversationUsage.used}
          icon={<MessageCircle className="h-4 w-4" />}
          footer={
            <div>
              <Progress value={(conversationUsage.used / conversationUsage.limit) * 100} />
              <p className="mt-1.5 text-xs text-kyber-dim">
                {t("whatsapp.metricConversationsFooter", { used: conversationUsage.used, limit: conversationUsage.limit })}
              </p>
            </div>
          }
        />
        <MetricCard
          label={t("whatsapp.metricMessagesSent")}
          value={486}
          delta={9}
          icon={<ArrowUpRight className="h-4 w-4" />}
          footer={<p className="text-xs text-kyber-dim">{t("whatsapp.metricMessagesSentFooter")}</p>}
        />
        <MetricCard
          label={t("whatsapp.metricAudiosTranscribed")}
          value={37}
          icon={<Mic className="h-4 w-4" />}
          footer={<p className="text-xs text-kyber-dim">{t("whatsapp.metricAudiosTranscribedFooter")}</p>}
        />
      </div>

      {/* Log de mensagens */}
      <div className="mb-4 mt-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-kyber-white">{t("whatsapp.logTitle")}</h2>
          <p className="mt-0.5 text-sm text-kyber-gray">{t("whatsapp.logSubtitle")}</p>
        </div>
        <Tabs
          value={dirFilter}
          onChange={setDirFilter}
          items={[
            { value: "all", label: t("whatsapp.filterAll") },
            { value: "inbound", label: t("whatsapp.filterInbound"), icon: <ArrowDownLeft className="h-3.5 w-3.5" /> },
            { value: "outbound", label: t("whatsapp.filterOutbound"), icon: <ArrowUpRight className="h-3.5 w-3.5" /> },
          ]}
        />
      </div>

      {conversations.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-7 w-7" />}
          title={t("whatsapp.logEmptyTitle")}
          description={t("whatsapp.logEmptyDescription")}
        />
      ) : (
        <GlassCard hover={false} className="divide-y divide-border !p-0">
          {conversations.map((log) => (
            <div key={log.id} className="flex items-start gap-3 px-4 py-3.5 sm:px-5">
              <span
                className={cn(
                  "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  log.direction === "inbound" ? "bg-sky-400/10 text-sky-300" : "bg-kyber-green/10 text-kyber-green"
                )}
              >
                {log.direction === "inbound" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-medium text-kyber-white">{customerName(log.customerId)}</span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-kyber-gray">
                    {TYPE_ICONS[log.messageType]}
                    {t(`whatsapp.type${log.messageType.charAt(0).toUpperCase()}${log.messageType.slice(1)}`)}
                  </span>
                  {log.aiResponse && (
                    <Tooltip content={log.aiResponse}>
                      <Badge tone="neon" className="cursor-default">
                        <Bot className="h-3 w-3" />
                        {t("whatsapp.aiBadge")}
                      </Badge>
                    </Tooltip>
                  )}
                  <span className="ml-auto whitespace-nowrap text-[11px] text-kyber-dim">
                    {formatDateTime(log.createdAt, locale)}
                  </span>
                </div>
                {log.messageType === "audio" ? (
                  <p className="mt-1 truncate text-sm italic text-kyber-gray">
                    “{log.transcription ?? t("whatsapp.audioNoTranscription")}”
                  </p>
                ) : (
                  <p className="mt-1 truncate text-sm text-kyber-gray">{log.content}</p>
                )}
              </div>
            </div>
          ))}
        </GlassCard>
      )}

      {/* Confirmação de desconexão */}
      <Modal
        open={confirmDisconnect}
        onClose={() => setConfirmDisconnect(false)}
        title={t("whatsapp.disconnectTitle")}
        description={t("whatsapp.disconnectDescription")}
      >
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmDisconnect(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="danger" onClick={disconnect}>
            <Plug className="h-4 w-4" />
            {t("whatsapp.disconnectConfirm")}
          </Button>
        </div>
      </Modal>
    </PageTransition>
  );
}
