import { useEffect, useRef } from 'react'
import { useRemoteParticipants } from '@livekit/components-react'
import { sileo } from 'sileo'

// Vive dentro de <LiveKitRoom> (necesita el contexto de la sala). No renderiza
// nada — solo dispara toasts cuando la lista de participantes remotos cambia.
export function CallNotifications() {
  const participants = useRemoteParticipants()
  const seen = useRef<Set<string> | null>(null)

  useEffect(() => {
    if (seen.current === null) {
      // Primer render con la sala ya conectada: si ya había alguien, la
      // reunión estaba en curso antes de que entraras.
      if (participants.length > 0) {
        sileo.info({ title: 'Te uniste a una reunión en curso', description: `Ya hay ${participants.length} ${participants.length === 1 ? 'persona' : 'personas'} en la sala.` })
      }
      seen.current = new Set(participants.map((p) => p.identity))
      return
    }

    for (const participant of participants) {
      if (seen.current.has(participant.identity)) continue
      seen.current.add(participant.identity)
      sileo.info({ title: 'Un usuario está llegando', description: `${participant.name || 'Alguien'} se está uniendo a la reunión.` })
    }
  }, [participants])

  return null
}
