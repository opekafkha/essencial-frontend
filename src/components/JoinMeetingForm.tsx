import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseMeetingLink } from '../lib/meeting-link'

export function JoinMeetingForm() {
  const navigate = useNavigate()
  const [link, setLink] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const path = parseMeetingLink(link)
    if (!path) {
      setError('Introduce el enlace completo de la reunión que te compartió tu profesional.')
      return
    }
    navigate(path)
  }

  return (
    <article className="action-card card">
      <span className="feature-icon" aria-hidden="true">◉</span>
      <h3>Únete a tu reunión</h3>
      <p>Pega aquí el enlace que te compartió tu profesional para entrar a la videollamada.</p>
      <form className="join-meeting-form" onSubmit={handleSubmit} noValidate>
        <label className="field-label" htmlFor="meeting-link">Enlace de la reunión</label>
        <input
          id="meeting-link"
          className="field-input"
          type="text"
          inputMode="url"
          placeholder="https://…/join/…"
          value={link}
          onChange={(event) => { setLink(event.target.value); setError(null) }}
          aria-invalid={!!error}
          aria-describedby={error ? 'meeting-link-error' : undefined}
          autoComplete="off"
          spellCheck={false}
          required
        />
        {error && <p id="meeting-link-error" className="error-message" role="alert">{error}</p>}
        <button className="button primary full" type="submit"><span>Entrar a la reunión</span><span aria-hidden="true">↗</span></button>
      </form>
    </article>
  )
}
