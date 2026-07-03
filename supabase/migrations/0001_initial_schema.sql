-- ============================================================
-- KyberGo — Schema inicial (Supabase / PostgreSQL)
-- Multi-tenant com isolamento por company_id + RLS.
-- Aplicar com: supabase db push (ou via painel SQL do Supabase).
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- Enums ----------
create type user_role as enum ('super_admin', 'company_owner', 'company_manager', 'salesperson');
create type subscription_status as enum ('trialing', 'active', 'past_due', 'cancelled', 'blocked');
create type onboarding_status as enum ('pending', 'in_progress', 'completed');
create type quote_mode as enum ('intelligent', 'simple');
create type quote_status as enum ('draft', 'sent', 'viewed', 'negotiating', 'accepted', 'rejected', 'expired');
create type deal_stage as enum ('new_lead', 'qualifying', 'quote_sent', 'negotiating', 'won', 'lost', 'maintenance');
create type whatsapp_status as enum ('connected', 'disconnected', 'connecting', 'qr_pending', 'blocked');
create type message_direction as enum ('inbound', 'outbound');
create type message_type as enum ('text', 'audio', 'image', 'document', 'pdf');
create type scheduled_message_status as enum ('scheduled', 'sent', 'cancelled', 'failed');
create type automation_trigger as enum ('quote_sent', 'quote_accepted', 'deal_won', 'maintenance_due', 'no_response', 'custom_date');
create type criteria_field_type as enum ('number', 'text', 'select', 'boolean', 'currency');

-- ---------- Planos (globais, geridos pelo super admin) ----------
create table plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  monthly_price numeric(10,2) not null default 0,
  annual_price numeric(10,2) not null default 0,
  highlight boolean not null default false,
  limits jsonb not null default '{}',
  features jsonb not null default '[]',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Empresas (tenants) ----------
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  segment text not null default '',
  logo_url text,
  brand_color text not null default '#00E676',
  document_color text not null default '#0B0F0C',
  phone text not null default '',
  whatsapp_number text not null default '',
  address text not null default '',
  onboarding_status onboarding_status not null default 'pending',
  default_language text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Usuários (vinculados ao auth.users do Supabase) ----------
create table users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  role user_role not null default 'salesperson',
  company_id uuid references companies(id) on delete set null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Assinaturas ----------
create table subscriptions (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  plan_id uuid not null references plans(id),
  status subscription_status not null default 'trialing',
  trial_ends_at timestamptz,
  current_period_start timestamptz not null default now(),
  current_period_end timestamptz not null default now() + interval '30 days',
  cancelled_at timestamptz,
  payment_provider_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table companies add column subscription_id uuid references subscriptions(id);

-- ---------- Instâncias de WhatsApp (1 por assinatura ativa) ----------
create table whatsapp_instances (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  provider text not null default 'generic',
  provider_instance_id text not null,
  status whatsapp_status not null default 'disconnected',
  qr_code text,
  connected_number text,
  last_connection_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id)
);

-- ---------- Clientes ----------
create table customers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  phone text not null,
  email text,
  address text,
  notes text,
  tags text[] not null default '{}',
  automation_enabled boolean not null default true,
  last_service_date timestamptz,
  maintenance_due_date timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index customers_company_idx on customers (company_id);
create index customers_phone_idx on customers (company_id, phone);

