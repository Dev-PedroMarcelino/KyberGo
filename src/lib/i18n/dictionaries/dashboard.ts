import type { Namespace } from "../locales";

/** Strings do domínio "dashboard". Preenchido pelo módulo correspondente. */
export const dashboard: Namespace = {
  "pt-BR": {
    greetingMorning: "Bom dia, {{name}}",
    greetingAfternoon: "Boa tarde, {{name}}",
    greetingEvening: "Boa noite, {{name}}",
    actionSmartQuote: "Orçamento inteligente",
    actionSimpleDoc: "Documento simples",

    metricQuotesMonth: "Orçamentos no mês",
    metricConversion: "Taxa de conversão",
    metricLeads: "Leads criados",
    metricRevenue: "Receita estimada",

    chartTitle: "Orçamentos × fechados",
    chartSubtitle: "Evolução mensal dos últimos 6 meses",
    seriesQuotes: "Orçamentos",
    seriesClosed: "Fechados",

    funnelTitle: "Funil de conversão",
    funnelSubtitle: "Do lead ao fechamento neste mês",

    whatsappTitle: "WhatsApp",
    whatsappConnected: "Conectado",
    whatsappSynced: "Sincronizado em {{date}}",
    aiTitle: "Uso de IA",
    aiDescription: "{{used}} de {{limit}} créditos no ciclo",
    pdfTitle: "PDFs gerados",
    pdfDescription: "{{used}} de {{limit}} PDFs este mês",
    planTitle: "Plano ativo",
    planRenews: "Renova em {{date}}",
    planUpgrade: "Fazer upgrade",

    followupsTitle: "Follow-ups agendados",
    followupsCount: "{{count}} agendados",
    followupsViewAll: "Ver calendário",
    followupsEmptyTitle: "Nenhum follow-up agendado",
    followupsEmptyDescription: "Crie automações para nunca mais esquecer um cliente.",

    maintenanceTitle: "Manutenção próxima",
    maintenanceCount: "{{count}} clientes",
    maintenanceDueAt: "Vence em {{date}}",
    maintenanceSchedule: "Agendar mensagem",
    maintenanceToastTitle: "Mensagem agendada",
    maintenanceToastDescription: "Lembrete de manutenção para {{name}} entrou na fila de envio.",
    maintenanceEmptyTitle: "Nenhuma manutenção próxima",
    maintenanceEmptyDescription: "Clientes com manutenção prevista aparecem aqui.",

    categoryTitle: "Distribuição por categoria",
    categorySubtitle: "Participação nos orçamentos do mês",

    recentTitle: "Orçamentos recentes",
    recentSubtitle: "Últimas propostas criadas pela equipe",
    recentViewAll: "Ver todos",
    recentEmptyTitle: "Nenhum orçamento ainda",
    recentEmptyDescription: "Crie seu primeiro orçamento inteligente para começar.",
    recentEmptyAction: "Criar orçamento",

    statusDraft: "Rascunho",
    statusSent: "Enviado",
    statusViewed: "Visualizado",
    statusNegotiating: "Em negociação",
    statusAccepted: "Aceito",
    statusRejected: "Recusado",
    statusExpired: "Expirado",
  },
  en: {},
  es: {},
};
