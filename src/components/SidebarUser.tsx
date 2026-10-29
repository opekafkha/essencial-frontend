import { LogOut, UserRoundPen, X } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { ProfileRow } from '../shared'
import type { AccountPlan } from '../features/account/useAccountPlan'
import { ThemeToggle } from './ThemeToggle'
import './SidebarUser.css'

interface Props { profile: ProfileRow | null; plan: AccountPlan; onManageProfile: () => void; onSignOut: () => Promise<void>; children?: ReactNode }
export function SidebarUser({ profile, plan, onManageProfile, onSignOut, children }: Props) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const id = useId()
  const name = profile?.nombre || profile?.email || 'Mi cuenta'

  useLayoutEffect(() => {
    if (!open) return
    const position = () => {
      const panel = panelRef.current
      const trigger = triggerRef.current
      if (!panel || !trigger) return
      const rect = trigger.getBoundingClientRect()
      const width = Math.min(280, window.innerWidth - 24)
      const beside = window.innerWidth > 720 && rect.right + width + 24 <= window.innerWidth
      panel.style.left = `${beside ? rect.right + 12 : Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`
      panel.style.bottom = `${beside ? Math.max(12, window.innerHeight - rect.bottom) : 12}px`
    }
    position()
    panelRef.current?.focus()
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true)
    return () => {
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const outside = (event: Event) => {
      const target = event.target as Node | null
      if (target && !panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); triggerRef.current?.focus() }
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    document.addEventListener('keydown', escape)
    const historyChange = () => setOpen(false)
    window.addEventListener('popstate', historyChange)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
      document.removeEventListener('keydown', escape)
      window.removeEventListener('popstate', historyChange)
    }
  }, [open])

  async function signOut() {
    setPending(true)
    setError('')
    try { await onSignOut(); setOpen(false) }
    catch { setError('No se pudo cerrar la sesión. Intenta de nuevo.') }
    finally { setPending(false) }
  }

  return <>
    <button ref={triggerRef} type="button" className="sidebar-user" title={name} aria-label={`Abrir opciones de ${name}`} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined} onClick={() => setOpen(value => !value)}>
      <span className="avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span>
      <span className="sidebar-user-details"><strong>{profile?.nombre || 'Mi cuenta'}</strong><small>{profile?.role || 'Cargando perfil…'}<span className="sidebar-plan-name">{plan.name}</span></small></span>
    </button>
    {createPortal(<div ref={panelRef} id={id} className="sidebar-user-popover" data-open={open ? '' : undefined} role="dialog" aria-hidden={!open} inert={!open} aria-labelledby={`${id}-title`} tabIndex={-1}>
      <div className="sidebar-user-popover__heading"><strong id={`${id}-title`}>Mi cuenta</strong><button type="button" aria-label="Cerrar opciones de cuenta" onClick={() => { setOpen(false); triggerRef.current?.focus() }}><X size={17} strokeWidth={1.7} aria-hidden="true" /></button></div>
      <div className="sidebar-user-popover__profile"><strong>{name}</strong><span>{profile?.email}</span><span className="badge">{profile?.role || 'Cargando perfil…'}</span></div>
      <div className="sidebar-user-popover__plan"><span>Tu plan</span><strong>{plan.name}</strong>{plan.preview && <small>Vista previa · Sin compra vinculada</small>}</div>
      <button type="button" className="sidebar-user-popover__profile-action" onClick={() => { setOpen(false); onManageProfile() }}><span>Gestionar perfil</span><UserRoundPen size={16} strokeWidth={1.7} aria-hidden="true" /></button>
      {children && <div className="sidebar-user-popover__settings">{children}</div>}
      {error && <p role="alert" className="error-message">{error}</p>}
      <ThemeToggle />
      <button type="button" className="sidebar-user-popover__signout" disabled={pending} onClick={() => void signOut()}>{pending ? 'Cerrando sesión…' : 'Cerrar sesión'}<LogOut size={16} strokeWidth={1.7} aria-hidden="true" /></button>
    </div>, document.body)}
  </>
}
