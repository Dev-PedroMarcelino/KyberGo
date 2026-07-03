import { NextRequest, NextResponse } from "next/server";
import { getWhatsAppProvider } from "@/lib/integrations/whatsapp";
import { getAiProvider } from "@/lib/integrations/ai";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Webhook de mensagens recebidas do WhatsApp.
 *
 * Pipeline de produção:
 * 1. Valida a assinatura do webhook (WHATSAPP_WEBHOOK_SECRET).
 * 2. Identifica a empresa pela instância (provider_instance_id).
 * 3. Verifica o status da assinatura (bloqueia empresas inadimplentes).
 * 4. Registra a mensagem em conversation_logs.
 * 5. Se for áudio, transcreve antes de processar.
 * 6. Encaminha para a IA (modo inteligente ou simples) com os critérios da empresa.
 * 7. Responde perguntas faltantes OU gera o orçamento + PDF + lead no CRM.
 */
export async function POST(request: NextRequest) {
  const provider = getWhatsAppProvider();
  const body = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  if (!provider.verifyWebhook(headers, body)) {
    return NextResponse.json({ error: "Assinatura de webhook inválida." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    // Modo demo: aceita o evento sem persistir.
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const event = JSON.parse(body) as {
    instanceId: string;
    from: string;
    type: "text" | "audio";
    text?: string;
    audioUrl?: string;
  };

  // 2. Resolve a instância → empresa (service role exige filtro explícito).
  const { data: instance } = await supabase
    .from("whatsapp_instances")
    .select("id, company_id")
    .eq("provider_instance_id", event.instanceId)
    .single();

  if (!instance) {
    return NextResponse.json({ error: "Instância desconhecida." }, { status: 404 });
  }

  // 3. Bloqueio por status de assinatura.
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("company_id", instance.company_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!subscription || ["cancelled", "blocked"].includes(subscription.status)) {
    return NextResponse.json({ ok: false, reason: "Assinatura inativa." }, { status: 200 });
  }

  // 5. Transcrição de áudio quando necessário.
  const ai = getAiProvider();
  const transcription = event.type === "audio" && event.audioUrl ? await ai.transcribeAudio(event.audioUrl) : null;

  // 4. Log da conversa.
  await supabase.from("conversation_logs").insert({
    company_id: instance.company_id,
    whatsapp_instance_id: instance.id,
    direction: "inbound",
    message_type: event.type,
    content: event.text ?? "",
    audio_url: event.audioUrl ?? null,
    transcription,
  });

  // 6. Processamento pela IA (perguntas faltantes ou geração do orçamento).
  const result = await ai.extractQuote({
    companyId: instance.company_id,
    message: event.text ?? transcription ?? "",
    transcription,
  });

  // 7. Resposta ao cliente.
  if (result.missingQuestions.length > 0) {
    await provider.sendMessage(event.instanceId, {
      to: event.from,
      text: result.missingQuestions[0],
    });
  }

  return NextResponse.json({ ok: true, mode: result.mode });
}
