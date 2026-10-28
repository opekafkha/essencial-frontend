import { z } from 'zod'

export const adminUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  nombre: z.string().nullable(),
  telefono: z.string().nullable(),
  role: z.enum(['miembro', 'profesional', 'admin']),
  created_at: z.string(),
})

export const listAdminUsersResponseSchema = z.array(adminUserSchema)

export type AdminUser = z.infer<typeof adminUserSchema>

export const adminRoomSchema = z.object({
  slug: z.string(),
  roomName: z.string(),
  creatorNombre: z.string().nullable(),
  creatorEmail: z.string(),
  createdAt: z.string(),
  expiresAt: z.string(),
  status: z.enum(['activa', 'expirada', 'cerrada']),
  participants: z.array(z.object({ id: z.string(), nombre: z.string().nullable(), email: z.string(), joinedAt: z.string() })),
})

export const listAdminRoomsResponseSchema = z.array(adminRoomSchema)

export type AdminRoom = z.infer<typeof adminRoomSchema>
