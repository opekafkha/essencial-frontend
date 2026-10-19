import { createEsencialAuthClient } from '../shared'

export const supabase = createEsencialAuthClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)
