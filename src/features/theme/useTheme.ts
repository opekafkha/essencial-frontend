import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'
const STORAGE_KEY = 'essencial.theme'
const CHANGE_EVENT = 'essencial-theme-change'

function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light'
  const current = document.documentElement.dataset.theme
  if (current === 'dark' || current === 'light') return current
  try { return window.localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light' } catch { return 'light' }
}

function subscribe(onChange: () => void) {
  const storage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return
    document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light'
    onChange()
  }
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener('storage', storage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener('storage', storage)
  }
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark'
  document.documentElement.dataset.theme = next
  try { window.localStorage.setItem(STORAGE_KEY, next) } catch { /* Keep working when storage is unavailable. */ }
  window.dispatchEvent(new window.Event(CHANGE_EVENT))
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as const)
  return { theme, toggleTheme }
}
