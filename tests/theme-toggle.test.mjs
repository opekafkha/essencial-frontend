import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { JSDOM } from 'jsdom'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { loadTypeScript } from './load-typescript.mjs'
const { ThemeToggle } = await loadTypeScript('src/components/ThemeToggle.tsx')

test('theme toggle applies and saves the preference, restores it, and synchronizes external changes', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://essencial.test' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  let root = createRoot(document.getElementById('root'))
  const click = () => act(async () => document.querySelector('[role="switch"]').click())
  try {
    await act(async () => root.render(createElement(ThemeToggle)))
    assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'false')
    await click()
    assert.equal(document.documentElement.dataset.theme, 'dark')
    assert.equal(window.localStorage.getItem('essencial.theme'), 'dark')
    assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'true')
    await act(async () => root.unmount())
    delete document.documentElement.dataset.theme
    root = createRoot(document.getElementById('root'))
    await act(async () => root.render(createElement(ThemeToggle)))
    assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'true')
    await act(async () => window.dispatchEvent(new window.StorageEvent('storage', { key: 'essencial.theme', newValue: 'light' })))
    assert.equal(document.documentElement.dataset.theme, 'light')
    assert.equal(document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'false')
    // A manual choice still works if the browser refuses persistence.
    Object.defineProperty(window, 'localStorage', { configurable: true, get() { throw new Error('Storage unavailable') } })
    await click()
    assert.equal(document.documentElement.dataset.theme, 'dark')
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})

test('saved dark theme is applied by the HTML bootstrap before React starts', () => {
  const html = readFileSync('index.html', 'utf8')
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1]
  assert.ok(script)
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url: 'https://essencial.test', runScripts: 'outside-only' })
  try {
    dom.window.localStorage.setItem('essencial.theme', 'dark')
    dom.window.eval(script)
    assert.equal(dom.window.document.documentElement.dataset.theme, 'dark')
  } finally { dom.window.close() }
})
