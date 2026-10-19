import { createClient, type SupabaseClientOptions } from '@supabase/supabase-js'

// Usa @supabase/supabase-js como cliente HTTP hacia GoTrue self-hosted (no
// Supabase Cloud — GoTrue habla el mismo protocolo, ver AGENTS.md raíz de
// apps/). Sin genérico `Database`: el tipo hand-authored en
// ../types/database.ts no satisface la inferencia interna de supabase-js
// para `select('*')` (colapsa a `never`).
export function createEsencialAuthClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<'public'>,
) {
  if (!url || !anonKey) {
    throw new Error('Faltan VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY (revisa el .env de la app)')
  }
  return createClient(url, anonKey, options)
}

export type EsencialAuthClient = ReturnType<typeof createEsencialAuthClient>
