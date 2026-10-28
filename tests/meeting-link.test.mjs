import test from 'node:test'
import assert from 'node:assert/strict'
import { loadTypeScript } from './load-typescript.mjs'

const { parseMeetingLink } = await loadTypeScript('src/lib/meeting-link.ts')
const slug = '65c6844b-737b-4568-9831-ab2f0d8038a7'

test('opens shared LAN and localhost meeting links on the current app', () => {
  for (const host of ['https://192.168.1.6:5173', 'https://localhost:5173', 'http://localhost:5173']) {
    assert.equal(parseMeetingLink(`  ${host}/join/${slug}?source=invite#room  `), `/join/${slug}`)
  }
  assert.equal(parseMeetingLink(`/join/${slug}/`), `/join/${slug}`)
})

test('rejects empty input, other routes, scripts, credentials and malformed room paths', () => {
  for (const input of ['', '   ', 'not a URL', 'javascript:alert(1)', 'https://example.com/login',
    'https://example.com/join/', 'https://example.com/join/one/extra',
    'https://example.com/join/%2Fadmin', '//example.com/join/abc',
    'https://user:password@example.com/join/abc', 'https://example.com/join/<script>']) {
    assert.equal(parseMeetingLink(input), null, input)
  }
})
