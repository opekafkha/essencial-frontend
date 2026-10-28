import { AuthLayout } from '../components/Design'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerSchema } from '../shared'
import { supabase } from '../lib/supabaseClient'

export function RegisterPage() {
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const parsed = registerSchema.safeParse({ nombre, telefono, email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos')
      return
    }

    setSubmitting(true)
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: { nombre: parsed.data.nombre, telefono: parsed.data.telefono },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      })
      if (signUpError) { setError(signUpError.message); return }
      navigate('/revisa-tu-correo')
    } catch {
      setError('No se pudo crear la cuenta. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout><span className="eyebrow">COMIENZA TU CAMINO</span>
      <h1 className="auth-title">Tu bienestar empieza aquí.</h1><p className="auth-intro">Crea tu cuenta y empieza a conectar contigo.</p>
      <form onSubmit={handleSubmit} className="auth-fields">
        <label className="field-label">Nombre completo<input
          className="field-input" required
          placeholder="¿Cómo te llamas?"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          autoComplete="name"
        /></label>
        <label className="field-label">Correo electrónico<input
          className="field-input" required
          placeholder="tu@correo.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        /></label>
        <label className="field-label">Número de teléfono<input
          className="field-input" required type="tel" autoComplete="tel"
          placeholder="+57 300 123 4567" maxLength={30}
          value={telefono} onChange={e => setTelefono(e.target.value)}
          aria-describedby="telefono-help"
        /><small id="telefono-help">Incluye el indicativo de tu país.</small></label>
        <label className="field-label">Contraseña<input
          className="field-input" required
          placeholder="Tu contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        /></label>
        {error && <p role="alert" className="error-message">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="button primary full"
        >
          {submitting ? 'Creando...' : 'Crear cuenta'}
        </button>
      </form>
      <p className="text-sm text-slate-600">
        ¿Ya tienes cuenta? <Link to="/login" className="underline">Inicia sesión</Link>
      </p>
    </AuthLayout>
  )
}
