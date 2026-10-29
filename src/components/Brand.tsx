import { Link } from 'react-router-dom'

interface BrandProps { onToggle?: () => void; expanded?: boolean }
export function Brand({ onToggle, expanded }: BrandProps = {}) {
  const content = <><span className="brand-symbol">e</span><span className="brand-wordmark">essencial<span className="brand-dot">.</span><small>POR FUNDACOLOR</small></span></>
  return onToggle
    ? <button type="button" className="brand sidebar-brand-toggle" onClick={onToggle} aria-label={expanded ? 'Contraer menú' : 'Expandir menú'} aria-expanded={expanded} aria-controls="sidebar-navigation">{content}</button>
    : <Link className="brand" to="/dashboard" aria-label="Essencial, ir al inicio">{content}</Link>
}
