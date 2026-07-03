import type { Namespace } from "../locales";

/** Strings do domínio "pdf": editor de templates, preview e documento renderizado. */
export const pdf: Namespace = {
  "pt-BR": {
    /* ---------- Página: editor de templates ---------- */
    templatesTitle: "Templates de PDF",
    templatesSubtitle: "Personalize a aparência das propostas enviadas aos seus clientes.",
    newTemplate: "Novo template",
    newTemplateName: "Template personalizado {{n}}",
    newTemplateToastTitle: "Template criado!",
    newTemplateToastDesc: "\"{{name}}\" foi criado a partir do template padrão.",
    copySuffix: "(cópia)",
    duplicatedToastTitle: "Template duplicado!",
    duplicatedToastDesc: "\"{{name}}\" está pronto para ser editado.",
    savedToastTitle: "Template salvo!",
    savedToastDesc: "As alterações de \"{{name}}\" foram aplicadas.",
    downloadTest: "Baixar PDF de teste",
    downloadToastTitle: "Geração de PDF em modo demonstração",
    downloadToastDesc: "A geração do arquivo estará disponível na versão conectada.",
    fullPreview: "Pré-visualizar em tela cheia",
    livePreview: "Pré-visualização ao vivo",
    previewHint: "O documento é atualizado em tempo real conforme você edita os controles.",

    /* Grupos de controles */
    styleSection: "Estilo",
    brandSection: "Marca",
    sectionsSection: "Seções",
    textsSection: "Textos",
    defaultSection: "Padrão",

    /* Estilos de layout */
    style_moderno: "Moderno",
    style_classico: "Clássico",
    style_minimalista: "Minimalista",
    style_executivo: "Executivo",
    styleDesc_moderno: "Barra lateral colorida com logo em destaque.",
    styleDesc_classico: "Cabeçalho centrado com linha dupla tradicional.",
    styleDesc_minimalista: "Somente tipografia, visual limpo e direto.",
    styleDesc_executivo: "Faixa escura de ponta a ponta, tom corporativo.",

    /* Marca */
    logoLabel: "Logo da empresa",
    logoUpload: "Enviar logo",
    logoRemove: "Remover",
    logoHint: "PNG ou SVG com fundo transparente. Sem logo, usamos um monograma com as iniciais.",
    logoUploadedTitle: "Logo atualizado!",
    logoUploadedDesc: "A nova imagem já aparece no preview do documento.",
    primaryColor: "Cor primária",
    accentColor: "Cor de destaque",
    fontLabel: "Fonte do documento",

    /* Seções do documento */
    sec_header: "Cabeçalho",
    sec_companyData: "Dados da empresa",
    sec_clientData: "Dados do cliente",
    sec_itemsTable: "Tabela de itens",
    sec_paymentTerms: "Condições de pagamento",
    sec_terms: "Termos e condições",
    sec_signature: "Área de assinatura",
    sec_footer: "Rodapé",
    sec_qrCode: "QR code de validação",
    sec_watermark: "Marca d'água",

    /* Textos */
    termsLabel: "Termos e condições",
    termsPlaceholder: "Ex.: Orçamento válido por 15 dias. Garantia de 12 meses...",
    footerLabel: "Texto do rodapé",
    footerPlaceholder: "Ex.: Razão social — CNPJ — telefone — e-mail",

    /* Padrão */
    defaultLabel: "Template padrão",
    defaultHint: "Usado automaticamente em todas as propostas geradas pela IA.",

    /* ---------- Página: pré-visualização ---------- */
    previewTitle: "Pré-visualizar PDF",
    previewSubtitle: "Veja a proposta final exatamente como o seu cliente vai receber.",
    editTemplate: "Editar template",
    quoteLabel: "Orçamento",
    templateLabel: "Template",
    zoom50: "50%",
    zoom75: "75%",
    zoom100: "100%",
    zoomFit: "Ajustar",
    pageOf: "Página {{current}} de {{total}}",
    generateFinal: "Gerar PDF final",
    generatingTitle: "Gerando PDF...",
    genStep1: "Estruturando proposta",
    genStep2: "Aplicando marca",
    genStep3: "Renderizando páginas",
    genSuccessTitle: "PDF gerado com sucesso!",
    genSuccessDesc: "A proposta {{number}} está pronta para envio pelo WhatsApp.",

    /* ---------- Documento renderizado (folha A4) ---------- */
    docProposalLabel: "Proposta comercial",
    docWatermark: "PROPOSTA",
    docQuoteNumber: "Orçamento nº",
    docIssueDate: "Emissão",
    docValidUntil: "Válido até",
    docClientData: "Dados do cliente",
    docCompanyData: "Dados da empresa",
    docColItem: "Descrição",
    docColQty: "Qtd.",
    docColUnit: "Un.",
    docColUnitPrice: "Valor unit.",
    docColTotal: "Total",
    docSubtotal: "Subtotal",
    docDiscount: "Desconto",
    docTotal: "Total",
    docPaymentTerms: "Condições de pagamento",
    docTerms: "Termos e condições",
    docSignatureCompany: "Empresa",
    docSignatureClient: "Cliente",
    docQrTitle: "Validação online",
    docQrCaption: "Escaneie para conferir a autenticidade desta proposta.",
  },
  en: {},
  es: {},
};
