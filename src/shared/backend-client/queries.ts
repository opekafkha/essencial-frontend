import { BackendRequestError, type BackendClient } from './create-backend-client.js'
import type { ProfileRow } from '../types/database.js'
import type { AdminRoom, AdminUser } from '../schemas/admin.schema.js'
import type { Role } from '../constants/roles.js'

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

export async function fetchAdminUsers(client: BackendClient): Promise<AdminUser[]> {
  return client.get<AdminUser[]>('/admin/users')
}

export async function fetchAdminRooms(client: BackendClient): Promise<AdminRoom[]> {
  return client.get<AdminRoom[]>('/admin/video-rooms')
}

export async function updateUserRole(client: BackendClient, userId: string, role: Role): Promise<AdminUser> {
  return client.patch<AdminUser>(`/admin/users/${userId}/role`, { role })
}
