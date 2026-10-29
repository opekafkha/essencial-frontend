import { useSpanishCallUI } from './useSpanishCallUI'
import { useRef, useCallback, useState } from 'react'
import { PreJoin, type LocalUserChoices } from '@livekit/components-react'
import { Link } from 'react-router-dom'

interface MeetingLobbyProps {
  displayName: string
  onJoin: (choices: LocalUserChoices) => void
}

export function MeetingLobby({ displayName, onJoin }: MeetingLobbyProps) {
  const spanishUIRef = useRef<HTMLElement>(null)
  useSpanishCallUI(spanishUIRef)
  const [notice, setNotice] = useState<string | null>(null)
  const handleDeviceError = useCallback((error: Error) => {
    console.error('Essencial: no se pudo preparar un dispositivo', error)
    setNotice('No pudimos activar la cámara o el micrófono. Revisa los permisos y si otra aplicación los está usando. También puedes apagarlos y entrar sin ellos.')
  }, [])

  return (
    <section ref={spanishUIRef} className="meeting-lobby notranslate" translate="no" aria-label="Preparar entrada a la reunión">
      <div className="lobby-preview" data-lk-theme="default">
        <div className="lobby-preview-heading"><span className="eyebrow">VISTA PREVIA</span><h2>¿Todo listo para conectar?</h2><p>Solo tú puedes ver y escuchar esta preparación.</p></div>
        {notice && <p className="error-message" role="status">{notice}</p>}
        <PreJoin
          defaults={{ username: displayName, audioEnabled: true, videoEnabled: true }}
          persistUserChoices={false}
          joinLabel="Entrar a la reunión"
          micLabel="Micrófono"
          camLabel="Cámara"
          userLabel="Nombre de tu cuenta"
          onError={handleDeviceError}
          onSubmit={onJoin}
        />
        <p className="lobby-identity">Entrarás como <strong>{displayName}</strong></p>
      </div>
      <aside className="lobby-guide">
        <span className="eyebrow">ANTES DE ENTRAR</span>
        <h2>Acomódate.<br />Este momento es tuyo.</h2>
        <ul>
          <li><span aria-hidden="true">◉</span><div><h3>Cámara y micrófono</h3><p>Usa las flechas de cada control para elegir tus dispositivos. Puedes entrar con ambos apagados.</p></div></li>
          <li><span aria-hidden="true">▤</span><div><h3>Chat de la reunión</h3><p>Al entrar, abre el chat desde los controles para escribir y recibir mensajes de quienes estén en la sala.</p></div></li>
          <li><span aria-hidden="true">▣</span><div><h3>Compartir pantalla</h3><p>Dentro de la llamada, pulsa compartir pantalla y elige la pestaña, ventana o pantalla que quieras mostrar.</p></div></li>
        </ul>
        <p className="lobby-private-note">Todavía no has entrado a la sala. Tu cámara y audio no se comparten hasta que pulses «Entrar a la reunión».</p>
        <Link className="text-button" to="/dashboard">Volver al inicio</Link>
      </aside>
    </section>
  )
}
