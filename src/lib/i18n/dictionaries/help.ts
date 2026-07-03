import type { Namespace } from "../locales";

/** Strings do domínio "help" — central de ajuda, FAQ e suporte. */
export const help: Namespace = {
  "pt-BR": {
    title: "Central de ajuda",
    subtitle: "Guias, respostas rápidas e canais de suporte da equipe KyberGo.",

    // Status do sistema
    systemStatus: "Todos os sistemas operacionais",
    systemStatusHint: "WhatsApp, geração de PDFs e IA funcionando normalmente.",

    // Busca
    searchPlaceholder: "Buscar guias: ex. reconectar WhatsApp, editar critérios...",
    searchNoResultsTitle: "Nenhum guia encontrado",
    searchNoResultsDescription:
      "Tente outros termos ou abra um chamado — respondemos rápido.",
    clearSearch: "Limpar busca",

    // Categorias de guias
    catGettingStarted: "Primeiros passos",
    catWhatsapp: "WhatsApp",
    catQuotes: "Orçamentos",
    catPdf: "PDF",
    catCrm: "CRM",
    catAutomations: "Automações",
    catBilling: "Assinatura",
    readTime: "{{min}} min de leitura",
    openGuide: "Ler guia",
    guidesTitle: "Guias por categoria",

    // FAQ
    faqTitle: "Perguntas frequentes",
    faqSubtitle: "Dúvidas comuns do dia a dia, respondidas em segundos.",
    faq1Q: "Como reconecto o WhatsApp quando a instância cai?",
    faq1A:
      "Acesse WhatsApp no menu lateral e clique em \"Reconectar\". Um novo QR Code aparece na tela — escaneie com o celular da empresa em Aparelhos conectados. A reconexão leva menos de 1 minuto e as automações pendentes voltam a ser enviadas automaticamente.",
    faq2Q: "Como edito os critérios de cálculo de um tipo de orçamento?",
    faq2A:
      "Vá em Orçamentos → Tipos de orçamento, escolha o tipo e clique em \"Editar critérios\". Você pode alterar rótulos, valores por unidade e regras condicionais (ex.: acréscimo por altura). As mudanças valem apenas para orçamentos novos — os já enviados não são alterados.",
    faq3Q: "Como cancelo uma mensagem de follow-up agendada?",
    faq3A:
      "Em Automações → Mensagens agendadas, localize a mensagem e clique em \"Cancelar envio\". Você pode cancelar até o momento do disparo. Se preferir pausar todos os envios de um cliente, desative a automação no perfil dele na aba Clientes.",
    faq4Q: "Como adiciono um novo usuário à minha equipe?",
    faq4A:
      "Em Equipe, clique em \"Convidar usuário\", informe o e-mail e escolha o papel (Gerente ou Vendedor). O convidado recebe um link de acesso por e-mail. Fique de olho no limite do seu plano — o Professional inclui até 5 usuários.",
    faq5Q: "Como troco o template do PDF dos orçamentos?",
    faq5A:
      "Acesse Templates de PDF, escolha um dos estilos (moderno, clássico, minimalista ou executivo) e clique em \"Definir como padrão\". Você também pode personalizar cores, logo e seções. Todos os próximos orçamentos usarão o novo template automaticamente.",
    faq6Q: "Como exporto meus dados (clientes, orçamentos, conversas)?",
    faq6A:
      "Cada listagem (Clientes, Orçamentos, CRM) tem um botão \"Exportar CSV\" no topo. Para uma exportação completa da conta, abra um chamado — enviamos um pacote com todos os dados em até 48h. Seus dados são seus: exporte quando quiser, sem custo.",

    // Contato / suporte
    contactTitle: "Precisa falar com a gente?",
    contactDescription: "Nossa equipe de suporte responde em português, rapidinho.",
    supportEmailLabel: "E-mail de suporte",
    supportEmail: "suporte@kybergo.com.br",
    supportHoursLabel: "Horário de atendimento",
    supportHours: "Segunda a sexta, das 9h às 18h (horário de Brasília)",
    openTicket: "Abrir chamado",
    whatsappSupport: "Falar no WhatsApp",
    whatsappToast: "Abrindo o WhatsApp",
    whatsappToastDesc: "Você será atendido pela nossa equipe em instantes.",

    // Modal de chamado
    ticketModalTitle: "Abrir chamado",
    ticketModalDescription: "Descreva o problema e retornaremos por e-mail em até 4 horas úteis.",
    ticketSubject: "Assunto",
    ticketSubjectPlaceholder: "Ex.: PDF não está gerando com o logo",
    ticketDescriptionLabel: "Descrição",
    ticketDescriptionPlaceholder: "Conte o que aconteceu, em qual tela e desde quando...",
    ticketSubmit: "Enviar chamado",
    ticketSentToast: "Chamado aberto",
    ticketSentToastDesc: "Protocolo #{{protocol}}. Você receberá a resposta por e-mail.",
    ticketValidationToast: "Preencha os campos",
    ticketValidationToastDesc: "Assunto e descrição são obrigatórios.",
  },
  en: {},
  es: {},
};
