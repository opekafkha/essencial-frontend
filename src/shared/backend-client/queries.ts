import { BackendRequestError, type BackendClient } from './create-backend-client.js'
import type { ProfileRow } from '../types/database.js'

// Reemplaza la query PostgREST que antes hacía supabase.from('profiles').select()
// directo contra Supabase Cloud — en el stack self-hosted no hay PostgREST, el
// perfil se sirve desde GET /me en el backend.
export async function fetchMe(client: BackendClient): Promise<ProfileRow | null> {
  try {
    return await client.get<ProfileRow>('/me')
  } catch (err) {
    if (err instanceof BackendRequestError && err.status === 401) return null
    throw err
  }
}
