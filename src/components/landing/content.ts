/**
 * Conteúdo da landing page, estruturado por idioma.
 * pt-BR é o idioma canônico; en/es podem ser preenchidos quando a tradução
 * de marketing estiver pronta (fallback automático para pt-BR).
 */

import type { Locale } from "@/lib/i18n/locales";

export interface LandingContent {
  hero: {
    badge: string;
    titleLine1: string;
    titleHighlight: string;
    titleLine2: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: { value: number; suffix: string; label: string }[];
  };
  problem: {
    title: string;
    subtitle: string;
    pains: { title: string; description: string }[];
  };
  solution: {
    title: string;
    subtitle: string;
    steps: { title: string; description: string }[];
  };
  features: {
    title: string;
    subtitle: string;
    items: { title: string; description: string }[];
  };
  demo: {
    title: string;
    subtitle: string;
    segments: { id: string; label: string; emoji: string }[];
  };
  pricing: {
    title: string;
    subtitle: string;
    monthly: string;
    annual: string;
    annualDiscount: string;
    cta: string;
    ctaEnterprise: string;
    trialNote: string;
  };
  testimonials: {
    title: string;
    subtitle: string;
    items: { quote: string; name: string; role: string; company: string }[];
  };
  faq: {
    title: string;
    subtitle: string;
    items: { question: string; answer: string }[];
  };
  finalCta: {
    title: string;
    subtitle: string;
    button: string;
  };
  footer: {
    description: string;
    rights: string;
  };
}

