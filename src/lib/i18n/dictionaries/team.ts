import type { Namespace } from "../locales";

/** Strings do domínio "team" — equipe, convites e permissões. */
export const team: Namespace = {
  "pt-BR": {
    title: "Equipe e permissões",
    subtitle: "Convide sua equipe e controle o que cada papel pode fazer.",

    // Lista de membros
    membersTitle: "Membros da equipe",
    membersCount: "{{count}} membros",
    inviteUser: "Convidar usuário",
    roleOwner: "Proprietário",
    roleManager: "Gerente",
    roleSalesperson: "Vendedor",
    statusActive: "Ativo",
    statusPending: "Convite enviado",
    lastAccess: "Último acesso: {{date}}",
    neverAccessed: "Ainda não acessou",
    youBadge: "Você",

    // Modal de convite
    inviteModalTitle: "Convidar usuário",
    inviteModalDescription: "Enviaremos um e-mail com o link de acesso e a senha temporária.",
    inviteEmailLabel: "E-mail do convidado",
    inviteEmailPlaceholder: "nome@suaempresa.com.br",
    inviteRoleLabel: "Papel na equipe",
    roleOwnerDescription:
      "Acesso total: gerencia assinatura, equipe, configurações e todos os dados da empresa.",
    roleManagerDescription:
      "Gerencia orçamentos, clientes, CRM, automações, relatórios e configurações — sem acesso à assinatura.",
    roleSalespersonDescription:
      "Cria e acompanha orçamentos, clientes e negociações no CRM. Sem acesso a configurações.",
    sendInvite: "Enviar convite",
    inviteSentToast: "Convite enviado",
    inviteSentToastDesc: "{{email}} recebeu um e-mail para entrar na equipe.",
    inviteEmailInvalid: "Informe um e-mail válido.",
    inviteLimitToast: "Limite do plano atingido",
    inviteLimitToastDesc: "Seu plano permite até {{limit}} usuários. Faça upgrade para convidar mais.",

    // Ações por usuário
    memberActions: "Ações do membro",
    changeRole: "Alterar papel",
    resendInvite: "Reenviar convite",
    removeMember: "Remover da equipe",
    changeRoleModalTitle: "Alterar papel",
    changeRoleModalDescription: "Escolha o novo papel de {{name}} na equipe.",
    newRoleLabel: "Novo papel",
    saveRole: "Salvar papel",
    roleChangedToast: "Papel atualizado",
    roleChangedToastDesc: "{{name}} agora é {{role}}.",
    inviteResentToast: "Convite reenviado",
    inviteResentToastDesc: "Um novo e-mail foi enviado para {{email}}.",
    removeModalTitle: "Remover membro",
    removeModalDescription:
      "{{name}} perderá o acesso imediatamente. Os orçamentos e negociações criados por ele são preservados.",
    confirmRemove: "Remover membro",
    cancelRemove: "Cancelar",
    removedToast: "Membro removido",
    removedToastDesc: "{{name}} não tem mais acesso à conta.",
    cannotRemoveOwnerToast: "Ação não permitida",
    cannotRemoveOwnerToastDesc: "O Proprietário da conta não pode ser removido.",

    // Limite do plano
    limitTitle: "Limite de usuários do plano",
    limitDescription: "{{used}} de {{limit}} usuários em uso no plano Professional.",
    limitUpgradeHint: "Precisa de mais assentos? Faça upgrade para o Business e tenha até 15 usuários.",
    limitUpgradeCta: "Ver planos",

    // Matriz de permissões
    permissionsTitle: "Permissões por papel",
    permissionsSubtitle: "O que cada papel pode acessar dentro do KyberGo.",
    permResource: "Recurso",
    permQuotes: "Orçamentos",
    permCustomers: "Clientes",
    permCrm: "CRM",
    permAutomations: "Automações",
    permReports: "Relatórios",
    permSettings: "Configurações",
    permBilling: "Assinatura",
    permAllowed: "Permitido",
    permDenied: "Sem acesso",
  },
  en: {},
  es: {},
};
