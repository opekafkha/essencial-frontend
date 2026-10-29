import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { loadTypeScript } from './load-typescript.mjs'
const moduleUrl = source => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`
const { AppLayout } = await loadTypeScript('src/components/Design.tsx', {
  imports: {
    '../context/useAuth': moduleUrl('export function useAuth() { return { profile: { nombre: "Persona de prueba", email: "person@example.com", role: "miembro" }, signOut: async () => { globalThis.__sidebarSignOuts++ } }; }'),
  },
})
function CurrentPath() { return createElement('p', { id: 'current-path' }, useLocation().pathname) }

test('sidebar only collapses from the logo and account popover handles dismissal and sign out', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://essencial.test/join/example' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  globalThis.__sidebarSignOuts = 0
  const root = createRoot(document.getElementById('root'))
  const click = element => act(async () => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true })))
  try {
    await act(async () => root.render(createElement(MemoryRouter, { initialEntries: ['/join/example'] },
      createElement(AppLayout, null, createElement(CurrentPath)))))
    const layout = document.querySelector('.app-layout')
    assert.equal(layout.dataset.sidebarCollapsed, 'false', 'joining a call must not automatically collapse')
    assert.equal(document.querySelector('.sidebar-toggle'), null)
    await click(document.querySelector('.sidebar-brand-toggle'))
    assert.equal(layout.dataset.sidebarCollapsed, 'true')
    assert.equal(window.sessionStorage.getItem('essencial.sidebar.collapsed'), 'true')
    assert.equal(document.getElementById('current-path').textContent, '/join/example', 'logo must toggle instead of navigating')
    const user = document.querySelector('button.sidebar-user')
    await click(user)
    let dialog = document.querySelector('[role="dialog"][aria-hidden="false"]')
    assert.ok(dialog)
    assert.equal(dialog.parentElement, document.body, 'popover must escape the sidebar overflow')
    assert.match(dialog.textContent, /person@example.com/)
    assert.match(dialog.textContent, /Plan Esencial/)
    assert.match(dialog.textContent, /Sin compra vinculada/)
    assert.equal(user.getAttribute('aria-expanded'), 'true')
    await act(async () => document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })))
    assert.equal(document.querySelector('[role="dialog"][aria-hidden="false"]'), null)
    assert.equal(document.activeElement, user)
    await click(user)
    await act(async () => document.body.dispatchEvent(new window.Event('pointerdown', { bubbles: true })))
    assert.equal(document.querySelector('[role="dialog"][aria-hidden="false"]'), null)
    await click(user)
    dialog = document.querySelector('[role="dialog"][aria-hidden="false"]')
    await click([...dialog.querySelectorAll('button')].find(button => button.textContent.includes('Cerrar sesión')))
    assert.equal(globalThis.__sidebarSignOuts, 1)
    assert.equal(document.querySelector('[role="dialog"][aria-hidden="false"]'), null)
    assert.equal(layout.dataset.sidebarCollapsed, 'true', 'account actions must not change collapse state')
    await click(document.querySelector('button.sidebar-user'))
    dialog = document.querySelector('[role="dialog"][aria-hidden="false"]')
    await click([...dialog.querySelectorAll('button')].find(button => button.textContent.includes('Gestionar perfil')))
    assert.equal(document.getElementById('current-path').textContent, '/perfil')
    assert.equal(document.querySelector('[role="dialog"][aria-hidden="false"]'), null, 'profile navigation must close the popover')

  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
    delete globalThis.__sidebarSignOuts
  }
})

function ExampleView() {
  return createElement('section', null,
    createElement('input', { 'aria-label': 'Borrador', defaultValue: '' }),
    createElement(Link, { to: '/dashboard?vista=otra' }, 'Cambiar sección'),
    createElement(Link, { to: '/perfil' }, 'Abrir perfil'))
}

test('view navigation preserves the sidebar and query changes preserve the current form', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://essencial.test/dashboard' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const root = createRoot(document.getElementById('root'))
  const click = element => act(async () => element.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })))
  try {
    await act(async () => root.render(createElement(MemoryRouter, { initialEntries: ['/dashboard'] },
      createElement(Routes, null, createElement(Route, { element: createElement(AppLayout) },
        createElement(Route, { path: '/dashboard', element: createElement(ExampleView) }),
        createElement(Route, { path: '/perfil', element: createElement('h1', null, 'Mi perfil') }),
      )))))
    const sidebar = document.querySelector('.sidebar')
    const page = document.querySelector('.page-view')
    const draft = document.querySelector('input')
    draft.value = 'Contenido que debe conservarse'
    await click(document.querySelector('.sidebar-brand-toggle'))
    await click([...document.querySelectorAll('a')].find(link => link.textContent === 'Cambiar sección'))
    assert.equal(document.querySelector('input'), draft)
    assert.equal(draft.value, 'Contenido que debe conservarse')
    await click([...document.querySelectorAll('a')].find(link => link.textContent === 'Abrir perfil'))
    assert.equal(document.querySelector('.sidebar'), sidebar)
    assert.equal(document.querySelector('.page-view'), page)
    assert.equal(document.querySelectorAll('.sidebar').length, 1)
    assert.equal(document.querySelector('.app-layout').dataset.sidebarCollapsed, 'true')
    assert.match(page.textContent, /Mi perfil/)
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
