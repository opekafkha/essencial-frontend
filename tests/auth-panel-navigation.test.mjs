import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Link, MemoryRouter, Route, Routes } from 'react-router-dom'
import { loadTypeScript } from './load-typescript.mjs'

const { AuthLayout } = await loadTypeScript('src/components/Design.tsx')
function Content({ title, to, label }) {
  return createElement('div', null, createElement('h1', null, title), createElement(Link, { to }, label))
}

test('auth panels keep the same shell across login, registration and email confirmation', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://essencial.test/login' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const root = createRoot(document.getElementById('root'))
  try {
    await act(async () => root.render(createElement(MemoryRouter, { initialEntries: ['/login'] },
      createElement(Routes, null, createElement(Route, { element: createElement(AuthLayout) },
        createElement(Route, { path: '/login', element: createElement(Content, { title: 'Login', to: '/registro', label: 'Registrarme' }) }),
        createElement(Route, { path: '/registro', element: createElement(Content, { title: 'Registro', to: '/revisa-tu-correo', label: 'Revisar correo' }) }),
        createElement(Route, { path: '/revisa-tu-correo', element: createElement(Content, { title: 'Correo', to: '/login', label: 'Volver al login' }) }),
      )))))
    const shell = document.querySelector('.auth-layout')
    const story = document.querySelector('.auth-story')
    const form = document.querySelector('.auth-form')
    const plant = document.querySelector('.auth-botanical')
    assert.equal(shell.dataset.authSide, 'login')
    for (const [label, side, title] of [
      ['Registrarme', 'register', 'Registro'],
      ['Revisar correo', 'register', 'Correo'],
      ['Volver al login', 'login', 'Login'],
    ]) {
      await act(async () => [...document.querySelectorAll('a')].find(link => link.textContent === label)
        .dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })))
      assert.equal(document.querySelector('.auth-layout'), shell, 'navigation must not remount the animated shell')
      assert.equal(document.querySelector('.auth-story'), story)
      assert.equal(document.querySelector('.auth-form'), form)
      assert.equal(document.querySelector('.auth-botanical'), plant)
      assert.equal(shell.dataset.authSide, side)
      assert.equal(form.querySelector('h1').textContent, title)
      assert.equal(document.querySelectorAll('.auth-seam-tab').length, 2)
    }
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
