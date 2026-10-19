import { useState } from 'react'
import { createVideoRoomResponseSchema, type CreateVideoRoomResponse } from '../shared'
import { backendClient } from '../lib/backendClient'

export function GenerarSalaPage() {
  const [joinUrl, setJoinUrl] = useState<string | null>(null)
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
    } catch {
      setError('No se pudo generar la sala. Intenta de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCopy() {
    if (!joinUrl) return
    await navigator.clipboard.writeText(joinUrl)
    setCopied(true)
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-4 px-4">
      <h1 className="text-2xl font-semibold">Generar sala de videollamada</h1>
      <p className="text-sm text-slate-600">
        Crea un link de 1 clic, sin agenda ni cita formal. La sala expira en 2 horas.
      </p>
      <button
        onClick={() => void handleGenerar()}
        disabled={submitting}
        className="w-fit rounded bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitting ? 'Generando...' : 'Generar sala'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {joinUrl && (
        <div className="flex flex-col gap-2 rounded border px-3 py-2">
          <p className="break-all text-sm">{joinUrl}</p>
          <button
            onClick={() => void handleCopy()}
            className="w-fit rounded border px-3 py-1 text-sm hover:bg-slate-50"
          >
            {copied ? 'Copiado' : 'Copiar link'}
          </button>
        </div>
      )}
    </main>
  )
}
