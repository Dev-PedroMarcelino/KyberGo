import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase de servidor (service role).
 * Usado exclusivamente em route handlers e webhooks — NUNCA no browser.
 * A service role ignora RLS; toda query deve filtrar explicitamente por company_id.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
