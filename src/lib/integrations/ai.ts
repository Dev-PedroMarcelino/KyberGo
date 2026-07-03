/**
 * Abstração do serviço de IA do KyberGo.
 *
 * Responsabilidades:
 * - Interpretar mensagens de WhatsApp (texto e transcrições de áudio).
 * - Identificar o modo (inteligente × documento simples).
 * - Coletar dados faltantes com o mínimo de perguntas.
 * - Aplicar os critérios configurados pela empresa (modo inteligente).
 * - Estruturar itens e valores informados pelo usuário (modo simples).
 * - Gerar texto profissional da proposta em pt-BR.
 */

import type { QuoteCriterion, QuoteItem, QuoteMode } from "../types";

export interface QuoteExtractionInput {
  companyId: string;
  message: string;
  transcription?: string | null;
  conversationHistory?: string[];
  criteria?: QuoteCriterion[];
  mode?: QuoteMode;
}

export interface QuoteExtractionResult {
  mode: QuoteMode;
  /** Perguntas essenciais que ainda precisam ser feitas ao cliente. */
  missingQuestions: string[];
  /** Dados já coletados (chave = rótulo do critério ou campo livre). */
  collectedData: Record<string, string | number | boolean>;
  customerName: string | null;
  customerPhone: string | null;
  serviceType: string | null;
  items: QuoteItem[];
  suggestedTotal: number | null;
  proposalText: string;
  suggestedCrmStage: string;
}

export interface AiProvider {
  readonly name: string;
  extractQuote(input: QuoteExtractionInput): Promise<QuoteExtractionResult>;
  transcribeAudio(audioUrl: string): Promise<string>;
}

/** Implementação simulada para modo demo — gera resultados plausíveis sem chamar API externa. */
class MockAiProvider implements AiProvider {
  readonly name = "mock";

  async extractQuote(input: QuoteExtractionInput): Promise<QuoteExtractionResult> {
    const isSimple = input.mode === "simple" || /r\$\s*[\d.,]+/i.test(input.message);
    return {
      mode: isSimple ? "simple" : "intelligent",
      missingQuestions: isSimple ? [] : ["Qual a metragem aproximada?", "Qual o endereço do serviço?"],
      collectedData: {},
      customerName: null,
      customerPhone: null,
      serviceType: null,
      items: [],
      suggestedTotal: null,
      proposalText:
        "Proposta gerada em modo demonstração. Configure AI_API_KEY para ativar a geração real por IA.",
      suggestedCrmStage: "new_lead",
    };
  }

  async transcribeAudio(): Promise<string> {
    return "Transcrição simulada (modo demonstração).";
  }
}

export function getAiProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER;
  const apiKey = process.env.AI_API_KEY;
  if (!provider || !apiKey) return new MockAiProvider();
  switch (provider) {
    // case "anthropic": return new AnthropicProvider(apiKey);
    default:
      return new MockAiProvider();
  }
}
