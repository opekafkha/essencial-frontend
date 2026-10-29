import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LiveKitRoom, VideoConference, type LocalUserChoices } from '@livekit/components-react'
import { DisconnectReason } from 'livekit-client'
import '@livekit/components-styles'
import './JoinCallPage.css'
import { PageHeading } from '../components/Design'
import { CallErrorBoundary } from '../components/CallErrorBoundary'
import { MeetingLobby } from '../components/MeetingLobby'
import { Loader } from '../components/Loader'
import { CallConnectionOverlay } from '../components/CallConnectionOverlay'
import { CallNotifications } from '../components/CallNotifications'
import { useAuth } from '../context/useAuth'
import { getVideoRoomResponseSchema, type GetVideoRoomResponse } from '../shared'
import { backendClient } from '../lib/backendClient'

interface CallSessionProps {
  slug: string
  onRetry: () => void
}

function CallSession({ slug, onRetry }: CallSessionProps) {
  const { profile, session } = useAuth()
  const [choices, setChoices] = useState<LocalUserChoices | null>(null)
  const audioOptions = useMemo(() => choices?.audioEnabled ? { deviceId: choices.audioDeviceId || undefined } : false, [choices])
  const videoOptions = useMemo(() => choices?.videoEnabled ? { deviceId: choices.videoDeviceId || undefined } : false, [choices])
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [status, setStatus] = useState('Conectando con la sala…')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const data = await backendClient.get<GetVideoRoomResponse>(`/video-rooms/${encodeURIComponent(slug)}`)
        if (cancelled) return
        const parsed = getVideoRoomResponseSchema.safeParse(data)
        if (!parsed.success) {
          setError('Respuesta inesperada del servidor.')
          return
        }
        setToken(parsed.data.token)
      } catch {
        if (!cancelled) setError('No se pudo abrir la sala. Verifica que el enlace siga vigente e intenta de nuevo.')
      }
    }

    void load()
    return () => { cancelled = true }
  }, [slug])

  // LiveKit also calls onError for track publication / device errors. Do not
  // unmount a connected room when just one local device could not be enabled.
  // Stable handlers also avoid re-running the SDK connection effect on renders.
  const handleError = useCallback((cause: Error) => {
    console.error('Essencial: error de conexión o dispositivo en videollamada', cause)
    setNotice('No se pudo completar una operación de la llamada. Si el problema es tu cámara o micrófono, revisa los permisos y actívalos desde los controles. Si no conecta, vuelve a entrar.')
  }, [])

  const handleMediaFailure = useCallback(() => {
    setNotice('No se pudo acceder a la cámara o al micrófono. Revisa los permisos del navegador y si otra aplicación los está usando. Puedes seguir en la sala y activarlos desde los controles.')
  }, [])

  const handleConnected = useCallback(() => {
    setStatus('Conectado a la sala')
    void backendClient.post(`/video-rooms/${encodeURIComponent(slug)}/participants`).catch(() => {
      setNotice('La llamada está conectada, pero no se pudo registrar tu entrada en el historial.')
    })
  }, [slug])

  const handleDisconnected = useCallback((reason?: DisconnectReason) => {
    if (reason === DisconnectReason.CLIENT_INITIATED) {
      setError('Has salido de la videollamada.')
    } else if (reason === DisconnectReason.DUPLICATE_IDENTITY) {
      setError('Tu cuenta entró a esta sala desde otra pestaña o dispositivo. Cierra la otra llamada antes de volver a entrar.')
    } else {
      setError('Se perdió la conexión con la sala. Revisa tu conexión e intenta volver a entrar.')
    }
  }, [])

  if (error) {
    return (
      <div className="card call-status" role="alert">
        <span className="feature-icon" aria-hidden="true">◉</span>
        <h2>Tu espacio de videollamada</h2>
        <p>{error}</p>
        <button className="button primary" onClick={onRetry}>Volver a entrar</button>
        <Link className="text-button" to="/dashboard">Volver al inicio</Link>
      </div>
    )
  }

  if (!token) {
    return <div className="card call-status"><Loader size="lg" showLabel label="Preparando tu espacio de videollamada…" /></div>
  }

  if (!choices) {
    return <MeetingLobby displayName={profile?.nombre || profile?.email || session?.user.email || 'Mi cuenta'} onJoin={setChoices} />
  }

  return (
    <>
      {notice && <div className="call-notice" role="status"><p>{notice}</p><button className="button secondary" onClick={onRetry}>Volver a entrar</button></div>}
      <section className="call-frame notranslate" aria-label="Sala de videollamada" translate="no">
        <header className="call-frame-header">
          <div><span className="call-frame-symbol" aria-hidden="true">◉</span><span>Sala Essencial</span></div>
          <span className="call-frame-caption" role="status">{status}</span>
        </header>
        <LiveKitRoom
          token={token}
          serverUrl={import.meta.env.VITE_LIVEKIT_URL}
          video={videoOptions}
          audio={audioOptions}
          className="essencial-call"
          data-lk-theme="default"
          translate="no"
          onError={handleError}
          onMediaDeviceFailure={handleMediaFailure}
          onConnected={handleConnected}
          onDisconnected={handleDisconnected}
        >
          <CallConnectionOverlay />
          <CallNotifications />
          <VideoConference />
        </LiveKitRoom>
      </section>
      <p className="call-help">Puedes activar o silenciar tu micrófono y cámara desde los controles de la sala.</p>
    </>
  )
}

export function JoinCallPage() {
  const { slug } = useParams<{ slug: string }>()
  const [attempt, setAttempt] = useState(0)
  const retry = useCallback(() => setAttempt((value) => value + 1), [])

  return (
    <>
      <PageHeading label="VIDEOLLAMADA" title="Un momento para conectar." description="Tu conversación tiene su propio espacio. Ponte cómodo y conecta a tu ritmo." />
      {slug ? (
        <CallErrorBoundary key={`${slug}:${attempt}`} onRetry={retry}>
          <CallSession slug={slug} onRetry={retry} />
        </CallErrorBoundary>
      ) : <p className="error-message" role="alert">El enlace de la reunión no es válido.</p>}
    </>
  )
}
