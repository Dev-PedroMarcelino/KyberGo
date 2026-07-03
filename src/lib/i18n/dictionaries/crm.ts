import type { Namespace } from "../locales";

/** Strings do domínio "crm". Preenchido pelo módulo correspondente. */
export const crm: Namespace = {
  "pt-BR": {
    title: "CRM / Pipeline",
    subtitle: "Arraste os negócios entre os estágios e não deixe nenhuma venda esfriar.",
    dragHint: "Arraste os cards entre as colunas — no celular, toque e segure o card.",
    newDeal: "Novo negócio",

    // Barra de resumo
    pipelineTotal: "Total em pipeline",
    avgTicket: "Ticket médio",
    activeDeals: "Negócios ativos",

    // Estágios
    stageNewLead: "Novo lead",
    stageQualifying: "Em qualificação",
    stageQuoteSent: "Orçamento enviado",
    stageNegotiating: "Em negociação",
    stageWon: "Fechado",
    stageLost: "Perdido",
    stageMaintenance: "Manutenção futura",
    columnEmpty: "Solte um negócio aqui",

    // Card de negócio
    daysStalled: "{{days}}d parado",
    noCloseDate: "Sem previsão",

    // Toasts de movimentação
    wonToast: "Negócio fechado! 🎉",
    wonToastDesc: "{{title}} entrou para a coluna de fechados.",
    lostToast: "Negócio marcado como perdido",
    lostToastDesc: "{{title}} foi movido para Perdido.",

    // Modal de perda
    lostModalTitle: "Marcar como perdido",
    lostModalDescription: "Registre o motivo da perda para melhorar suas próximas propostas.",
    lostReasonLabel: "Motivo da perda",
    lostReasonPlaceholder: "Selecione o motivo",
    reasonPrice: "Preço alto",
    reasonCompetitor: "Concorrência",
    reasonPostponed: "Cliente adiou",
    reasonNoResponse: "Sem resposta",
    lostNoteLabel: "Detalhes (opcional)",
    lostNotePlaceholder: "Ex.: fechou com outra empresa por prazo de entrega...",
    confirmLost: "Confirmar perda",

    // Drawer de detalhes
    drawerTitle: "Detalhes do negócio",
    drawerCustomer: "Cliente",
    drawerValue: "Valor (R$)",
    drawerStage: "Estágio",
    drawerAssignee: "Responsável",
    drawerExpectedDate: "Data prevista de fechamento",
    drawerLostReason: "Motivo da perda",
    drawerQuote: "Orçamento vinculado",
    drawerOpenQuote: "Ver orçamento {{number}}",
    drawerNoQuote: "Nenhum orçamento vinculado a este negócio.",
    unassigned: "Sem responsável",
    scheduleFollowUp: "Agendar follow-up",
    followUpToast: "Follow-up agendado!",
    followUpToastDesc: "Vamos lembrar você de falar com {{name}} em 2 dias.",
    dealSaved: "Negócio atualizado!",
    dealSavedDesc: "As alterações de {{title}} foram salvas.",

    // Modal de novo negócio
    newDealTitle: "Novo negócio",
    newDealDescription: "Adicione uma oportunidade ao pipeline de vendas.",
    formTitle: "Título",
    formTitlePlaceholder: "Ex.: Instalação de calhas — Casa Jardins",
    formCustomer: "Cliente",
    formCustomerPlaceholder: "Selecione o cliente",
    formValue: "Valor (R$)",
    formValuePlaceholder: "0,00",
    formStage: "Estágio inicial",
    createDeal: "Criar negócio",
    formError: "Preencha título, cliente e valor.",
    dealCreated: "Negócio criado!",
    dealCreatedDesc: "{{title}} entrou no pipeline.",
  },
  en: {},
  es: {},
};
