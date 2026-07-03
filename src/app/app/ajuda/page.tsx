"use client";

/**
 * Central de ajuda — busca de guias, FAQ e canais de suporte.
 * O conteúdo longo dos guias vive em constante local tipada (é conteúdo, não UI chrome);
 * rótulos, botões e FAQ vêm do namespace "help" do i18n.
 */

import React, { useMemo, useState } from "react";
import {
  Clock,
  CreditCard,
  FileText,
  KanbanSquare,
  LifeBuoy,
  Mail,
  MessageCircle,
  Palette,
  Rocket,
  Search,
  Send,
  Zap,
} from "lucide-react";
import { PageTransition, Reveal, StaggerContainer, staggerItem } from "@/components/motion";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Accordion, EmptyState } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/lib/i18n";

/* ---------------- Conteúdo dos guias (pt-BR, modo demo) ---------------- */

type GuideCategory =
  | "gettingStarted"
  | "whatsapp"
  | "quotes"
  | "pdf"
  | "crm"
  | "automations"
  | "billing";

interface HelpGuide {
  id: string;
  category: GuideCategory;
  title: string;
  description: string;
  readMinutes: number;
  paragraphs: string[];
}

const HELP_GUIDES: HelpGuide[] = [
  {
    id: "gd_setup",
    category: "gettingStarted",
    title: "Configure sua conta em 15 minutos",
    description: "Do cadastro ao primeiro orçamento enviado: o caminho completo de configuração.",
    readMinutes: 5,
    paragraphs: [
      "Depois de criar a conta, o KyberGo guia você por quatro etapas: dados da empresa, conexão do WhatsApp, criação do primeiro tipo de orçamento e personalização do PDF. Reserve 15 minutos e tenha em mãos o celular da empresa (para escanear o QR Code) e a tabela de preços dos seus serviços.",
      "Comece em Configurações → Empresa preenchendo nome, segmento, telefone e endereço — essas informações aparecem automaticamente nos PDFs e nas mensagens da IA. Em seguida, envie seu logo e escolha a cor da marca: os orçamentos ficam com a cara do seu negócio sem precisar de designer.",
      "Por fim, crie um tipo de orçamento com os critérios que você já usa no dia a dia (metros, tipo de material, altura, deslocamento). A IA usa exatamente essas regras para calcular os valores nas conversas. Feito isso, mande um \"oi\" do seu celular pessoal para o número conectado e veja o assistente em ação.",
    ],
  },
  {
    id: "gd_dashboard",
    category: "gettingStarted",
    title: "Entendendo o painel e as métricas",
    description: "O que significam orçamentos do mês, taxa de conversão, uso de IA e funil de vendas.",
    readMinutes: 4,
    paragraphs: [
      "O dashboard resume a saúde comercial da sua empresa. \"Orçamentos do mês\" conta todas as propostas geradas (pela IA ou manualmente); \"Taxa de conversão\" mostra quantas viraram serviço fechado. As setas de crescimento comparam sempre com o mês anterior, para você saber se está acelerando ou desacelerando.",
      "Os medidores de uso (PDFs, conversas de WhatsApp e créditos de IA) acompanham o consumo do seu plano no ciclo atual. Quando algum indicador passa de 75%, ele fica âmbar; acima de 90%, vermelho — é o sinal de que vale considerar um upgrade antes de bater no limite.",
      "O funil de conversão mostra onde os leads param: se muitos chegam a \"Orçamento enviado\" mas poucos fecham, ative as automações de follow-up. Empresas que respondem em até 2 dias após o envio aumentam a conversão de forma consistente.",
    ],
  },
  {
    id: "gd_wa_connect",
    category: "whatsapp",
    title: "Conecte seu WhatsApp pela primeira vez",
    description: "Passo a passo do QR Code, boas práticas de número e o que evitar para não cair.",
    readMinutes: 4,
    paragraphs: [
      "Acesse WhatsApp no menu lateral e clique em \"Conectar\". Um QR Code aparece na tela: no celular da empresa, abra o WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho e escaneie o código. Em segundos a instância fica verde e a IA já começa a responder.",
      "Use preferencialmente um número comercial dedicado ao atendimento, com o WhatsApp Business instalado. Evite conectar e desconectar o mesmo número em várias plataformas ao mesmo tempo — isso pode derrubar a sessão e, em casos extremos, gerar restrições da Meta.",
      "Mantenha o celular com bateria e internet estáveis: a conexão usa o modo multi-aparelhos do WhatsApp, então o telefone não precisa ficar ligado o tempo todo, mas precisa se conectar à rede periodicamente para renovar a sessão.",
    ],
  },
  {
    id: "gd_wa_reconnect",
    category: "whatsapp",
    title: "O que fazer quando a conexão cai",
    description: "Diagnóstico rápido, reconexão em 1 minuto e o que acontece com as mensagens pendentes.",
    readMinutes: 3,
    paragraphs: [
      "Quando a instância desconecta, o painel mostra o status vermelho e você recebe uma notificação. As causas mais comuns são: sessão encerrada pelo celular (em Aparelhos conectados), troca de aparelho ou longos períodos sem internet no telefone.",
      "Para reconectar, abra a página WhatsApp e clique em \"Reconectar\". Escaneie o novo QR Code com o celular da empresa — o processo é idêntico ao da primeira conexão e leva menos de um minuto. Não é preciso reconfigurar nada: tipos de orçamento, automações e histórico permanecem intactos.",
      "As mensagens automáticas que estavam agendadas durante a queda não são perdidas: elas ficam em fila e são enviadas assim que a conexão volta. Conversas recebidas no período aparecem no histórico na próxima sincronização.",
    ],
  },
  {
    id: "gd_quote_type",
    category: "quotes",
    title: "Crie um tipo de orçamento inteligente",
    description: "Critérios, regras de cálculo e como a IA usa tudo isso para orçar sozinha.",
    readMinutes: 6,
    paragraphs: [
      "Um tipo de orçamento inteligente é a \"receita\" que a IA segue para orçar um serviço. Em Orçamentos → Tipos de orçamento, defina os critérios que você perguntaria a um cliente: metros lineares, tipo de material, altura do telhado, distância de deslocamento. Cada critério pode ser número, seleção, texto ou sim/não.",
      "Nas regras de cálculo, escreva como cada resposta afeta o preço — por exemplo, \"metros × 45\" para calha lisa ou \"acima de 6 m: +20% de mão de obra\". A IA conduz a conversa no WhatsApp, coleta as respostas (inclusive por áudio) e aplica as regras automaticamente, sem você digitar nada.",
      "Dica: comece com poucos critérios obrigatórios e refine com o tempo. Se um orçamento exigir visita técnica, oriente a IA nas instruções extras (Configurações → IA) a agendar a visita em vez de fechar o valor na hora.",
    ],
  },
  {
    id: "gd_quote_modes",
    category: "quotes",
    title: "Modo inteligente vs. modo simples",
    description: "Quando deixar a IA calcular e quando descrever o orçamento manualmente.",
    readMinutes: 3,
    paragraphs: [
      "No modo inteligente, a IA entrevista o cliente, aplica suas regras de cálculo e gera o PDF sozinha — ideal para serviços padronizados como instalação por metro linear ou manutenção com preço tabelado. É o modo que gera orçamentos em menos de 2 minutos, a qualquer hora do dia.",
      "No modo simples (documento livre), você descreve os itens e valores manualmente e o KyberGo cuida do resto: formata o PDF profissional com a sua marca, envia pelo WhatsApp e registra tudo no CRM. Use-o para serviços fora do padrão, reformas complexas ou quando o preço sai de uma visita técnica.",
      "Os dois modos convivem na mesma conta: mantenha os serviços recorrentes no inteligente e deixe o simples para exceções. Nos relatórios, você compara a conversão de cada modo e descobre onde vale padronizar mais.",
    ],
  },
  {
    id: "gd_pdf_brand",
    category: "pdf",
    title: "Personalize o PDF com a sua marca",
    description: "Logo, cores, seções e templates — proposta profissional sem precisar de designer.",
    readMinutes: 4,
    paragraphs: [
      "Em Templates de PDF você escolhe entre quatro estilos (moderno, clássico, minimalista e executivo) e personaliza cores, fonte, logo e rodapé. O template padrão é aplicado automaticamente a todos os orçamentos novos — trocar leva um clique em \"Definir como padrão\".",
      "Cada seção do documento pode ser ligada ou desligada: dados da empresa, dados do cliente, tabela de itens, condições de pagamento, termos, assinatura e QR Code de aprovação. Empresas que incluem o QR Code costumam receber aprovações mais rápido, porque o cliente aceita a proposta direto do celular.",
      "Nos termos, inclua garantia, validade do orçamento e condições de visita técnica. Esses textos são reaproveitados em todas as propostas, garantindo consistência jurídica sem retrabalho.",
    ],
  },
  {
    id: "gd_crm_kanban",
    category: "crm",
    title: "Organize seu funil no Kanban",
    description: "Estágios, arrastar e soltar, motivos de perda e a coluna de manutenção.",
    readMinutes: 5,
    paragraphs: [
      "O CRM do KyberGo é um quadro Kanban: cada card é uma negociação e cada coluna, um estágio do funil. Orçamentos gerados pela IA viram cards automaticamente (se a opção estiver ativa em Configurações → CRM), já com valor, cliente e responsável preenchidos.",
      "Arraste os cards conforme a negociação evolui. Ao mover para \"Perdido\", registre o motivo — esse dado alimenta os relatórios e mostra se você está perdendo por preço, prazo ou concorrência. Ao mover para \"Fechado\", a automação de agradecimento e o lembrete de manutenção futura são agendados sozinhos.",
      "A coluna de manutenção é o seu caixa recorrente: clientes com serviço concluído entram nela quando a data de manutenção preventiva se aproxima, e a IA envia o lembrete na hora certa. É venda nova sem custo de aquisição.",
    ],
  },
  {
    id: "gd_automations",
    category: "automations",
    title: "Follow-ups automáticos que vendem",
    description: "Gatilhos, atrasos e templates de mensagem — venda mais sem perseguir cliente.",
    readMinutes: 5,
    paragraphs: [
      "Uma automação combina três coisas: um gatilho (orçamento enviado, negócio fechado, manutenção próxima, sem resposta), um atraso em dias e um template de mensagem. Exemplo clássico: 2 dias após enviar o orçamento, perguntar se ficou alguma dúvida — simples e responsável por boa parte das conversões recuperadas.",
      "Os templates aceitam variáveis como {{customer_name}}, {{company_name}} e {{service_name}}, preenchidas automaticamente no envio. Escreva como você falaria no WhatsApp: mensagens curtas, pessoais e com uma pergunta clara no final performam melhor que textos formais.",
      "Todas as mensagens agendadas ficam visíveis em Automações → Mensagens agendadas, onde você pode cancelar qualquer envio antes do disparo. Clientes específicos podem ter as automações desativadas individualmente no cadastro, útil para quem pediu para não receber mensagens automáticas.",
    ],
  },
  {
    id: "gd_billing",
    category: "billing",
    title: "Planos, limites e como fazer upgrade",
    description: "O que conta em cada limite, quando fazer upgrade e como funciona o pró-rata.",
    readMinutes: 4,
    paragraphs: [
      "Cada plano define limites mensais de usuários, PDFs gerados, conversas de WhatsApp e créditos de IA. Uma \"conversa\" conta uma vez por cliente a cada 24 horas, independentemente do número de mensagens trocadas. Os contadores zeram no início de cada ciclo de cobrança.",
      "Acompanhe o consumo em Assinatura → Uso do plano. Quando um indicador passa de 75%, considere o upgrade: a mudança é imediata e o valor é cobrado pró-rata — você paga apenas a diferença proporcional aos dias restantes do ciclo, sem taxa extra.",
      "No plano anual, você leva 2 meses grátis em relação ao mensal. E se precisar reduzir, o downgrade vale a partir do ciclo seguinte, com crédito proporcional aplicado na próxima fatura. Cancelamentos preservam seus dados por 90 dias.",
    ],
  },
];

