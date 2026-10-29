import { Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useTheme } from '../features/theme/useTheme'
import './ThemeToggle.css'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [hasChanged, setHasChanged] = useState(false)
  const dark = theme === 'dark'
  const Icon = dark ? Moon : Sun
  return <button type="button" className="theme-toggle" role="switch" aria-checked={dark} aria-label="Modo oscuro" title={dark ? 'Activar modo claro' : 'Activar modo oscuro'} onClick={() => { setHasChanged(true); toggleTheme() }}>
    <Icon key={theme} className="theme-toggle__icon" data-animate={hasChanged ? '' : undefined} aria-hidden="true" size={20} strokeWidth={1.7} />
  </button>
}
