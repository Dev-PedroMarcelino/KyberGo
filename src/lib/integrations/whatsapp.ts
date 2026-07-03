/**
 * Camada adaptadora genérica de WhatsApp.
 *
 * O KyberGo não depende de um provedor específico (Z-API, UAZ API, AZ API etc.).
 * Cada provedor implementa a interface WhatsAppProvider; a escolha é feita
 * pela variável de ambiente WHATSAPP_PROVIDER.
 */

export interface SendMessagePayload {
  to: string;
  text?: string;
  documentUrl?: string;
  documentName?: string;
}

export interface InstanceInfo {
  providerInstanceId: string;
  status: "connected" | "disconnected" | "connecting" | "qr_pending";
  qrCode: string | null;
  connectedNumber: string | null;
}

export interface WhatsAppProvider {
  readonly name: string;
  /** Cria uma instância dedicada para uma empresa (1 instância por assinatura ativa). */
  createInstance(companyId: string): Promise<InstanceInfo>;
  /** Desconecta/bloqueia a instância (ex.: assinatura cancelada). */
  disconnectInstance(providerInstanceId: string): Promise<void>;
  /** Retorna o QR code atual para pareamento. */
  getQrCode(providerInstanceId: string): Promise<string | null>;
  /** Consulta o status da conexão. */
  getStatus(providerInstanceId: string): Promise<InstanceInfo>;
  /** Envia mensagem de texto ou documento (PDF de proposta). */
  sendMessage(providerInstanceId: string, payload: SendMessagePayload): Promise<{ messageId: string }>;
  /** Valida a assinatura de um webhook recebido. */
  verifyWebhook(headers: Record<string, string>, body: string): boolean;
}

/** Provedor simulado usado em modo demo e em testes. */
class MockWhatsAppProvider implements WhatsAppProvider {
  readonly name = "mock";

  async createInstance(companyId: string): Promise<InstanceInfo> {
    return {
      providerInstanceId: `mock_${companyId}`,
      status: "qr_pending",
      qrCode: "MOCK-QR-CODE",
      connectedNumber: null,
    };
  }

  async disconnectInstance(): Promise<void> {
    // Nada a fazer em modo demo.
  }

  async getQrCode(): Promise<string | null> {
    return "MOCK-QR-CODE";
  }

  async getStatus(providerInstanceId: string): Promise<InstanceInfo> {
    return {
      providerInstanceId,
      status: "connected",
      qrCode: null,
      connectedNumber: "+55 11 98765-4321",
    };
  }

  async sendMessage(): Promise<{ messageId: string }> {
    return { messageId: `mock_msg_${Math.random().toString(36).slice(2)}` };
  }

  verifyWebhook(): boolean {
    return true;
  }
}

/**
 * Ponto único de resolução do provedor.
 * Para adicionar um provedor real: implemente WhatsAppProvider usando
 * WHATSAPP_API_BASE_URL / WHATSAPP_API_TOKEN e registre-o aqui.
 */
export function getWhatsAppProvider(): WhatsAppProvider {
  const provider = process.env.WHATSAPP_PROVIDER;
  switch (provider) {
    // case "zapi": return new ZApiProvider();
    // case "uazapi": return new UazApiProvider();
    default:
      return new MockWhatsAppProvider();
  }
}
