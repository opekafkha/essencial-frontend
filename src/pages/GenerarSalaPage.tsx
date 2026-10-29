import { PageHeading } from '../components/Design'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { createVideoRoomResponseSchema, type CreateVideoRoomResponse } from '../shared'
import { backendClient } from '../lib/backendClient'

export function GenerarSalaPage() {
  const [joinUrl, setJoinUrl] = useState<string | null>(null)
  const [slug, setSlug] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleGenerar() {
    setSubmitting(true)
    setError(null)
    setCopied(false)

    try {
      const data = await backendClient.post<CreateVideoRoomResponse>('/video-rooms')
      const parsed = createVideoRoomResponseSchema.safeParse(data)
      if (!parsed.success) {
        setError('Respuesta inesperada del servidor.')
        return
      }
      setJoinUrl(parsed.data.joinUrl)
      setSlug(parsed.data.slug)
    } catch {
      setError('No se pudo generar la sala. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCopy() {
    if (!joinUrl) return
    try {
      await navigator.clipboard.writeText(joinUrl)
      setCopied(true)
    } catch { setError('No se pudo copiar. Selecciona el enlace y cópialo manualmente.') }
  }

  return (
    <><PageHeading label="VIDEOLLAMADAS" title="Un espacio para conectar." description="Prepara tu sala y comparte una conversación que importa." /><div className="room-grid"><section className="card room-card"><span className="feature-icon">◉</span>
      <h2>Tu próxima conversación</h2>
      <p className="text-sm text-slate-600">
        Crea un link de 1 clic, sin agenda ni cita formal. La sala expira en 2 horas.
      </p>
      <button
        onClick={() => void handleGenerar()}
        disabled={submitting}
        className="button primary"
      >
        {submitting ? 'Generando...' : 'Generar sala'}
      </button>
      {error && <p role="alert" className="error-message">{error}</p>}
      {joinUrl && slug && (
        <div className="generated-room">
          <p className="break-all text-sm">{joinUrl}</p>
          <div className="flex gap-2">
            <button
              onClick={() => void handleCopy()}
              className="button secondary"
            >
              {copied ? 'Copiado' : 'Copiar link'}
            </button>
            <Link
              to={`/join/${slug}`}
              className="button primary"
            >
              Preparar entrada
            </Link>
          </div>
        </div>
      )}
    </section><aside className="room-tips"><span className="eyebrow">ANTES DE EMPEZAR</span><h2>Los pequeños detalles<br />hacen la diferencia.</h2><ol><li>Busca un espacio tranquilo.</li><li>Revisa tu cámara y micrófono.</li><li>Comparte el enlace con tu invitado.</li></ol><p>La sala estará disponible durante 2 horas.</p></aside></div></>
  )
}
