import { NextRequest, NextResponse } from "next/server";
import { getAiProvider } from "@/lib/integrations/ai";
import { getSupabaseServiceClient } from "@/lib/supabase/server";

/**
 * Geração de orçamento pela interface web (modos inteligente e simples).
 *
 * Entrada: { companyId, mode, description, answers?, customerId? }
 * Saída:   proposta estruturada (perguntas faltantes OU itens + totais + texto).
 *
 * Regra central do produto:
 * - Modo inteligente: a IA aplica os critérios configurados pela empresa.
 * - Modo simples: a IA organiza a descrição; o preço é SEMPRE o informado
 *   pelo usuário — nunca calculado ou inventado.
 */
export async function POST(request: NextRequest) {
  const payload = (await request.json()) as {
    companyId: string;
    mode: "intelligent" | "simple";
    description: string;
    customerId?: string;
  };

  if (!payload.companyId || !payload.description) {
    return NextResponse.json({ error: "companyId e description são obrigatórios." }, { status: 400 });
  }

  const ai = getAiProvider();
  const supabase = getSupabaseServiceClient();

  // Modo inteligente: carrega os critérios configurados pela empresa.
  let criteria = undefined;
  if (payload.mode === "intelligent" && supabase) {
    const { data } = await supabase
      .from("quote_criteria")
      .select("*")
      .eq("company_id", payload.companyId)
      .order("order");
    criteria = data ?? undefined;
  }

  const result = await ai.extractQuote({
    companyId: payload.companyId,
    message: payload.description,
    mode: payload.mode,
    criteria,
  });

  return NextResponse.json({ ok: true, result });
}
