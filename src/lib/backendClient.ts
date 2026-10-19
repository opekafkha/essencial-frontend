import { createBackendClient } from '../shared'
import { supabase } from './supabaseClient'

export const backendClient = createBackendClient({
  baseUrl: import.meta.env.VITE_BACKEND_URL,
  getAccessToken: async () => {
    const { data } = await supabase.auth.getSession()
    return data.session?.access_token ?? null
  },
})
