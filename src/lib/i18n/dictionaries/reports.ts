import type { Namespace } from "../locales";

/** Strings do domínio "reports". Preenchido pelo módulo correspondente. */
export const reports: Namespace = {
  "pt-BR": {
    title: "Relatórios",
    subtitle: "Receita, conversão e follow-up da sua operação em um só lugar",
    export: "Exportar",
    exportToastTitle: "Exportação em modo demo",
    exportToastDescription: "Com o backend conectado, o relatório completo sai em CSV e PDF.",

    period30: "30 dias",
    period90: "90 dias",
    period12m: "12 meses",

    kpiClosedRevenue: "Receita fechada",
    kpiForecastRevenue: "Receita prevista",
    kpiForecastFooter: "Pipeline aberto no CRM",
    kpiAvgTicket: "Ticket médio",
    kpiConversion: "Taxa de conversão",
    kpiLost: "Orçamentos perdidos",
    kpiResponseTime: "Tempo médio de resposta",
    kpiResponseFooter: "Do primeiro contato ao orçamento",

    revenueTitle: "Receita no período",
    revenueSubtitle: "Fechamentos realizados × linha de previsão",
    seriesRevenue: "Receita",
    seriesForecast: "Previsão",

    funnelTitle: "Funil de conversão detalhado",
    funnelSubtitle: "Volume por etapa e queda entre elas",
    funnelDrop: "queda de {{pct}}% para a próxima etapa",

    followupTitle: "Desempenho de follow-up",
    followupSubtitle: "Resultado das mensagens automáticas no período",
    fuSent: "Mensagens enviadas",
    fuResponseRate: "Taxa de resposta",
    fuReactivated: "Vendas reativadas",
    fuReactivatedFooter: "{{value}} em receita recuperada",
    fuTrendTitle: "Mensagens por semana",
    fuTrendSeries: "Mensagens",

    lossTitle: "Motivos de perda",
    lossSubtitle: "Por que os orçamentos não fecharam",
    lossReason: "Motivo",
    lossCount: "Ocorrências",
    lossShare: "% do total",

    rankingTitle: "Ranking de vendedores",
    rankingSubtitle: "Desempenho individual no período",
    rankQuotes: "{{count}} orçamentos",
    rankClosed: "{{count}} fechados",
    rankRevenue: "Receita",
  },
  en: {},
  es: {},
};
