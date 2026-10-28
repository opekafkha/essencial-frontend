/** Extract the meeting route, keeping navigation on this app even for LAN links. */
export function parseMeetingLink(value: string): string | null {
  const input = value.trim()
  if (!input) return null

  try {
    // Shared links may use a different host (localhost / another LAN address).
    // Only their room identifier is used; never navigate to the supplied origin.
    if (!input.startsWith('/join/') && !/^https?:\/\//i.test(input)) return null
    const url = new URL(input, 'https://essencial.invalid')
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) return null
    const match = /^\/join\/([a-zA-Z0-9_-]{1,128})\/?$/.exec(url.pathname)
    return match ? `/join/${match[1]}` : null
  } catch {
    return null
  }
}
