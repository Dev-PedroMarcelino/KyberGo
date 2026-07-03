import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Fábrica de cliente Supabase (browser).
 *
 * O KyberGo funciona em dois modos:
 * 1. MODO DEMO — sem credenciais, toda a interface usa dados de exemplo (src/lib/mock).
 * 2. MODO PRODUÇÃO — basta preencher NEXT_PUBLIC_SUPABASE_URL e
 *    NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local para ativar o banco real.
 *
 * Nenhuma tela precisa mudar: a camada de serviços (src/lib/services)
 * decide a origem dos dados com base em isSupabaseConfigured().
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

let browserClient: SupabaseClient | null = null;

/** Retorna o cliente Supabase do navegador, ou null em modo demo. */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (!browserClient) {
    browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
  return browserClient;
}
