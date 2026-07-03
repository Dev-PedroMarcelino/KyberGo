# Convenções de desenvolvimento — KyberGo

Guia obrigatório para qualquer módulo novo. Leia antes de criar telas.

## Stack

- Next.js 15 (App Router) + TypeScript estrito + Tailwind CSS 3.4 + Framer Motion 11.
- Ícones: `lucide-react`. Gráficos: `recharts`. Drag-and-drop: `@dnd-kit/*`.
- Todas as páginas de produto são Client Components (`"use client"` na primeira linha).

## Idioma

- **Todo texto visível ao usuário é pt-BR** e vem do i18n: `const { t } = useI18n()` → `t("namespace.chave")`.
- Cada área tem seu namespace em `src/lib/i18n/dictionaries/<ns>.ts` (stubs já criados e registrados).
  Preencha SOMENTE o(s) namespace(s) da sua área. pt-BR é obrigatório; en/es podem ficar `{}` (fallback automático).
- Interpolação: `t("ns.chave", { nome: "João" })` com `{{nome}}` no texto.
- Nunca escreva texto de UI hardcoded em componentes (exceto dados mock, que já são pt-BR).

## Design system (use, não recrie)

Tokens Tailwind (prefixo `kyber-`): `kyber-black #050806`, `kyber-rich #0B0F0C`, `kyber-surface`, `kyber-elevated`,
`kyber-green #00E676`, `kyber-deep #00A85A`, `kyber-neon #39FF88`, `kyber-mint`, `kyber-gray #A7B0AA` (texto secundário),
`kyber-dim` (texto terciário), `kyber-soft` (texto principal), `border` (borda padrão), `glass` (fundo vidro).

Classes utilitárias (globals.css): `.glass`, `.glass-card`, `.text-gradient`, `.text-gradient-animated`,
`.glow-orb`, `.bg-grid`, `.focus-ring`, `.skeleton`. Sombras: `shadow-glow-sm|glow|glow-lg|card|card-hover`.
Fontes: `font-display` (títulos, Space Grotesk) e `font-sans` (corpo, Inter).

Componentes prontos em `src/components/ui/`:

- `button.tsx`: `<Button variant="primary|secondary|outline|ghost|danger|glow" size="sm|md|lg|xl|icon" loading>`.
- `input.tsx`: `<Input label error hint icon rightSlot>`, `<Textarea>`, `<Select options={[{value,label}]} placeholder>`.
- `card.tsx`: `<Card>`, `<GlassCard>`, `<CardHeader>`, `<CardTitle>`, `<CardDescription>`.
- `badge.tsx`: `<Badge tone="green|neon|gray|yellow|red|blue|purple" dot>`.
- `modal.tsx`: `<Modal open onClose title description drawer>` (drawer = painel lateral).
- `toast.tsx`: `const { toast } = useToast(); toast("success"|"error"|"info"|"warning", título, descrição?)`.
- `misc.tsx`: `<Tabs items value onChange>`, `<Accordion title defaultOpen>`, `<Tooltip content>`,
  `<Progress value tone>`, `<Stepper steps current>`, `<Skeleton className>`,
  `<EmptyState icon title description action>`, `<Switch checked onChange label>`,
  `<Avatar name src>`, `<MetricCard label value delta icon footer>`, `<Dropdown trigger align>` + `<DropdownItem>`.

Animação (`src/components/motion.tsx`): `<Reveal delay>`, `<StaggerContainer>` + `staggerItem`,
`<AnimatedCounter value prefix suffix decimals>`, `<PageTransition>`.
Chat WhatsApp animado: `src/components/chat-simulation.tsx` (`<ChatSimulation messages header speed loop>`).

## Padrão de página do app

```tsx
"use client";
// imports...
export default function MinhaPagina() {
  const { t } = useI18n();
  return (
    <PageTransition>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-kyber-white">{t("ns.title")}</h1>
          <p className="mt-1 text-sm text-kyber-gray">{t("ns.subtitle")}</p>
        </div>
        {/* ações primárias */}
      </div>
      {/* conteúdo */}
    </PageTransition>
  );
}
```

- Páginas do dashboard vivem em `src/app/app/<rota>/page.tsx` (o layout com sidebar/topbar já existe).
- Rotas públicas (bloqueado, trial, onboarding, admin) vivem direto em `src/app/<rota>/page.tsx`.
- Mobile-first: tudo deve funcionar bem em 375px. Use `grid gap-* sm:grid-cols-2 lg:grid-cols-4` etc.
- Toda lista precisa de estado vazio (`<EmptyState>`) e as ações de sucesso disparam `toast`.
- Valores monetários: `formatCurrency()`; datas: `formatDate()/formatDateTime()` de `@/lib/utils`.

## Dados

- Modo demo: importe tudo de `@/lib/mock/data` (MOCK_COMPANY, MOCK_CUSTOMERS, MOCK_QUOTES, MOCK_DEALS,
  MOCK_PLANS, MOCK_SUBSCRIPTION, MOCK_AUTOMATION_RULES, MOCK_SCHEDULED_MESSAGES, MOCK_MESSAGE_TEMPLATES,
  MOCK_PDF_TEMPLATES, MOCK_QUOTE_TYPES, MOCK_QUOTE_CRITERIA, MOCK_CONVERSATIONS, MOCK_USERS,
  MOCK_DASHBOARD_METRICS, MOCK_QUOTES_OVER_TIME, MOCK_FUNNEL, MOCK_CATEGORY_DISTRIBUTION, MOCK_WHATSAPP_INSTANCE).
- Tipos em `@/lib/types`. Estado local com `useState` inicializado a partir dos mocks (a UI deve ser interativa:
  criar/editar/mover/cancelar atualiza o estado local e dispara toast).
- Não chame Supabase diretamente nas telas — em produção a troca acontece na camada de serviços.

## Qualidade

- Nada de placeholder "em construção": cada tela entregue deve parecer produto final.
- `pnpm build` precisa passar. Sem `any` gratuito. Sem warnings de tipos.
- Comentários no código em pt-BR, apenas onde agregam contexto.
