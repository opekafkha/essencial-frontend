import { useConnectionState } from '@livekit/components-react'
import { ConnectionState } from 'livekit-client'
import { Link } from 'react-router-dom'
import { Loader } from './Loader'

export function CallConnectionOverlay() {
  const state = useConnectionState()
  if (state === ConnectionState.Connected) return null
  const reconnecting = state === ConnectionState.Reconnecting || state === ConnectionState.SignalReconnecting
  return (
    <div className="call-connection-overlay">
      <Loader size="lg" showLabel label={reconnecting ? 'Recuperando la conexión…' : 'Uniéndote a la reunión…'} />
      <Link className="text-button" to="/dashboard">Volver al inicio</Link>
    </div>
  )
}
