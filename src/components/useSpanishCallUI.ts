import { useLayoutEffect, type RefObject } from 'react'

// The installed LiveKit prefab has no locale prop. Limit the adapter to SDK
// chrome: never walk chat entries, participant names, or device option labels.
const labels: Record<string, string> = {
  Microphone: 'Micrófono', Camera: 'Cámara', 'Share screen': 'Pantalla',
  'Stop screen share': 'Dejar de compartir', Leave: 'Salir', Messages: 'Mensajes',
  Send: 'Enviar', Settings: 'Configuración', 'Enter a message...': 'Escribe un mensaje…',
  Connecting: 'Conectando', Reconnecting: 'Reconectando', Disconnected: 'Desconectado',
  'Start Audio': 'Activar audio', 'Start Video': 'Activar video',
  'Audio inputs': 'Micrófonos', 'Video inputs': 'Cámaras',
}
const chrome = '.lk-control-bar button, .lk-chat-header, .lk-chat-form, .lk-toast-connection-state, .lk-device-menu-heading, .lk-prejoin button'

export function localizeCallUI(root: HTMLElement) {
  for (const element of root.querySelectorAll<HTMLElement>(chrome)) {
    if (element.closest('.lk-device-menu') && !element.matches('.lk-device-menu-heading')) continue
    const walker = root.ownerDocument.createTreeWalker(element, 4)
    let node: Node | null
    while ((node = walker.nextNode())) {
      // The header's close button contains only an icon; preserve every node.
      const original = node.nodeValue ?? ''
      const translated = labels[original.trim()]
      if (translated) node.nodeValue = original.replace(original.trim(), translated)
    }
    for (const input of [element, ...element.querySelectorAll<HTMLElement>('[placeholder], [title], [aria-label]')]) {
      for (const attribute of ['placeholder', 'title', 'aria-label']) {
        const original = input.getAttribute(attribute)
        if (original && labels[original]) input.setAttribute(attribute, labels[original])
      }
    }
  }
  for (const name of root.querySelectorAll('.lk-participant-name')) {
    const suffix = name.lastChild
    if (name.childNodes.length > 1 && suffix?.nodeType === 3 && suffix.nodeValue === "'s screen") suffix.nodeValue = ' · Pantalla'
  }
  for (const button of root.querySelectorAll<HTMLElement>('.lk-control-bar button, .lk-prejoin button, .lk-chat-header button')) {
    const source = button.dataset.lkSource
    const enabled = button.dataset.lkEnabled === 'true'
    let label: string | undefined
    if (source === 'microphone') label = enabled ? 'Silenciar micrófono' : 'Activar micrófono'
    if (source === 'camera') label = enabled ? 'Apagar cámara' : 'Activar cámara'
    if (source === 'screen_share') label = enabled ? 'Dejar de compartir pantalla' : 'Pantalla'
    if (button.classList.contains('lk-disconnect-button')) label = 'Salir de la llamada'
    if (button.classList.contains('lk-chat-toggle')) label = button.classList.contains('lk-close-button') || button.getAttribute('aria-pressed') === 'true' ? 'Cerrar chat' : 'Abrir chat'
    if (label) {
      button.setAttribute('aria-label', label)
      button.setAttribute('title', label)
    }
  }
}

export function useSpanishCallUI(ref: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const options: MutationObserverInit = { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['placeholder', 'title', 'aria-label', 'aria-pressed', 'data-lk-enabled'] }
    const observer = new window.MutationObserver(() => {
      observer.disconnect()
      localizeCallUI(root)
      observer.observe(root, options)
    })
    localizeCallUI(root)
    observer.observe(root, options)
    return () => observer.disconnect()
  }, [ref])
}
