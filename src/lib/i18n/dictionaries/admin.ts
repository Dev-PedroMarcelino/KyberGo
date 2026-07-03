import type { Namespace } from "../locales";

/** Strings do domínio "admin". Preenchido pelo módulo correspondente. */
export const admin: Namespace = {
  "pt-BR": {
    badge: "Painel da plataforma",
    title: "Visão geral da plataforma",
    subtitle: "Acompanhe empresas, receita recorrente e a saúde do KyberGo.",
    backToApp: "Ir para o app",

    kpiCompanies: "Empresas ativas",
    kpiMrr: "MRR",
    kpiTrials: "Trials em andamento",
    kpiChurn: "Churn mensal",
    kpiChurnFooter: "0,6 p.p. abaixo do mês anterior",

    growthTitle: "Crescimento da plataforma",
    growthSubtitle: "Empresas ativas e MRR nos últimos 12 meses",
    seriesCompanies: "Empresas ativas",
    seriesMrr: "MRR",

    companiesTitle: "Empresas",
    companiesSubtitle: "Todas as contas cadastradas na plataforma",
    searchPlaceholder: "Buscar por nome...",
    filterAll: "Todas",
    statusTrial: "Trial",
    statusActive: "Ativa",
    statusPastDue: "Atrasada",
    statusBlocked: "Bloqueada",
    waConnected: "Conectada",
    waDisconnected: "Desconectada",

    thCompany: "Empresa",
    thSegment: "Segmento",
    thPlan: "Plano",
    thStatus: "Assinatura",
    thWhatsapp: "WhatsApp",
    thPdfs: "PDFs no mês",
    thCreated: "Criada em",
    actionsLabel: "Ações da empresa",

    actionDetails: "Ver detalhes",
    actionBlock: "Bloquear",
    actionUnblock: "Desbloquear",
    actionDisconnect: "Desconectar WhatsApp",

    toastDetailsTitle: "Modo demonstração",
    toastDetailsDescription: "A visão detalhada de {{name}} chega junto com o backend.",
    toastBlockTitle: "Empresa bloqueada",
    toastBlockDescription: "{{name}} perdeu o acesso à plataforma.",
    toastUnblockTitle: "Empresa desbloqueada",
    toastUnblockDescription: "{{name}} voltou a acessar a plataforma.",
    toastDisconnectTitle: "WhatsApp desconectado",
    toastDisconnectDescription: "A instância de {{name}} precisará de um novo QR Code.",
    toastAlreadyDisconnectedTitle: "Instância já desconectada",
    toastAlreadyDisconnectedDescription: "{{name}} não possui conexão ativa no momento.",

    emptyTitle: "Nenhuma empresa encontrada",
    emptyDescription: "Ajuste a busca ou o filtro de status para ver resultados.",

    plansTitle: "Planos",
    plansSubtitle: "Catálogo comercial da plataforma",
    subscribers: "{{count}} assinantes",
    perMonth: "/mês",
    priceOnRequest: "Sob consulta",
    planToastOnTitle: "Plano ativado",
    planToastOnDescription: "{{name}} voltou a aceitar novas assinaturas.",
    planToastOffTitle: "Plano desativado",
    planToastOffDescription: "{{name}} não aceita novas assinaturas.",

    logTitle: "Eventos recentes",
    logSubtitle: "Última atividade registrada na plataforma",
  },
  en: {},
  es: {},
};
