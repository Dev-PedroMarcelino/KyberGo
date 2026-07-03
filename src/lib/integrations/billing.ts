/**
 * Abstração do provedor de pagamento/assinaturas.
 * Suporta Stripe, Pagar.me, Asaas ou provedor customizado via BILLING_PROVIDER.
 */

export interface CheckoutSession {
  url: string;
  sessionId: string;
}

export interface BillingProvider {
  readonly name: string;
  createCheckout(companyId: string, planId: string, interval: "monthly" | "annual"): Promise<CheckoutSession>;
  createPortalSession(customerId: string): Promise<{ url: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  verifyWebhook(headers: Record<string, string>, body: string): boolean;
}

class MockBillingProvider implements BillingProvider {
  readonly name = "mock";

  async createCheckout(): Promise<CheckoutSession> {
    return { url: "/app/assinatura?checkout=demo", sessionId: "cs_demo" };
  }

  async createPortalSession(): Promise<{ url: string }> {
    return { url: "/app/assinatura" };
  }

  async cancelSubscription(): Promise<void> {
    // Nada a fazer em modo demo.
  }

  verifyWebhook(): boolean {
    return true;
  }
}

export function getBillingProvider(): BillingProvider {
  const provider = process.env.BILLING_PROVIDER;
  switch (provider) {
    // case "stripe": return new StripeProvider();
    default:
      return new MockBillingProvider();
  }
}
