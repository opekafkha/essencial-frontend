import { Check, ChevronDown } from 'lucide-react'
import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { ROLES, type Role } from '../shared/constants/roles'

interface Props { value: Role; disabled?: boolean; label: string; onChange: (role: Role) => void }
const labels: Record<Role, string> = { miembro: 'Miembro', profesional: 'Profesional', admin: 'Admin' }

export function RoleSelect({ value, disabled = false, label, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const id = useId()
  const visible = open && !disabled

  useLayoutEffect(() => {
    if (!visible) return
    const position = () => {
      if (!trigger.current || !menu.current) return
      const rect = trigger.current.getBoundingClientRect()
      const width = Math.min(Math.max(rect.width, 190), window.innerWidth - 24)
      menu.current.style.width = `${width}px`
      menu.current.style.left = `${Math.max(12, Math.min(rect.left, window.innerWidth - width - 12))}px`
      const height = menu.current.offsetHeight
      const below = rect.bottom + 8
      menu.current.style.top = `${below + height <= window.innerHeight - 12 ? below : Math.max(12, rect.top - height - 8)}px`
    }
    position()
    window.addEventListener('resize', position)
    window.addEventListener('scroll', position, true)
    return () => {
      window.removeEventListener('resize', position)
      window.removeEventListener('scroll', position, true)
    }
  }, [visible])

  useEffect(() => {
    if (!visible) return
    const outside = (event: Event) => {
      const target = event.target as Node | null
      if (target && !trigger.current?.contains(target) && !menu.current?.contains(target)) setOpen(false)
    }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('focusin', outside)
    return () => {
      document.removeEventListener('pointerdown', outside)
      document.removeEventListener('focusin', outside)
    }
  }, [visible])

  function show(index = ROLES.indexOf(value)) { setActive(index); setOpen(true) }
  function choose(role: Role) {
    setOpen(false)
    trigger.current?.focus()
    if (role !== value) onChange(role)
  }
  function keyboard(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.ctrlKey || event.metaKey || event.altKey) return
    if (event.key === 'Tab') { setOpen(false); return }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!visible) show()
      else setActive(index => (index + (event.key === 'ArrowDown' ? 1 : -1) + ROLES.length) % ROLES.length)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      if (visible) choose(ROLES[active])
      else show()
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault(); show(event.key === 'Home' ? 0 : ROLES.length - 1)
    } else if (event.key.length === 1) {
      const index = ROLES.findIndex(role => labels[role].toLowerCase().startsWith(event.key.toLowerCase()))
      if (index >= 0) { event.preventDefault(); show(index) }
    }
  }

  return <div className="admin-role-control" data-role={value}>
    <button ref={trigger} type="button" className="admin-role-select" role="combobox" aria-haspopup="listbox" aria-label={label} aria-expanded={visible} aria-controls={id} aria-activedescendant={visible ? `${id}-${ROLES[active]}` : undefined} disabled={disabled} onKeyDown={keyboard} onClick={() => visible ? setOpen(false) : show()}>
      <span className="admin-role-dot" aria-hidden="true" /><span className="admin-role-label">{labels[value]}</span><ChevronDown className="admin-role-chevron" size={14} strokeWidth={1.7} aria-hidden="true" />
    </button>
    {createPortal(<div ref={menu} id={id} className="admin-role-popover" role="listbox" aria-label={label} aria-hidden={!visible} inert={!visible} data-open={visible ? '' : undefined} onMouseDown={event => event.preventDefault()}>
      {ROLES.map((role, index) => <div key={role} id={`${id}-${role}`} className="admin-role-option" role="option" aria-selected={role === value} data-role={role} data-highlighted={active === index ? '' : undefined} onPointerMove={() => setActive(index)} onClick={() => choose(role)}>
        <span className="admin-role-option-dot" aria-hidden="true" /><span>{labels[role]}</span><Check size={15} strokeWidth={1.8} className="admin-role-check" aria-hidden="true" />
      </div>)}
    </div>, document.body)}
  </div>
}
