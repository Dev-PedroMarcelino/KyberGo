# KyberGo

**Orçamentos profissionais por IA, direto no WhatsApp.**
Transforme conversas em propostas, leads e vendas com poucos cliques.

O KyberGo é uma plataforma SaaS B2B premium para empresas de serviço (calhas, ar-condicionado, marcenaria, gesso, manutenção e instalações em geral) que precisam gerar orçamentos profissionais, propostas em PDF, registros de CRM, mensagens de follow-up e automações de venda através de IA e WhatsApp.

---

## Como rodar

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm build      # build de produção
```

Sem credenciais configuradas, a plataforma roda em **modo demonstração** com dados de exemplo completos (empresa fictícia "Calhas ProTech"). Para ativar o banco real, copie `.env.example` para `.env.local`, preencha as credenciais do Supabase e aplique a migration de `supabase/migrations/0001_initial_schema.sql`. Nenhuma tela precisa mudar.

---

## 1. Visão geral da solução

O KyberGo ataca a dor central das empresas de serviço: **o dono é o único que sabe calcular orçamentos**, os orçamentos demoram, os leads se perdem no WhatsApp e as oportunidades de manutenção são esquecidas.

A solução tem dois modos de geração de orçamento:

- **Modo Inteligente** — a empresa configura critérios de cálculo (metragem, material, altura, deslocamento, margem, desconto, intervalo de manutenção). A IA conversa com o cliente no WhatsApp (texto ou áudio transcrito), pergunta apenas o que falta, aplica as regras, gera a proposta em PDF, cria o lead no CRM e agenda o follow-up.
- **Modo Documento Simples** — o usuário descreve livremente o serviço e informa os valores ("10 metros de calha lisa + instalação, R$ 1.500, 2x, cliente João Silva"). A IA organiza o conteúdo profissionalmente e gera o PDF. **Neste modo a IA nunca calcula nem inventa preço** — o valor é sempre o informado.

Ao redor desses dois modos, a plataforma entrega: CRM Kanban, automações de follow-up e manutenção com calendário, templates de mensagem com variáveis, editor visual de PDF com preview em tempo real, relatórios, gestão de equipe com papéis, assinaturas com 4 planos, painel do dono da plataforma e integração WhatsApp com camada adaptadora agnóstica de provedor.

## 2. Arquitetura proposta

```
Next.js 15 (App Router, TypeScript)
├── Frontend (Client Components + Tailwind + Framer Motion)
│   ├── Landing pública, autenticação, onboarding
│   └── Dashboard multi-tenant (/app/*) + painel da plataforma (/admin)
├── API Routes (route handlers)
│   ├── /api/webhooks/whatsapp   ← mensagens recebidas (validação de assinatura)
│   ├── /api/webhooks/billing    ← eventos de assinatura (ativa/atrasa/cancela)
│   └── /api/quotes/generate     ← geração de orçamento via web
├── Camada de serviços e integrações (src/lib/integrations)
│   ├── whatsapp.ts   → WhatsAppProvider (adapter genérico: Z-API/UAZ/AZ/custom)
│   ├── ai.ts         → AiProvider (extração de orçamento, transcrição de áudio)
│   └── billing.ts    → BillingProvider (Stripe/Pagar.me/Asaas/custom)
└── Supabase (PostgreSQL + Auth + Storage)
    ├── Migration completa em supabase/migrations/0001_initial_schema.sql
    ├── RLS multi-tenant: toda tabela filtrada por company_id
    └── Funções auth_company_id() e auth_is_super_admin()
```

**Modo demo → produção:** `isSupabaseConfigured()` (em `src/lib/supabase/client.ts`) decide a origem dos dados. Sem env vars, a UI consome `src/lib/mock/data.ts`; com env vars, o Supabase assume. Os providers de WhatsApp/IA/billing seguem o mesmo padrão (implementação mock por padrão, real quando as variáveis existem).

**Segurança:** isolamento por tenant via RLS; service role usada apenas em webhooks (sempre com filtro explícito de `company_id`); verificação de assinatura em todos os webhooks; verificação de status da assinatura antes de responder mensagens; trilha de auditoria (`audit_logs`); papéis `super_admin`, `company_owner`, `company_manager`, `salesperson`.

## 3. Design system

Paleta (Tailwind, prefixo `kyber-`): preto profundo `#050806`, preto rico `#0B0F0C`, verde primário `#00E676`, verde profundo `#00A85A`, verde neon `#39FF88`, menta `#D9FFE8`, cinza texto `#A7B0AA`, bordas `rgba(255,255,255,0.10)`, vidro `rgba(255,255,255,0.06)`.

Tipografia: **Space Grotesk** (títulos, `font-display`) + **Inter** (corpo, `font-sans`), via `next/font`.

Superfícies: glassmorphism (`.glass`, `.glass-card`), gradientes sutis (`bg-gradient-hero`, `bg-gradient-green`), texto com gradiente animado (`.text-gradient-animated`), brilhos (`shadow-glow-*`, `.glow-orb`), grade de fundo (`.bg-grid`).

Componentes (`src/components/ui/`): Button (6 variantes), Input/Textarea/Select, Card/GlassCard, Badge, Modal/Drawer, Toast, Tabs, Accordion, Tooltip, Progress, Stepper, Skeleton, EmptyState, Switch, Avatar, MetricCard, Dropdown. Animação (`src/components/motion.tsx`): Reveal (scroll), StaggerContainer, AnimatedCounter, PageTransition. Simulação de chat WhatsApp reutilizável (`chat-simulation.tsx`).

## 4. Mapa de telas

| Rota | Tela |
| --- | --- |
| `/` | Landing page (hero animado, problema, solução, carrossel, demo interativa por segmento, planos, depoimentos, FAQ, CTA final) |
| `/login`, `/cadastro`, `/recuperar-senha` | Autenticação split-screen com prova social e simulação de chat |
| `/onboarding` | Wizard de 8 etapas (identidade → WhatsApp → modo → critérios → PDF → CRM → automações → revisão com confete) |
| `/app` | Dashboard: métricas, gráficos, funil, uso do plano, follow-ups, manutenções |
| `/app/orcamentos` | Lista de orçamentos com filtros |
| `/app/orcamentos/inteligente` | Gerador por IA com conversa guiada por critérios |
| `/app/orcamentos/simples` | Gerador por descrição livre (valores manuais) |
| `/app/orcamentos/tipos` | Tipos de orçamento + construtor de critérios |
| `/app/orcamentos/[id]` | Detalhe do orçamento com preview do documento |
| `/app/clientes`, `/app/clientes/[id]` | Lista e perfil do cliente (histórico, orçamentos, conversas, notas) |
| `/app/crm` | Kanban drag-and-drop com 7 estágios |
| `/app/automacoes` | Regras de follow-up e manutenção |
| `/app/automacoes/calendario` | Calendário de mensagens (cancelar/reagendar) |
| `/app/mensagens` | Templates de mensagem com variáveis e preview |
| `/app/whatsapp` | Instância, QR code, status, logs de conversa |
| `/app/pdf/templates` | Editor visual de templates de PDF |
| `/app/pdf/preview` | Pré-visualização interativa do PDF |
| `/app/relatorios` | Analytics: receita, conversão, perdas, ranking |
| `/app/equipe` | Usuários, convites, papéis e matriz de permissões |
| `/app/assinatura` | Plano atual, uso, upgrade/downgrade, faturas, cancelamento |
| `/app/configuracoes` | Empresa, IA, idioma, CRM, notificações, segurança |
| `/app/ajuda` | Central de ajuda com guias e FAQ |
| `/admin` | Painel do dono da plataforma (empresas, MRR, planos, eventos) |
| `/bloqueado`, `/trial-expirado` | Estados de conta com CTA de reativação |

## 5. Fluxos principais

1. **Orçamento via WhatsApp (inteligente):** cliente manda mensagem/áudio → webhook valida assinatura → identifica empresa e verifica assinatura ativa → transcreve áudio → IA coleta critérios faltantes → calcula pelas regras → gera PDF com template da empresa → envia pelo WhatsApp → cria cliente + lead no CRM → agenda follow-up.
2. **Documento simples:** usuário descreve serviço e valores → IA estrutura itens (sem calcular preço) → pergunta apenas o essencial ausente (ex.: valor total) → gera PDF → salva e vincula cliente.
3. **Assinatura:** cadastro → trial 14 dias → webhook de billing ativa/atrasa/cancela → ativação cria instância de WhatsApp; cancelamento desconecta e bloqueia → telas de bloqueio/reativação.
4. **Automação de manutenção:** serviço concluído define `maintenance_due_date` → regra agenda mensagem com template e variáveis → calendário permite revisar/cancelar/reagendar → cliente reativado vira novo negócio no CRM.

## 6. Modelo de dados

Tabelas (ver `supabase/migrations/0001_initial_schema.sql` e tipos em `src/lib/types.ts`): `plans`, `companies`, `users`, `subscriptions`, `whatsapp_instances`, `customers`, `quote_types`, `quote_criteria`, `quotes`, `crm_deals`, `message_templates`, `automation_rules`, `scheduled_messages`, `pdf_templates`, `conversation_logs`, `audit_logs` — todas com `company_id`, RLS por tenant, triggers de `updated_at`, índices nos acessos quentes e seed dos 4 planos.

## 7. Componentes principais

- **Design system** (`src/components/ui/*`) — 20+ componentes tipados.
- **Shell do app** (`src/components/layout/*`) — sidebar com seções, topbar (busca, empresa, idioma, tema, notificações, perfil), paleta de comandos (⌘K), assistente IA flutuante.
- **ChatSimulation** — conversa WhatsApp animada com digitação, áudio e PDF.
- **PdfDocument** (`src/components/pdf/*`) — proposta A4 renderizada com 4 estilos, seções configuráveis e cores da marca.
- **Kanban CRM** — @dnd-kit com DragOverlay, modal de motivo de perda e celebração de fechamento.
- **Calendário de automações** — grade mensal navegável com ações por mensagem.

## 8. Implementação do front-end

Next.js 15 + TypeScript estrito + Tailwind + Framer Motion. Dark mode padrão (com toggle). Mobile-first em todas as telas. i18n próprio e leve (`src/lib/i18n`): 19 namespaces, pt-BR completo, en/es com fallback automático, seletor de idioma na topbar/navbar, interpolação `{{var}}`. Microinterações em toda parte: reveal por scroll, contadores animados, skeletons, toasts, transições de página, confete no onboarding, animação de geração de PDF.

## 9. Implementação do back-end

Route handlers (`src/app/api/*`) para webhooks de WhatsApp e billing e geração de orçamentos; camada de integrações com interfaces `WhatsAppProvider`, `AiProvider` e `BillingProvider` (mock por padrão, produção via env vars); cliente Supabase browser (anon key + RLS) e server (service role, só em webhooks); schema SQL completo com RLS, funções auxiliares e seed.

## 10. Pontos de integração

| Integração | Variáveis | Camada |
| --- | --- | --- |
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | `src/lib/supabase/*` |
| WhatsApp (Z-API/UAZ/AZ/custom) | `WHATSAPP_PROVIDER`, `WHATSAPP_API_BASE_URL`, `WHATSAPP_API_TOKEN`, `WHATSAPP_WEBHOOK_SECRET` | `src/lib/integrations/whatsapp.ts` |
| IA | `AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL` | `src/lib/integrations/ai.ts` |
| Pagamentos | `BILLING_PROVIDER`, `BILLING_API_KEY`, `BILLING_WEBHOOK_SECRET` | `src/lib/integrations/billing.ts` |

## 11. Próximos passos técnicos

1. Conectar Supabase real: preencher `.env.local`, aplicar a migration, ligar `supabase.auth` nas telas de login/cadastro (pontos já comentados no código).
2. Implementar o primeiro provider real de WhatsApp na interface `WhatsAppProvider` e apontar o webhook do provedor para `/api/webhooks/whatsapp`.
3. Implementar `AnthropicProvider` em `ai.ts` (extração estruturada de orçamento + transcrição de áudio).
4. Geração real de PDF (ex.: `@react-pdf/renderer` ou Playwright/Chromium headless renderizando o `PdfDocument`) com upload para o Storage.
5. Billing real (Stripe/Pagar.me/Asaas) com checkout e portal do cliente.
6. Fila/cron para envio das `scheduled_messages` (Supabase Edge Functions + pg_cron).
7. Completar traduções en/es dos namespaces de feature e do copy de marketing.
8. Testes E2E (Playwright) dos fluxos críticos e limites de uso por plano no backend.
