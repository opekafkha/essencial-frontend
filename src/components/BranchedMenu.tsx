import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import './BranchedMenu.css'

export interface BranchedMenuChild { value: string; label: string; icon?: ReactNode }
export interface BranchedMenuItem { label: string; icon?: ReactNode; value?: string; children?: BranchedMenuChild[] }
interface Props {
  items: BranchedMenuItem[]; defaultOpen?: number[]; active: string
  onSelect: (value: string) => void
}

const PAD = 6
const ROW = 36
const TRUNK = 14
const RADIUS = 10
const END = 32
const rowY = (index: number) => PAD + index * ROW + ROW / 2
const branch = (index: number) => `M ${TRUNK} ${rowY(index) - RADIUS} A ${RADIUS} ${RADIUS} 0 0 0 ${TRUNK + RADIUS} ${rowY(index)} H ${END}`
const reach = (index: number) => `M ${TRUNK} 0 V ${rowY(index) - RADIUS} A ${RADIUS} ${RADIUS} 0 0 0 ${TRUNK + RADIUS} ${rowY(index)} H ${END}`
const length = (index: number) => rowY(index) - RADIUS + Math.PI * RADIUS / 2 + END - TRUNK - RADIUS

export default function BranchedMenu({ items, defaultOpen = [0], active, onSelect }: Props) {
  const [open, setOpen] = useState(() => new Set(defaultOpen))
  const navRef = useRef<HTMLElement>(null)
  const heads = useRef<(HTMLButtonElement | null)[]>([])
  const markerRef = useRef<HTMLSpanElement>(null)
  const activeSection = items.findIndex(item => item.children?.some(child => child.value === active))
  const markerShown = activeSection >= 0 && open.has(activeSection)

  useLayoutEffect(() => {
    const place = () => {
      const marker = markerRef.current
      const head = heads.current[activeSection]
      if (!marker) return
      if (markerShown && head) marker.style.top = `${head.offsetTop + (head.offsetHeight - 16) / 2}px`
      marker.toggleAttribute('data-on', Boolean(markerShown && head))
    }
    place()
    const observer = new ResizeObserver(place)
    if (navRef.current) observer.observe(navRef.current)
    return () => observer.disconnect()
  }, [activeSection, markerShown, items])

  return <nav ref={navRef} className="branched-menu" aria-label="Administración">
    <span ref={markerRef} className="branched-menu__marker" aria-hidden="true" />
    {items.map((item, i) => {
      const kids = item.children
      const isOpen = open.has(i)
      const bodyHeight = kids ? PAD * 2 + kids.length * ROW : 0
      return <div key={item.value ?? item.label} className="branched-menu__section" data-open={isOpen ? '' : undefined}>
        <button ref={element => { heads.current[i] = element }} type="button" className="branched-menu__head" data-active={activeSection === i ? '' : undefined} aria-expanded={kids ? isOpen : undefined} onClick={() => {
          if (!kids) { onSelect(item.value ?? item.label); return }
          setOpen(previous => { const next = new Set(previous); if (next.has(i)) next.delete(i); else next.add(i); return next })
        }}><span className="branched-menu__icon" aria-hidden="true">{item.icon}</span><span className="branched-menu__label">{item.label}</span></button>
        {kids && <div className="branched-menu__body" inert={!isOpen}><div className="branched-menu__fold"><div className="branched-menu__tree" style={{ height: bodyHeight }}>
          <svg className="branched-menu__lines" width="40" height={bodyHeight} aria-hidden="true">
            {kids.length > 0 && <path className="branched-menu__base" d={`M ${TRUNK} 0 V ${rowY(kids.length - 1) - RADIUS}`} />}
            {kids.map((kid, k) => <path key={kid.value} className="branched-menu__base" d={branch(k)} />)}
            {kids.map((kid, k) => <path key={kid.value} className="branched-menu__reach" d={reach(k)} style={{ strokeDasharray: length(k), strokeDashoffset: kid.value === active ? 0 : length(k) }} />)}
          </svg>
          {kids.map(child => <button key={child.value} type="button" className="branched-menu__item" data-active={child.value === active ? '' : undefined} aria-current={child.value === active ? 'page' : undefined} tabIndex={isOpen ? 0 : -1} onClick={() => onSelect(child.value)}><span className="branched-menu__icon" aria-hidden="true">{child.icon}</span><span className="branched-menu__label">{child.label}</span></button>)}
        </div></div></div>}
      </div>
    })}
  </nav>
}
