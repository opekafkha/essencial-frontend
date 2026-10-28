import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript } from './load-typescript.mjs'
const { registerSchema } = await loadTypeScript('src/shared/schemas/auth.schema.ts')
const input = { nombre: 'Persona', email: 'person@example.com', password: 'example-password' }
test('registration requires phone with country code and submits normalized digits', () => {
  assert.equal(registerSchema.safeParse(input).success, false)
  assert.equal(registerSchema.safeParse({ ...input, telefono: '3001234567' }).success, false)
  assert.equal(registerSchema.parse({ ...input, telefono: '+57 (300) 123-4567' }).telefono, '+573001234567')
})
