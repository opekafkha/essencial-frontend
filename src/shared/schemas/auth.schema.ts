import { z } from 'zod'

export const registerSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre es muy corto'),
  telefono: z.string().trim()
    .regex(/^\+?[0-9\s().-]+$/, 'Escribe un teléfono válido con indicativo de país')
    .transform(value => value.replace(/[\s().-]/g, ''))
    .refine(value => /^\+[1-9]\d{7,14}$/.test(value), 'Incluye el indicativo de país, por ejemplo +57 300 123 4567'),
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().trim().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

export type LoginInput = z.infer<typeof loginSchema>
