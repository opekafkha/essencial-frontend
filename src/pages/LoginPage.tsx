import { AuthLayout } from '../components/Design'
import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { loginSchema } from '../shared'
import { supabase } from '../lib/supabaseClient'

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)

    const parsed = loginSchema.safeParse({ email, password })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Datos inválidos')
      return
    }

    setSubmitting(true)
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword(parsed.data)
      if (signInError) {
        setError(signInError.message === 'Email not confirmed'
          ? 'Confirma tu correo antes de iniciar sesión.'
          : 'Correo o contraseña incorrectos.')
        return
      }
      const next = (location.state as { next?: string } | null)?.next ?? '/dashboard'
      navigate(next)
    } catch {
      setError('No pudimos iniciar sesión. Revisa tu conexión e intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout loading={submitting}><span className="eyebrow">QUÉ BUENO TENERTE AQUÍ</span>
      <h1 className="auth-title">Bienvenido de nuevo.</h1><p className="auth-intro">Tu espacio de bienestar te está esperando.</p>
      <form onSubmit={handleSubmit} className="auth-fields" aria-busy={submitting}>
        <label className="field-label">Correo electrónico<input
          className="field-input" required
          placeholder="tu@correo.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        /></label>
        <label className="field-label">Contraseña<input
          className="field-input" required
          placeholder="Tu contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        /></label>
        {error && <p role="alert" className="error-message">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="button primary full"
        >
          {submitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="text-sm text-slate-600">
        ¿No tienes cuenta? <Link to="/registro" className="underline">Regístrate</Link>
      </p>
    </AuthLayout>
  )
}