const CATEGORY_ORDER: GuideCategory[] = [
  "gettingStarted",
  "whatsapp",
  "quotes",
  "pdf",
  "crm",
  "automations",
  "billing",
];

const CATEGORY_ICONS: Record<GuideCategory, React.ReactNode> = {
  gettingStarted: <Rocket className="h-5 w-5" />,
  whatsapp: <MessageCircle className="h-5 w-5" />,
  quotes: <FileText className="h-5 w-5" />,
  pdf: <Palette className="h-5 w-5" />,
  crm: <KanbanSquare className="h-5 w-5" />,
  automations: <Zap className="h-5 w-5" />,
  billing: <CreditCard className="h-5 w-5" />,
};

const CATEGORY_LABEL_KEYS: Record<GuideCategory, string> = {
  gettingStarted: "help.catGettingStarted",
  whatsapp: "help.catWhatsapp",
  quotes: "help.catQuotes",
  pdf: "help.catPdf",
  crm: "help.catCrm",
  automations: "help.catAutomations",
  billing: "help.catBilling",
};

const FAQ_KEYS = [1, 2, 3, 4, 5, 6] as const;

export default function AjudaPage() {
  const { t } = useI18n();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [openGuide, setOpenGuide] = useState<HelpGuide | null>(null);
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");

  const filteredGuides = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return HELP_GUIDES;
    return HELP_GUIDES.filter((guide) => {
      const category = t(CATEGORY_LABEL_KEYS[guide.category]).toLowerCase();
      return (
        guide.title.toLowerCase().includes(query) ||
        guide.description.toLowerCase().includes(query) ||
        category.includes(query)
      );
    });
  }, [search, t]);

  const submitTicket = () => {
    if (!ticketSubject.trim() || !ticketDescription.trim()) {
      toast("error", t("help.ticketValidationToast"), t("help.ticketValidationToastDesc"));
      return;
    }
    const protocol = Math.floor(10000 + Math.random() * 90000);
    toast("success", t("help.ticketSentToast"), t("help.ticketSentToastDesc", { protocol }));
    setTicketOpen(false);
    setTicketSubject("");
    setTicketDescription("");
  };

  return (
    <PageTransition>
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("help.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("help.subtitle")}</p>
        </div>
      </div>

      {/* Status do sistema */}
      <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-kyber-green/25 bg-kyber-green/[0.06] px-4 py-3">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-kyber-green opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-kyber-green" />
        </span>
        <p className="text-sm font-medium text-kyber-green">{t("help.systemStatus")}</p>
        <p className="text-xs text-kyber-gray">{t("help.systemStatusHint")}</p>
      </div>

      {/* Busca */}
      <div className="mb-10">
        <Input
          icon={<Search className="h-5 w-5" />}
          placeholder={t("help.searchPlaceholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-14 rounded-2xl text-base"
        />
      </div>

      {/* Guias por categoria */}
      {filteredGuides.length === 0 ? (
        <EmptyState
          icon={<LifeBuoy className="h-8 w-8" />}
          title={t("help.searchNoResultsTitle")}
          description={t("help.searchNoResultsDescription")}
          action={
            <Button variant="secondary" onClick={() => setSearch("")}>
              {t("help.clearSearch")}
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {CATEGORY_ORDER.map((category) => {
            const guides = filteredGuides.filter((g) => g.category === category);
            if (guides.length === 0) return null;
            return (
              <section key={category}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-kyber-green">{CATEGORY_ICONS[category]}</span>
                  <h2 className="font-display text-lg font-semibold text-kyber-white">
                    {t(CATEGORY_LABEL_KEYS[category])}
                  </h2>
                </div>
                <StaggerContainer className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {guides.map((guide) => (
                    <motion.button
                      key={guide.id}
                      variants={staggerItem}
                      onClick={() => setOpenGuide(guide)}
                      className="focus-ring glass-card group flex flex-col p-5 text-left transition-shadow duration-300 hover:shadow-card-hover"
                    >
                      <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-kyber-green/10 text-kyber-green">
                        {CATEGORY_ICONS[guide.category]}
                      </span>
                      <h3 className="font-display text-base font-semibold text-kyber-white transition-colors group-hover:text-kyber-green">
                        {guide.title}
                      </h3>
                      <p className="mt-1.5 flex-1 text-sm leading-relaxed text-kyber-gray">{guide.description}</p>
                      <span className="mt-4 flex items-center gap-1.5 text-xs text-kyber-dim">
                        <Clock className="h-3.5 w-3.5" />
                        {t("help.readTime", { min: guide.readMinutes })}
                      </span>
                    </motion.button>
                  ))}
                </StaggerContainer>
              </section>
            );
          })}
        </div>
      )}

      {/* FAQ + contato */}
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Reveal className="lg:col-span-2">
          <h2 className="font-display text-lg font-semibold text-kyber-white">{t("help.faqTitle")}</h2>
          <p className="mt-1 text-sm text-kyber-gray">{t("help.faqSubtitle")}</p>
          <div className="mt-4 space-y-3">
            {FAQ_KEYS.map((n) => (
              <Accordion key={n} title={t(`help.faq${n}Q`)}>
                {t(`help.faq${n}A`)}
              </Accordion>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <Card className="sticky top-6">
            <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-kyber-green/10 text-kyber-green">
              <LifeBuoy className="h-6 w-6" />
            </span>
            <CardTitle>{t("help.contactTitle")}</CardTitle>
            <CardDescription>{t("help.contactDescription")}</CardDescription>

            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-start gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-kyber-green" />
                <div>
                  <p className="text-xs text-kyber-dim">{t("help.supportEmailLabel")}</p>
                  <p className="font-medium text-kyber-soft">{t("help.supportEmail")}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-kyber-green" />
                <div>
                  <p className="text-xs text-kyber-dim">{t("help.supportHoursLabel")}</p>
                  <p className="font-medium text-kyber-soft">{t("help.supportHours")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button className="w-full" onClick={() => setTicketOpen(true)}>
                <Send className="h-4 w-4" />
                {t("help.openTicket")}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toast("info", t("help.whatsappToast"), t("help.whatsappToastDesc"))}
              >
                <MessageCircle className="h-4 w-4" />
                {t("help.whatsappSupport")}
              </Button>
            </div>
          </Card>
        </Reveal>
      </div>

      {/* Modal do guia */}
      <Modal
        open={openGuide !== null}
        onClose={() => setOpenGuide(null)}
        title={openGuide?.title}
        className="max-w-2xl"
      >
        {openGuide && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <Badge tone="green">{t(CATEGORY_LABEL_KEYS[openGuide.category])}</Badge>
              <Badge tone="gray">
                <Clock className="h-3 w-3" />
                {t("help.readTime", { min: openGuide.readMinutes })}
              </Badge>
            </div>
            <div className="space-y-4">
              {openGuide.paragraphs.map((paragraph, i) => (
                <p key={i} className="text-sm leading-relaxed text-kyber-gray">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setOpenGuide(null)}>
                {t("common.close")}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de chamado */}
      <Modal
        open={ticketOpen}
        onClose={() => setTicketOpen(false)}
        title={t("help.ticketModalTitle")}
        description={t("help.ticketModalDescription")}
      >
        <div className="space-y-4">
          <Input
            label={t("help.ticketSubject")}
            placeholder={t("help.ticketSubjectPlaceholder")}
            value={ticketSubject}
            onChange={(e) => setTicketSubject(e.target.value)}
          />
          <Textarea
            label={t("help.ticketDescriptionLabel")}
            placeholder={t("help.ticketDescriptionPlaceholder")}
            value={ticketDescription}
            onChange={(e) => setTicketDescription(e.target.value)}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={() => setTicketOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={submitTicket}>
              <Send className="h-4 w-4" />
              {t("help.ticketSubmit")}
            </Button>
          </div>
        </div>
      </Modal>
    </PageTransition>
  );
}
