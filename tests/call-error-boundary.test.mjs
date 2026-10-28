import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { createElement, useState, act } from 'react'
import { createRoot } from 'react-dom/client'
import { loadTypeScript } from './load-typescript.mjs'

const { CallErrorBoundary } = await loadTypeScript('src/components/CallErrorBoundary.tsx')

test('catches a real insertBefore DOM failure and lets the user remount the call', async () => {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>')
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const root = createRoot(document.getElementById('root'))
  const logged = []
  const previousError = console.error
  console.error = (...args) => logged.push(args)
  let toggle

  function Conference({ recovered }) {
    const [visible, setVisible] = useState(false)
    toggle = setVisible
    if (recovered) return createElement('p', null, 'Sala recuperada')
    return createElement('div', { id: 'dynamic-label' }, visible ? createElement('i', null, 'icon') : null, 'Camera')
  }
  function Harness() {
    const [attempt, setAttempt] = useState(0)
    return createElement('main', null,
      createElement('nav', null, 'Mi inicio'),
      createElement(CallErrorBoundary, { key: attempt, onRetry: () => setAttempt(attempt + 1) },
        createElement(Conference, { recovered: attempt > 0 })))
  }

  try {
    await act(async () => root.render(createElement(Harness)))
    // Simulate a translator reparenting a text node that React still owns.
    const label = document.getElementById('dynamic-label')
    const text = label.firstChild
    const translated = document.createElement('font')
    label.replaceChild(translated, text)
    translated.appendChild(text)
    await act(async () => toggle(true))

    assert.match(document.querySelector('[role="alert"]').textContent, /No pudimos mostrar la videollamada/)
    assert.equal(document.querySelector('nav').textContent, 'Mi inicio')
    assert.ok(logged.some((args) => args.some((value) => value?.name === 'NotFoundError')),
      'the test must trigger the actual DOM error, not a synthetic render exception')

    await act(async () => document.querySelector('button').click())
    assert.match(document.body.textContent, /Sala recuperada/)
    assert.equal(document.querySelector('[role="alert"]'), null)
  } finally {
    await act(async () => root.unmount())
    console.error = previousError
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