-- ---------- Tipos de orçamento ----------
create table quote_types (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  description text not null default '',
  mode quote_mode not null default 'intelligent',
  maintenance_interval_days integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quote_types_company_idx on quote_types (company_id);

-- ---------- Critérios de orçamento (modo inteligente) ----------
create table quote_criteria (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  quote_type_id uuid not null references quote_types(id) on delete cascade,
  label text not null,
  field_type criteria_field_type not null default 'text',
  required boolean not null default false,
  calculation_rule text,
  options jsonb,
  "order" integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index quote_criteria_type_idx on quote_criteria (quote_type_id);

-- ---------- Orçamentos ----------
create table quotes (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  quote_type_id uuid references quote_types(id) on delete set null,
  mode quote_mode not null,
  status quote_status not null default 'draft',
  number text not null,
  title text not null,
  description text not null default '',
  items jsonb not null default '[]',
  subtotal numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  payment_terms text not null default '',
  pdf_url text,
  valid_until timestamptz,
  source text not null default 'web',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, number)
);
create index quotes_company_idx on quotes (company_id, created_at desc);
create index quotes_customer_idx on quotes (customer_id);

-- ---------- CRM (negócios / pipeline) ----------
create table crm_deals (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  quote_id uuid references quotes(id) on delete set null,
  title text not null,
  stage deal_stage not null default 'new_lead',
  value numeric(12,2) not null default 0,
  expected_close_date timestamptz,
  assigned_to uuid references users(id),
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index crm_deals_company_idx on crm_deals (company_id, stage);

-- ---------- Templates de mensagem ----------
create table message_templates (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  content text not null,
  variables text[] not null default '{}',
  language text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Regras de automação ----------
create table automation_rules (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  trigger automation_trigger not null,
  delay_days integer not null default 0,
  message_template_id uuid references message_templates(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Mensagens agendadas ----------
create table scheduled_messages (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  quote_id uuid references quotes(id) on delete set null,
  rule_id uuid references automation_rules(id) on delete set null,
  scheduled_for timestamptz not null,
  status scheduled_message_status not null default 'scheduled',
  message text not null,
  cancelled_reason text,
  created_at timestamptz not null default now()
);
create index scheduled_messages_due_idx on scheduled_messages (status, scheduled_for);

-- ---------- Templates de PDF ----------
create table pdf_templates (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  style text not null default 'moderno',
  logo_url text,
  colors jsonb not null default '{"primary":"#00A85A","accent":"#00E676","text":"#0B0F0C"}',
  font text not null default 'Inter',
  sections jsonb not null default '{}',
  terms text not null default '',
  footer text not null default '',
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Logs de conversa (WhatsApp) ----------
create table conversation_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  whatsapp_instance_id uuid references whatsapp_instances(id) on delete set null,
  direction message_direction not null,
  message_type message_type not null default 'text',
  content text not null default '',
  audio_url text,
  transcription text,
  ai_response text,
  created_at timestamptz not null default now()
);
create index conversation_logs_company_idx on conversation_logs (company_id, created_at desc);

-- ---------- Logs de auditoria ----------
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  user_id uuid references users(id) on delete set null,
  action text not null,
  entity text not null,
  entity_id text not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);
create index audit_logs_company_idx on audit_logs (company_id, created_at desc);

-- ============================================================
-- Row Level Security — isolamento por tenant
-- ============================================================

-- Função auxiliar: company_id do usuário autenticado.
create or replace function auth_company_id() returns uuid
language sql stable security definer set search_path = public as $$
  select company_id from users where id = auth.uid();
$$;

-- Função auxiliar: verifica se o usuário é super admin da plataforma.
create or replace function auth_is_super_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'super_admin' from users where id = auth.uid()), false);
$$;

alter table companies enable row level security;
alter table users enable row level security;
alter table subscriptions enable row level security;
alter table whatsapp_instances enable row level security;
alter table customers enable row level security;
alter table quote_types enable row level security;
alter table quote_criteria enable row level security;
alter table quotes enable row level security;
alter table crm_deals enable row level security;
alter table message_templates enable row level security;
alter table automation_rules enable row level security;
alter table scheduled_messages enable row level security;
alter table pdf_templates enable row level security;
alter table conversation_logs enable row level security;
alter table audit_logs enable row level security;
alter table plans enable row level security;

-- Planos: visíveis para todos os autenticados; gerenciados só por super admin.
create policy "plans_read" on plans for select to authenticated using (true);
create policy "plans_admin_write" on plans for all to authenticated
  using (auth_is_super_admin()) with check (auth_is_super_admin());

-- Empresas: membros veem a própria; super admin vê todas.
create policy "companies_member_read" on companies for select to authenticated
  using (id = auth_company_id() or auth_is_super_admin());
create policy "companies_owner_update" on companies for update to authenticated
  using (id = auth_company_id() and exists (
    select 1 from users where id = auth.uid() and role in ('company_owner')
  ) or auth_is_super_admin());

-- Usuários: membros veem colegas da mesma empresa.
create policy "users_same_company_read" on users for select to authenticated
  using (company_id = auth_company_id() or id = auth.uid() or auth_is_super_admin());
create policy "users_self_update" on users for update to authenticated
  using (id = auth.uid() or auth_is_super_admin());

-- Padrão para tabelas de tenant: acesso restrito à própria empresa.
create policy "subscriptions_tenant" on subscriptions for select to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin());

create policy "whatsapp_tenant" on whatsapp_instances for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "customers_tenant" on customers for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "quote_types_tenant" on quote_types for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "quote_criteria_tenant" on quote_criteria for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "quotes_tenant" on quotes for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "crm_deals_tenant" on crm_deals for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "message_templates_tenant" on message_templates for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "automation_rules_tenant" on automation_rules for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "scheduled_messages_tenant" on scheduled_messages for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "pdf_templates_tenant" on pdf_templates for all to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin())
  with check (company_id = auth_company_id() or auth_is_super_admin());

