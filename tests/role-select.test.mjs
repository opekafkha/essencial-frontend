import test from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { act, createElement, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { loadTypeScript } from './load-typescript.mjs'
const { RoleSelect } = await loadTypeScript('src/components/RoleSelect.tsx')

test('role popover supports keyboard, selection, dismissal and disabled state', async () => {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', { url: 'https://essencial.test/admin' })
  globalThis.window = dom.window
  globalThis.document = dom.window.document
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  const changes = []
  function Harness({ disabled = false }) {
    const [value, setValue] = useState('miembro')
    return createElement(RoleSelect, { value, disabled, label: 'Rol de prueba', onChange: next => { changes.push(next); setValue(next) } })
  }
  const root = createRoot(document.getElementById('root'))
  const combo = () => document.querySelector('[role="combobox"]')
  const popup = () => document.querySelector('[role="listbox"][aria-hidden="false"]')
  const key = value => act(async () => combo().dispatchEvent(new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true })))
  try {
    await act(async () => root.render(createElement(Harness)))
    combo().focus()
    await key('ArrowDown')
    assert.ok(popup())
    assert.equal(popup().parentElement, document.body)
    await key('ArrowDown')
    assert.match(combo().getAttribute('aria-activedescendant'), /profesional$/)
    assert.equal(changes.length, 0, 'keyboard highlight must not save before selection')
    await key('Enter')
    assert.deepEqual(changes, ['profesional'])
    assert.equal(popup(), null)
    assert.match(combo().textContent, /Profesional/)
    assert.equal(document.activeElement, combo())
    await act(async () => combo().click())
    await act(async () => document.querySelector('[role="option"][data-role="admin"]').click())
    assert.deepEqual(changes, ['profesional', 'admin'])
    await act(async () => combo().click())
    await key('Escape')
    assert.equal(popup(), null)
    await act(async () => combo().click())
    await act(async () => document.body.dispatchEvent(new window.Event('pointerdown', { bubbles: true })))
    assert.equal(popup(), null)
    await act(async () => root.render(createElement(Harness, { disabled: true })))
    assert.equal(combo().disabled, true)
    await act(async () => combo().click())
    assert.equal(popup(), null)
    assert.equal(changes.length, 2)
  } finally {
    await act(async () => root.unmount())
    dom.window.close()
    delete globalThis.window
    delete globalThis.document
    delete globalThis.IS_REACT_ACT_ENVIRONMENT
  }
})
