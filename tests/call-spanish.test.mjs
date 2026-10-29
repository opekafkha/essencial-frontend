import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { loadTypeScript } from './load-typescript.mjs'
const { localizeCallUI } = await loadTypeScript('src/components/useSpanishCallUI.ts')
test('traduce controles y chat conservando iconos, mensajes y nombres', () => {
 const dom = new JSDOM(`<main><div class="lk-control-bar"><button data-lk-source="screen_share" data-lk-enabled="false"><svg></svg>Share screen</button><div class="lk-device-menu"><button>Camera</button></div></div><div class="lk-chat-header">Messages</div><form class="lk-chat-form"><input placeholder="Enter a message..."><button>Send</button></form><div class="lk-chat-messages">Share screen</div><div class="lk-participant-name">Camera</div><option>Microphone</option></main>`)
 const root = dom.window.document.querySelector('main')
 const icon = root.querySelector('svg')
 localizeCallUI(root)
 assert.equal(root.querySelector('button').textContent, 'Pantalla')
 assert.equal(root.querySelector('svg'), icon)
 assert.equal(root.querySelector('input').placeholder, 'Escribe un mensaje…')
 assert.equal(root.querySelector('.lk-chat-header').textContent, 'Mensajes')
 assert.equal(root.querySelector('.lk-chat-messages').textContent, 'Share screen')
 assert.equal(root.querySelector('.lk-participant-name').textContent, 'Camera')
 assert.equal(root.querySelector('option').textContent, 'Microphone')
 assert.equal(root.querySelector('.lk-device-menu button').textContent, 'Camera')
 const button = root.querySelector('button')
 button.lastChild.nodeValue = 'Stop screen share'
 button.dataset.lkEnabled = 'true'
 localizeCallUI(root)
 assert.equal(button.textContent, 'Dejar de compartir')
 assert.equal(button.getAttribute('aria-label'), 'Dejar de compartir pantalla')
})
