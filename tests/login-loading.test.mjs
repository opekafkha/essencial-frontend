import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createElement, act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { loadTypeScript } from './load-typescript.mjs'

const moduleUrl = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const { LoginPage } = await loadTypeScript('src/pages/LoginPage.tsx', {
  imports: {
    '../shared': moduleUrl('export const loginSchema = { safeParse() { return { success: true, data: { email: "admin@local.dev", password: "example-password" } }; } };'),
    '../lib/supabaseClient': moduleUrl('export const supabase = { auth: { signInWithPassword() { return globalThis.__loginRequest; } } };'),
  },
})

const { AuthLayout } = await loadTypeScript('src/components/Design.tsx')

for (const outcome of ['network-error', 'invalid-credentials', 'success']) {
  test(`login loader follows pending request and clears on ${outcome}`, async () => {
    const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://meeting.test/login' })
    globalThis.window = dom.window
    globalThis.document = dom.window.document
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    let resolveRequest
    let rejectRequest
    globalThis.__loginRequest = new Promise((resolve, reject) => { resolveRequest = resolve; rejectRequest = reject })
    const root = createRoot(document.getElementById('root'))
    try {
      await act(async () => root.render(createElement(MemoryRouter, { initialEntries: ['/login'] },
        createElement(Routes, null,
          createElement(Route, { element: createElement(AuthLayout) },
            createElement(Route, { path: '/login', element: createElement(LoginPage) })),
          createElement(Route, { path: '/dashboard', element: createElement('p', null, 'Inicio de mi cuenta') })))))
      assert.equal(document.querySelector('.auth-seam-tab [role="status"]'), null)
      await act(async () => document.querySelector('form').dispatchEvent(new window.Event('submit', { bubbles: true, cancelable: true })))
      assert.ok(document.querySelector('.auth-seam-tab [role="status"]'))
      assert.equal(document.querySelector('.auth-seam-tab').querySelectorAll('.essencial-loader__bar').length, 14)
      assert.equal(document.querySelector('button[type="submit"]').disabled, true)
      await act(async () => {
        if (outcome === 'network-error') rejectRequest(new Error('Network unavailable'))
        else resolveRequest({ error: outcome === 'invalid-credentials' ? { message: 'Invalid login credentials' } : null })
      })
      assert.equal(document.querySelector('.auth-seam-tab [role="status"]'), null)
      if (outcome === 'success') {
        assert.match(document.body.textContent, /Inicio de mi cuenta/)
      } else {
        assert.equal(document.querySelector('button[type="submit"]').disabled, false)
        assert.match(document.querySelector('[role="alert"]').textContent, outcome === 'network-error' ? /Revisa tu conexión/ : /Correo o contraseña incorrectos/)
      }
    } finally {
      await act(async () => root.unmount())
      dom.window.close()
      delete globalThis.window
      delete globalThis.document
      delete globalThis.IS_REACT_ACT_ENVIRONMENT
      delete globalThis.__loginRequest
    }
  })
}
