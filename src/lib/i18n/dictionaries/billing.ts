import type { Namespace } from "../locales";

/** Strings do domínio "billing" — assinatura, planos, faturas e cancelamento. */
export const billing: Namespace = {
  "pt-BR": {
    title: "Assinatura e cobrança",
    subtitle: "Gerencie seu plano, acompanhe o uso e o histórico de faturas.",

    // Banner de simulação de estados
    simTitle: "Simular estado da assinatura",
    simDescription: "Demonstração: alterne para visualizar como cada estado aparece para o cliente.",
    simActive: "Ativa",
    simTrial: "Trial",
    simPastDue: "Pagamento atrasado",
    simBlocked: "Bloqueada",

    // Card do plano atual
    currentPlanTitle: "Plano atual",
    statusActive: "Ativa",
    statusTrial: "Período de teste",
    statusPastDue: "Pagamento atrasado",
    statusBlocked: "Bloqueada",
    planLabel: "Plano {{plan}}",
    currentPeriod: "Período atual",
    nextCharge: "Próxima cobrança",
    amountPerMonth: "{{amount}}/mês",
    paymentMethod: "Método de pagamento",
    cardEnding: "Cartão de crédito terminando em {{last4}}",
    cardExpiry: "Validade 08/2028",
    changeCard: "Alterar cartão",
    cardChangeToast: "Alteração de cartão",
    cardChangeToastDesc: "Em produção, você seria redirecionado ao portal seguro de pagamento.",

    // Trial
    trialDaysLeft: "{{days}} dias restantes do período de teste",
    trialEndsAt: "Seu teste termina em {{date}}. Assine para não perder acesso.",
    trialCta: "Assinar agora",
    trialCtaToast: "Vamos assinar!",
    trialCtaToastDesc: "Em produção, você seria levado ao checkout do plano Professional.",

    // Pagamento atrasado
    pastDueTitle: "Não conseguimos processar seu pagamento",
    pastDueDescription:
      "A cobrança de {{amount}} falhou em {{date}}. Atualize seu método de pagamento para evitar o bloqueio da conta em 5 dias.",
    updatePayment: "Atualizar pagamento",
    updatePaymentToast: "Pagamento atualizado",
    updatePaymentToastDesc: "Nova tentativa de cobrança agendada para as próximas horas.",

    // Bloqueada
    blockedTitle: "Conta bloqueada por falta de pagamento",
    blockedDescription:
      "Sua instância do WhatsApp foi desconectada e o acesso da equipe está suspenso. Regularize o pagamento para reativar tudo imediatamente.",
    blockedLink: "Ver detalhes do bloqueio",

    // Uso do plano
    usageTitle: "Uso do plano neste ciclo",
    usageSubtitle: "Ciclo de {{start}} até {{end}}",
    usageUsers: "Usuários",
    usagePdfs: "PDFs gerados",
    usageConversations: "Conversas WhatsApp",
    usageAiCredits: "Créditos de IA",
    usageOf: "{{used}} de {{limit}}",
    usagePercent: "{{percent}}% utilizado",
    usageNearLimit: "Perto do limite",
    usageAtLimit: "Limite quase esgotado",

    // Comparação de planos
    plansTitle: "Planos disponíveis",
    plansSubtitle: "Mude de plano a qualquer momento. O valor é ajustado de forma proporcional.",
    billingMonthly: "Mensal",
    billingAnnual: "Anual",
    annualBadge: "2 meses grátis",
    perMonth: "/mês",
    perYear: "/ano",
    customPrice: "Sob consulta",
    currentPlanBadge: "Plano atual",
    currentPlanButton: "Plano atual",
    upgradeButton: "Fazer upgrade",
    downgradeButton: "Fazer downgrade",
    contactSales: "Falar com vendas",
    contactSalesToast: "Contato enviado",
    contactSalesToastDesc: "Nossa equipe comercial entrará em contato em até 1 dia útil.",
    mostPopular: "Mais popular",

    // Modal de mudança de plano
    upgradeModalTitle: "Fazer upgrade para {{plan}}",
    downgradeModalTitle: "Fazer downgrade para {{plan}}",
    changeModalDescription: "Revise as diferenças antes de confirmar a mudança de plano.",
    changeFrom: "Plano atual",
    changeTo: "Novo plano",
    changeDiffTitle: "O que muda",
    diffUsers: "Usuários: {{from}} → {{to}}",
    diffPdfs: "PDFs por mês: {{from}} → {{to}}",
    diffConversations: "Conversas WhatsApp: {{from}} → {{to}}",
    diffAiCredits: "Créditos de IA: {{from}} → {{to}}",
    proRataUpgrade:
      "Cobrança pró-rata de {{amount}} hoje, referente aos {{days}} dias restantes do ciclo atual.",
    proRataDowngrade:
      "Crédito pró-rata de {{amount}} aplicado na próxima fatura, referente aos {{days}} dias restantes do ciclo.",
    newChargeInfo: "A partir de {{date}}, a cobrança recorrente será de {{amount}}.",
    downgradeWarning:
      "Atenção: recursos acima do limite do novo plano (usuários e automações extras) serão desativados.",
    confirmChange: "Confirmar mudança",
    changeSuccessToast: "Plano alterado com sucesso",
    changeSuccessToastDesc: "Agora você está no plano {{plan}}. As mudanças já estão ativas.",

    // Histórico de faturas
    invoicesTitle: "Histórico de faturas",
    invoicesSubtitle: "Suas últimas cobranças e recibos para download.",
    invoiceDate: "Data",
    invoiceNumber: "Fatura",
    invoiceAmount: "Valor",
    invoiceStatus: "Status",
    invoicePaid: "Paga",
    invoicePending: "Pendente",
    invoiceActions: "Ações",
    downloadInvoice: "Baixar",
    downloadToast: "Download iniciado",
    downloadToastDesc: "A fatura {{number}} está sendo baixada em PDF.",

    // Zona de cancelamento
    cancelZoneTitle: "Cancelar assinatura",
    cancelWarnIntro: "Ao cancelar sua assinatura:",
    cancelWarn1: "Sua instância do WhatsApp será desconectada imediatamente ao fim do ciclo.",
    cancelWarn2: "A equipe perde o acesso ao painel, orçamentos e CRM.",
    cancelWarn3: "Seus dados ficam preservados por 90 dias — reative quando quiser sem perder nada.",
    cancelWarn4: "Nenhuma cobrança adicional será feita após o fim do ciclo atual.",
    cancelAccessUntil: "Você mantém acesso completo até {{date}}.",
    cancelButton: "Quero cancelar minha assinatura",
    cancelModalTitle: "Confirmar cancelamento",
    cancelModalDescription:
      "Essa ação encerra sua assinatura ao fim do ciclo atual. Para confirmar, digite CANCELAR no campo abaixo.",
    cancelInputLabel: "Digite CANCELAR para confirmar",
    cancelInputPlaceholder: "CANCELAR",
    cancelConfirmButton: "Cancelar assinatura definitivamente",
    cancelKeepButton: "Manter assinatura",
    cancelSuccessToast: "Assinatura cancelada",
    cancelSuccessToastDesc: "Você tem acesso até {{date}}. Sentiremos sua falta!",
  },
  en: {},
  es: {},
};