const ptBR: LandingContent = {
  hero: {
    badge: "IA + WhatsApp + CRM em uma só plataforma",
    titleLine1: "Orçamentos profissionais",
    titleHighlight: "por IA",
    titleLine2: "direto no WhatsApp.",
    subtitle:
      "Transforme conversas em propostas, leads e vendas com poucos cliques. A IA pergunta, calcula, gera o PDF e registra o cliente no CRM — enquanto você cuida do serviço.",
    ctaPrimary: "Começar agora",
    ctaSecondary: "Ver demonstração",
    stats: [
      { value: 83, suffix: "%", label: "menos tempo por orçamento" },
      { value: 3, suffix: "x", label: "mais follow-ups realizados" },
      { value: 42, suffix: "%", label: "de taxa de conversão média" },
    ],
  },
  problem: {
    title: "Sua empresa perde dinheiro toda vez que um orçamento demora.",
    subtitle: "Se você é dono de uma empresa de serviços, essa rotina é familiar:",
    pains: [
      {
        title: "Só o dono sabe calcular",
        description: "Todo orçamento depende de você. Se está ocupado, o cliente espera — ou desiste.",
      },
      {
        title: "Equipe travada",
        description: "Funcionários não conseguem responder um pedido de orçamento sem consultar o dono.",
      },
      {
        title: "Orçamentos demoram dias",
        description: "Entre medir, calcular e montar a proposta, o concorrente chega primeiro.",
      },
      {
        title: "Leads somem no WhatsApp",
        description: "Conversas se perdem no meio de dezenas de chats. Ninguém registra, ninguém acompanha.",
      },
      {
        title: "Manutenções esquecidas",
        description: "Aquele cliente de 6 meses atrás precisava de revisão — mas ninguém lembrou de chamar.",
      },
      {
        title: "Zero follow-up",
        description: "Proposta enviada e... silêncio. Sem acompanhamento, a venda esfria e morre.",
      },
    ],
  },
  solution: {
    title: "O KyberGo resolve isso de ponta a ponta.",
    subtitle: "Configure uma vez. Venda para sempre.",
    steps: [
      {
        title: "A IA entende o serviço",
        description: "O cliente chama no WhatsApp e a IA identifica o que ele precisa — por texto ou áudio.",
      },
      {
        title: "Pergunta só o essencial",
        description: "Com base nos seus critérios, a IA coleta as informações que faltam. Sem perguntas inúteis.",
      },
      {
        title: "Calcula com as suas regras",
        description: "Metragem, material, altura, deslocamento, margem: sua lógica de preço vira sistema.",
      },
      {
        title: "Gera um PDF impecável",
        description: "Proposta com sua marca, suas cores e suas condições — pronta em segundos.",
      },
      {
        title: "Registra o lead no CRM",
        description: "Cliente e negócio criados automaticamente no pipeline. Nada se perde.",
      },
      {
        title: "Faz o follow-up sozinho",
        description: "Mensagens de acompanhamento e lembretes de manutenção agendados automaticamente.",
      },
    ],
  },
  features: {
    title: "Tudo o que sua operação de vendas precisa.",
    subtitle: "Uma plataforma completa — do primeiro contato à manutenção recorrente.",
    items: [
      { title: "Orçamentos por IA no WhatsApp", description: "A IA conversa com o cliente, coleta dados e gera a proposta na hora." },
      { title: "Documento simples por descrição", description: "Descreva o serviço e o valor — a IA organiza tudo em um PDF profissional." },
      { title: "Critérios configuráveis", description: "Codifique sua lógica de preço: por metro, por hora, por complexidade." },
      { title: "PDFs com a sua marca", description: "Templates profissionais com logo, cores, termos e assinatura." },
      { title: "CRM com Kanban", description: "Pipeline visual de vendas com arrastar e soltar, do lead ao fechamento." },
      { title: "Follow-up automático", description: "Mensagens de acompanhamento programadas para não deixar venda esfriar." },
      { title: "Histórico do cliente", description: "Todas as conversas, orçamentos e serviços em um só lugar." },
      { title: "Lembretes de manutenção", description: "O sistema avisa o cliente quando é hora da revisão — e você fatura de novo." },
      { title: "Multiusuário com permissões", description: "Dono, gerente e vendedores, cada um com o acesso certo." },
      { title: "Gestão de assinatura", description: "Planos flexíveis que crescem com a sua empresa." },
      { title: "Multi-idioma", description: "Português, inglês e espanhol prontos para uso." },
    ],
  },
  demo: {
    title: "Veja o KyberGo em ação no seu segmento.",
    subtitle: "Escolha um tipo de empresa e acompanhe a IA gerando um orçamento real.",
    segments: [
      { id: "calhas", label: "Empresa de calhas", emoji: "🏠" },
      { id: "ar", label: "Ar-condicionado", emoji: "❄️" },
      { id: "marcenaria", label: "Marcenaria", emoji: "🪚" },
      { id: "gesso", label: "Gesso e drywall", emoji: "🧱" },
    ],
  },
  pricing: {
    title: "Planos que se pagam no primeiro orçamento fechado.",
    subtitle: "Comece grátis por 14 dias. Sem cartão de crédito.",
    monthly: "Mensal",
    annual: "Anual",
    annualDiscount: "2 meses grátis",
    cta: "Começar teste grátis",
    ctaEnterprise: "Falar com vendas",
    trialNote: "14 dias grátis em todos os planos. Cancele quando quiser.",
  },
  testimonials: {
    title: "Empresas de serviço já vendem mais com o KyberGo.",
    subtitle: "Resultados reais de quem parou de perder orçamento no WhatsApp.",
    items: [
      {
        quote:
          "Antes eu passava as noites montando orçamento. Hoje a IA faz em 2 minutos enquanto estou na obra. Minha equipe fecha venda sem depender de mim.",
        name: "Ricardo Almeida",
        role: "Fundador",
        company: "Calhas ProTech — São Paulo/SP",
      },
      {
        quote:
          "Os lembretes de manutenção reativaram clientes que a gente nem lembrava mais. Foram 23 serviços recorrentes só no primeiro trimestre.",
        name: "Patrícia Lemos",
        role: "Sócia-diretora",
        company: "Clima Perfeito Ar-condicionado — Curitiba/PR",
      },
      {
        quote:
          "O PDF sai com a nossa marca, bonito de verdade. O cliente sente que está contratando uma empresa grande. A taxa de fechamento subiu 40%.",
        name: "Marcos Vinícius",
        role: "Proprietário",
        company: "MV Marcenaria Fina — Belo Horizonte/MG",
      },
    ],
  },
  faq: {
    title: "Perguntas frequentes",
    subtitle: "Tudo o que você precisa saber antes de começar.",
    items: [
      {
        question: "Como funciona a integração com o WhatsApp?",
        answer:
          "Cada empresa assinante recebe uma instância dedicada de WhatsApp. Você conecta seu número escaneando um QR code — em minutos a IA já está respondendo. Trabalhamos com camada adaptadora compatível com os principais provedores de API de WhatsApp do mercado.",
      },
      {
        question: "A IA é confiável para calcular preços?",
        answer:
          "No modo inteligente, a IA nunca inventa preço: ela aplica exatamente os critérios e regras que a sua empresa configurou (valor por metro, adicional por altura, deslocamento etc.). Você revisa tudo antes de enviar, se preferir. E no modo simples, quem define o valor é sempre você.",
      },
      {
        question: "Posso personalizar o PDF das propostas?",
        answer:
          "Sim. O editor de templates permite ajustar logo, cores, fontes, cabeçalho, rodapé, termos e condições, formas de pagamento, área de assinatura e marca d'água. Você pode manter múltiplos templates para ocasiões diferentes.",
      },
      {
        question: "Como cancelo minha assinatura?",
        answer:
          "Direto no painel, em Assinatura → Cancelar. Sem multa, sem ligação, sem burocracia. Seus dados ficam disponíveis para exportação por 90 dias após o cancelamento.",
      },
      {
        question: "Qual a diferença entre modo inteligente e modo simples?",
        answer:
          "No modo inteligente, você configura critérios de cálculo e a IA coleta dados e calcula o preço sozinha. No modo simples, você descreve o serviço e informa o valor manualmente — a IA apenas organiza tudo em uma proposta profissional. Dá para usar os dois modos na mesma conta.",
      },
      {
        question: "Meus dados estão seguros?",
        answer:
          "Sim. Cada empresa tem seus dados isolados (arquitetura multi-tenant com Row Level Security), criptografia em trânsito e em repouso, controle de acesso por papéis e trilha de auditoria completa.",
      },
      {
        question: "Quantos usuários posso ter?",
        answer:
          "Depende do plano: do Starter (1 usuário) ao Enterprise (ilimitado). Cada usuário tem papel e permissões próprias — dono, gerente ou vendedor.",
      },
      {
        question: "Como funcionam o CRM e as mensagens de follow-up?",
        answer:
          "Todo orçamento gerado cria automaticamente um lead no pipeline Kanban. As automações agendam mensagens de acompanhamento e lembretes de manutenção pelo WhatsApp — com calendário visual onde você pode revisar, reagendar ou cancelar qualquer mensagem antes do envio.",
      },
    ],
  },
  finalCta: {
    title: "Pare de perder orçamentos no WhatsApp.",
    subtitle: "Transforme atendimento em venda com o KyberGo. Configure em minutos, venda ainda hoje.",
    button: "Criar minha conta grátis",
  },
  footer: {
    description:
      "KyberGo é a plataforma de orçamentos por IA para empresas de serviço: propostas profissionais, CRM e follow-up automático, direto no WhatsApp.",
    rights: "Todos os direitos reservados.",
  },
};

export const LANDING_CONTENT: Record<Locale, LandingContent> = {
  "pt-BR": ptBR,
  // Traduções de marketing en/es: preencher quando o copy estiver aprovado.
  en: ptBR,
  es: ptBR,
};
