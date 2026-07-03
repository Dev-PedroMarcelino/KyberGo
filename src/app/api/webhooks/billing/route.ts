import { NextRequest, NextResponse } from "next/server";
import { getBillingProvider } from "@/lib/integrations/billing";
import { getWhatsAppProvider } from "@/lib/integrations/whatsapp";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Webhook do provedor de pagamento (Stripe/Pagar.me/Asaas via camada adaptadora).
 *
 * Eventos tratados:
 * - subscription.activated  → ativa assinatura e cria instância de WhatsApp.
 * - subscription.past_due   → marca como atrasada (interface exibe aviso).
 * - subscription.cancelled  → cancela, bloqueia acesso e desconecta a instância.
 */
export async function POST(request: NextRequest) {
  const billing = getBillingProvider();
  const body = await request.text();

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  if (!billing.verifyWebhook(headers, body)) {
    return NextResponse.json({ error: "Assinatura de webhook inválida." }, { status: 401 });
  }

  const supabase = getSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ ok: true, mode: "demo" });
  }

  const event = JSON.parse(body) as { type: string; companyId: string; subscriptionId: string };
  const whatsapp = getWhatsAppProvider();

  switch (event.type) {
    case "subscription.activated": {
      await supabase
        .from("subscriptions")
        .update({ status: "active" })
        .eq("id", event.subscriptionId)
        .eq("company_id", event.companyId);

      // Regra de negócio: 1 instância de WhatsApp por assinatura ativa.
      const { data: existing } = await supabase
        .from("whatsapp_instances")
        .select("id")
        .eq("company_id", event.companyId)
        .maybeSingle();

      if (!existing) {
        const instance = await whatsapp.createInstance(event.companyId);
        await supabase.from("whatsapp_instances").insert({
          company_id: event.companyId,
          provider: whatsapp.name,
          provider_instance_id: instance.providerInstanceId,
          status: instance.status,
          qr_code: instance.qrCode,
        });
      }
      break;
    }

    case "subscription.past_due": {
      await supabase
        .from("subscriptions")
        .update({ status: "past_due" })
        .eq("id", event.subscriptionId)
        .eq("company_id", event.companyId);
      break;
    }

    case "subscription.cancelled": {
      await supabase
        .from("subscriptions")
        .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", event.subscriptionId)
        .eq("company_id", event.companyId);

      // Desconecta e bloqueia a instância da empresa.
      const { data: instance } = await supabase
        .from("whatsapp_instances")
        .select("id, provider_instance_id")
        .eq("company_id", event.companyId)
        .maybeSingle();

      if (instance) {
        await whatsapp.disconnectInstance(instance.provider_instance_id);
        await supabase
          .from("whatsapp_instances")
          .update({ status: "blocked" })
          .eq("id", instance.id);
      }
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
