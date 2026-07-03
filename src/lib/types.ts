/**
 * Modelo de dados do KyberGo — espelha o schema Supabase em supabase/migrations.
 * Todos os registros de negócio carregam companyId para isolamento multi-tenant.
 */

export type UserRole = "super_admin" | "company_owner" | "company_manager" | "salesperson";

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled" | "blocked";

export type OnboardingStatus = "pending" | "in_progress" | "completed";

export type QuoteMode = "intelligent" | "simple";

export type QuoteStatus = "draft" | "sent" | "viewed" | "negotiating" | "accepted" | "rejected" | "expired";

export type DealStage =
  | "new_lead"
  | "qualifying"
  | "quote_sent"
  | "negotiating"
  | "won"
  | "lost"
  | "maintenance";

export type WhatsAppInstanceStatus = "connected" | "disconnected" | "connecting" | "qr_pending" | "blocked";

export type MessageDirection = "inbound" | "outbound";

export type MessageType = "text" | "audio" | "image" | "document" | "pdf";

export type ScheduledMessageStatus = "scheduled" | "sent" | "cancelled" | "failed";

export type AutomationTrigger =
  | "quote_sent"
  | "quote_accepted"
  | "deal_won"
  | "maintenance_due"
  | "no_response"
  | "custom_date";

export type CriteriaFieldType = "number" | "text" | "select" | "boolean" | "currency";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string | null;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  id: string;
  name: string;
  segment: string;
  logoUrl: string | null;
  brandColor: string;
  documentColor: string;
  phone: string;
  whatsappNumber: string;
  address: string;
  subscriptionId: string | null;
  onboardingStatus: OnboardingStatus;
  defaultLanguage: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanLimits {
  users: number;
  pdfsPerMonth: number;
  whatsappConversationsPerMonth: number;
  aiCreditsPerMonth: number;
  quoteTypes: number;
  automations: number;
  customPdfTemplates: boolean;
  multiLanguage: boolean;
  prioritySupport: boolean;
}

export interface Plan {
  id: string;
  name: string;
  slug: "starter" | "professional" | "business" | "enterprise";
  monthlyPrice: number;
  annualPrice: number;
  highlight: boolean;
  limits: PlanLimits;
  features: string[];
  isActive: boolean;
}

export interface Subscription {
  id: string;
  companyId: string;
  planId: string;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
  paymentProviderCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppInstance {
  id: string;
  companyId: string;
  provider: string;
  providerInstanceId: string;
  status: WhatsAppInstanceStatus;
  qrCode: string | null;
  connectedNumber: string | null;
  lastConnectionAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  notes: string | null;
  tags: string[];
  automationEnabled: boolean;
  lastServiceDate: string | null;
  maintenanceDueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteType {
  id: string;
  companyId: string;
  name: string;
  description: string;
  mode: QuoteMode;
  maintenanceIntervalDays: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteCriterion {
  id: string;
  companyId: string;
  quoteTypeId: string;
  label: string;
  fieldType: CriteriaFieldType;
  required: boolean;
  /** Regra de cálculo legível, ex.: "metros * 45 + deslocamento". */
  calculationRule: string | null;
  options: string[] | null;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  companyId: string;
  customerId: string;
  quoteTypeId: string | null;
  mode: QuoteMode;
  status: QuoteStatus;
  number: string;
  title: string;
  description: string;
  items: QuoteItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentTerms: string;
  pdfUrl: string | null;
  validUntil: string;
  source: "whatsapp" | "web" | "manual";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CrmDeal {
  id: string;
  companyId: string;
  customerId: string;
  quoteId: string | null;
  title: string;
  stage: DealStage;
  value: number;
  expectedCloseDate: string | null;
  assignedTo: string | null;
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRule {
  id: string;
  companyId: string;
  name: string;
  trigger: AutomationTrigger;
  delayDays: number;
  messageTemplateId: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduledMessage {
  id: string;
  companyId: string;
  customerId: string;
  quoteId: string | null;
  ruleId: string | null;
  scheduledFor: string;
  status: ScheduledMessageStatus;
  message: string;
  cancelledReason: string | null;
  createdAt: string;
}

export interface MessageTemplate {
  id: string;
  companyId: string;
  name: string;
  content: string;
  variables: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
}

export interface PdfTemplateSections {
  header: boolean;
  companyData: boolean;
  clientData: boolean;
  itemsTable: boolean;
  paymentTerms: boolean;
  terms: boolean;
  signature: boolean;
  footer: boolean;
  qrCode: boolean;
  watermark: boolean;
}

export interface PdfTemplate {
  id: string;
  companyId: string;
  name: string;
  style: "moderno" | "classico" | "minimalista" | "executivo";
  logoUrl: string | null;
  colors: { primary: string; accent: string; text: string };
  font: string;
  sections: PdfTemplateSections;
  terms: string;
  footer: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationLog {
  id: string;
  companyId: string;
  customerId: string | null;
  whatsappInstanceId: string;
  direction: MessageDirection;
  messageType: MessageType;
  content: string;
  audioUrl: string | null;
  transcription: string | null;
  aiResponse: string | null;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  companyId: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: "quote" | "crm" | "automation" | "whatsapp" | "billing" | "system";
  read: boolean;
  createdAt: string;
}

/** Métricas agregadas exibidas no dashboard. */
export interface DashboardMetrics {
  quotesThisMonth: number;
  quotesGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  leadsCreated: number;
  leadsGrowth: number;
  estimatedRevenue: number;
  revenueGrowth: number;
  followUpsScheduled: number;
  maintenanceDue: number;
  aiUsagePercent: number;
  pdfUsage: { used: number; limit: number };
  conversationUsage: { used: number; limit: number };
}