create policy "conversation_logs_tenant" on conversation_logs for select to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin());

create policy "audit_logs_tenant" on audit_logs for select to authenticated
  using (company_id = auth_company_id() or auth_is_super_admin());

-- ---------- Trigger de updated_at ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'plans','companies','users','subscriptions','whatsapp_instances','customers',
    'quote_types','quote_criteria','quotes','crm_deals','message_templates',
    'automation_rules','pdf_templates'
  ] loop
    execute format('create trigger %I_updated_at before update on %I for each row execute function set_updated_at()', t, t);
  end loop;
end;
$$;

-- ---------- Seed de planos ----------
insert into plans (name, slug, monthly_price, annual_price, highlight, limits, features) values
  ('Starter', 'starter', 97, 970, false,
    '{"users":1,"pdfsPerMonth":30,"whatsappConversationsPerMonth":100,"aiCreditsPerMonth":200,"quoteTypes":2,"automations":2,"customPdfTemplates":false,"multiLanguage":false,"prioritySupport":false}',
    '["1 usuário","30 PDFs por mês","100 conversas de WhatsApp","Modo documento simples","CRM básico","2 automações de follow-up","Suporte por e-mail"]'),
  ('Professional', 'professional', 197, 1970, true,
    '{"users":5,"pdfsPerMonth":150,"whatsappConversationsPerMonth":500,"aiCreditsPerMonth":1000,"quoteTypes":10,"automations":10,"customPdfTemplates":true,"multiLanguage":false,"prioritySupport":false}',
    '["Até 5 usuários","150 PDFs por mês","500 conversas de WhatsApp","Modo inteligente + modo simples","CRM completo com Kanban","10 automações de follow-up","Templates de PDF personalizados","Lembretes de manutenção","Suporte prioritário"]'),
  ('Business', 'business', 397, 3970, false,
    '{"users":15,"pdfsPerMonth":500,"whatsappConversationsPerMonth":2000,"aiCreditsPerMonth":5000,"quoteTypes":50,"automations":50,"customPdfTemplates":true,"multiLanguage":true,"prioritySupport":true}',
    '["Até 15 usuários","500 PDFs por mês","2.000 conversas de WhatsApp","Todos os modos de orçamento","CRM completo + relatórios avançados","Automações ilimitadas por regra","Multi-idioma (PT, EN, ES)","API de integração","Suporte prioritário 24/5"]'),
  ('Enterprise', 'enterprise', 0, 0, false,
    '{"users":999,"pdfsPerMonth":99999,"whatsappConversationsPerMonth":99999,"aiCreditsPerMonth":99999,"quoteTypes":999,"automations":999,"customPdfTemplates":true,"multiLanguage":true,"prioritySupport":true}',
    '["Usuários ilimitados","PDFs ilimitados","Conversas ilimitadas","Múltiplas instâncias de WhatsApp","Onboarding assistido","SLA dedicado","Gerente de conta","Customizações sob demanda"]');
