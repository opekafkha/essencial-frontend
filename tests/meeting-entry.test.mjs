import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createElement, act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { loadTypeScript } from './load-typescript.mjs'

const reactUrl = JSON.stringify(import.meta.resolve('react'))
const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const sdk = moduleUrl(`
  import { createElement, useEffect } from ${reactUrl};
  export function PreJoin(props) {
    globalThis.__meetingTest.previewProps = props;
    return createElement('button', { onClick: () => props.onSubmit(globalThis.__meetingTest.choices) }, props.joinLabel);
  }
  export function LiveKitRoom(props) {
    globalThis.__meetingTest.roomProps = props;
    useEffect(() => { globalThis.__meetingTest.mounts++; return () => { globalThis.__meetingTest.unmounts++; }; }, []);
    return createElement('div', { id: 'connected-room' }, props.children);
  }
  export function useConnectionState() { return globalThis.__meetingTest.connectionState; }
  export function VideoConference() { return createElement('p', null, 'Videollamada'); }
`)
const { JoinCallPage } = await loadTypeScript('src/pages/JoinCallPage.tsx', {
  env: { VITE_LIVEKIT_URL: 'wss://meeting.test' },
  imports: {
    '@livekit/components-react': sdk,
    'livekit-client': moduleUrl('export const DisconnectReason = { CLIENT_INITIATED: 1, DUPLICATE_IDENTITY: 2 }; export const ConnectionState = { Connected: "connected", Reconnecting: "reconnecting", SignalReconnecting: "signalReconnecting" };'),
    '../components/Design': moduleUrl(`import { createElement } from ${reactUrl}; export function AppLayout({ children }) { return createElement('main', null, children); } export function PageHeading() { return null; }`),
    '../context/useAuth': moduleUrl('export function useAuth() { return { profile: { nombre: "Doctora de prueba", role: "admin" }, session: null }; }'),
    '../shared': moduleUrl('export const getVideoRoomResponseSchema = { safeParse(data) { return { success: true, data }; } };'),
    '../lib/backendClient': moduleUrl('export const backendClient = { async get() { return { token: "test-token" }; }, async post(path) { globalThis.__meetingTest.entries.push(path); return { ok: true }; } };'),
  },
})

for (const enabled of [true, false]) {
  test(`does not connect before explicit entry and respects devices enabled=${enabled}`, async () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://meeting.test' })
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    globalThis.__meetingTest = {
      mounts: 0, unmounts: 0, entries: [], connectionState: 'connecting',
      choices: { username: 'Doctora de prueba', audioEnabled: enabled, videoEnabled: enabled, audioDeviceId: 'mic-2', videoDeviceId: 'cam-3' },
    }
    const root = createRoot(document.getElementById('root'))
    const previousError = console.error
    console.error = () => {}
    try {
      await act(async () => root.render(createElement(MemoryRouter, { initialEntries: ['/join/example-room'] },
        createElement(Routes, null, createElement(Route, { path: '/join/:slug', element: createElement(JoinCallPage) })))))
      assert.equal(globalThis.__meetingTest.mounts, 0, 'preview must not mount the room')
      assert.equal(document.getElementById('connected-room'), null)
      assert.match(document.body.textContent, /Todavía no has entrado/)
      assert.equal(globalThis.__meetingTest.previewProps.defaults.username, 'Doctora de prueba')
      await act(async () => [...document.querySelectorAll('button')].find((button) => button.textContent === 'Entrar a la reunión').click())
      assert.equal(globalThis.__meetingTest.mounts, 1)
      assert.ok(document.getElementById('connected-room'))
      assert.match(document.querySelector('.call-connection-overlay').textContent, /Uniéndote a la reunión/);
      assert.deepEqual(globalThis.__meetingTest.entries, [], 'preview and mounting must not register attendance')
      const props = globalThis.__meetingTest.roomProps
      globalThis.__meetingTest.connectionState = 'connected'
      await act(async () => props.onConnected())
      assert.deepEqual(globalThis.__meetingTest.entries, ['/video-rooms/example-room/participants'])
      assert.equal(document.querySelector('.call-connection-overlay'), null)
      assert.deepEqual(props.audio, enabled ? { deviceId: 'mic-2' } : false)
      assert.deepEqual(props.video, enabled ? { deviceId: 'cam-3' } : false)
      // A device failure must keep the room alive and keep SDK handlers stable.
      globalThis.__meetingTest.connectionState = 'reconnecting'
      await act(async () => props.onMediaDeviceFailure())
      assert.match(document.querySelector('.call-connection-overlay').textContent, /Recuperando la conexión/)
      assert.equal(globalThis.__meetingTest.unmounts, 0)
      assert.equal(globalThis.__meetingTest.roomProps.onError, props.onError)
      assert.equal(globalThis.__meetingTest.roomProps.audio, props.audio)
      await act(async () => props.onDisconnected(2))
      assert.match(document.querySelector('[role="alert"]').textContent, /otra pestaña o dispositivo/)
      await act(async () => [...document.querySelectorAll('button')].find((button) => button.textContent === 'Volver a entrar').click())
      assert.match(document.body.textContent, /Todavía no has entrado/)
      assert.equal(globalThis.__meetingTest.mounts, 1, 'retry must return to preview instead of reconnecting automatically')
    } finally {
      await act(async () => root.unmount())
      console.error = previousError
      dom.window.close()
      delete globalThis.window
      delete globalThis.document
      delete globalThis.IS_REACT_ACT_ENVIRONMENT
      delete globalThis.__meetingTest
    }
  })
}
