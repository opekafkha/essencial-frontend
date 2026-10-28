import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import './Sidebar.css'
import BranchedMenu from './BranchedMenu'
import './AuthLayout.css'
import './AppSurface.css'
import { useAuth } from '../context/useAuth'
import { Loader } from './Loader'

function AdminMenuIcon({ name }: { name: 'admin' | 'users' | 'rooms' | 'history' }) {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === 'admin' ? <><rect x="3" y="3" width="7" height="7" rx="2" /><rect x="14" y="3" width="7" height="7" rx="2" /><rect x="3" y="14" width="7" height="7" rx="2" /><rect x="14" y="14" width="7" height="7" rx="2" /></> : name === 'users' ? <><circle cx="9" cy="8" r="3" /><path d="M3 21v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6m3 10v-2a6 6 0 0 0-3-5" /></> : name === 'rooms' ? <><rect x="3" y="5" width="13" height="14" rx="3" /><path d="m16 10 5-3v10l-5-3" /></> : <><path d="M3 11a9 9 0 1 1 2.6 7M3 4v7h7m2-4v5l3 2" /></>}
  </svg>
}

export function Brand() { return <Link className="brand" to="/dashboard" aria-label="Essencial, ir al inicio"><span className="brand-symbol">e</span><span className="brand-wordmark">essencial<span className="brand-dot">.</span><small>POR FUNDACOLOR</small></span></Link> }
export function AuthLayout({ children, loading = false, loadingLabel = 'Iniciando sesión…' }: { children: ReactNode; loading?: boolean; loadingLabel?: string }) {
  return (
    <main className="auth-layout">
      <aside className="auth-story">
        <Brand />
        <div className="story-content">
          <span className="eyebrow light">UN ESPACIO PARA TI</span>
          <h1>Estar bien empieza<br />por escucharte.</h1>
          <p>Haz una pausa. Encuentra tu espacio.<br />Tu bienestar merece un lugar en tu día.</p>
        </div>
        <img className="auth-botanical" src="/images/logueo1.png" width="404" height="572" alt="" aria-hidden="true" decoding="async" />
        <footer>Bienestar que nos conecta.<span>FundaColor © {new Date().getFullYear()}</span></footer>
      </aside>
      <div className="auth-seam-tab" aria-hidden={loading ? undefined : true}>{loading && <span className="auth-tab-loader"><Loader size="sm" tone="light" label={loadingLabel} /></span>}</div>
      <section className="auth-form">
        <div className="mobile-brand"><Brand /></div>
        <div className="form-content">{loading && <div className="auth-mobile-loader"><Loader size="sm" label={loadingLabel} showLabel /></div>}{children}</div>
        <p className="auth-footnote">A tu ritmo, desde donde estés.</p>
      </section>
    </main>
  )
}
export function AppLayout({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { profile, signOut } = useAuth()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [sidebar, setSidebar] = useState<{ path: string; collapsed: boolean } | null>(null)
  const inCall = pathname.startsWith('/join/')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    // Give the expanded panel a painted frame before its automatic collapse.
    let nextFrame = 0
    const firstFrame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => setReady(true))
    })
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(nextFrame) }
  }, [])
  const collapsed = sidebar?.path === pathname ? sidebar.collapsed : inCall && ready
  const pro = profile?.role === 'profesional' || profile?.role === 'admin'

  return (
    <div className={`app-layout ${className}`.trim()} data-sidebar-collapsed={collapsed}>
      <aside className="sidebar" aria-label="Menú de Essencial">
        <div className="sidebar-header">
          <Brand />
          <button
            className="sidebar-toggle"
            type="button"
            aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
            aria-expanded={!collapsed}
            aria-controls="sidebar-navigation"
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
            onClick={() => setSidebar({ path: pathname, collapsed: !collapsed })}
          >
            <span aria-hidden="true">‹</span>
          </button>
        </div>
        <span className="nav-label">TU ESPACIO</span>
        <nav id="sidebar-navigation" aria-label="Navegación principal">
          <NavLink to="/dashboard" title="Mi inicio" aria-label="Mi inicio"><span aria-hidden="true">◈</span><span className="sidebar-label">Mi inicio</span></NavLink>
          {pro && <NavLink to="/generar-sala" className={inCall ? 'active' : undefined} title="Videollamadas" aria-label="Videollamadas"><span aria-hidden="true">◉</span><span className="sidebar-label">Videollamadas</span></NavLink>}
          {profile?.role === 'admin' && collapsed && <NavLink to="/admin" title="Administración" aria-label="Administración"><span aria-hidden="true"><AdminMenuIcon name="admin" /></span><span className="sidebar-label">Administración</span></NavLink>}
        </nav>
        {profile?.role === 'admin' && !collapsed && <BranchedMenu items={[{ label: 'Administración', icon: <AdminMenuIcon name="admin" />, children: [{ value: 'usuarios', label: 'Usuarios', icon: <AdminMenuIcon name="users" /> }, { value: 'actuales', label: 'Salas actuales', icon: <AdminMenuIcon name="rooms" /> }, { value: 'pasadas', label: 'Salas pasadas', icon: <AdminMenuIcon name="history" /> }] }]} active={pathname === '/admin' ? new URLSearchParams(search).get('vista') ?? 'usuarios' : ''} onSelect={value => navigate(`/admin?vista=${value}`)} />}
        <div className="sidebar-note"><span className="tiny-flower" aria-hidden="true">✳</span><p>Un pequeño espacio.<br />Un gran paso para ti.</p></div>
        <div className="sidebar-user" title={profile?.nombre || profile?.email || 'Mi cuenta'}>
          <span className="avatar">{(profile?.nombre || profile?.email || 'E').slice(0, 1).toUpperCase()}</span>
          <div className="sidebar-user-details"><strong>{profile?.nombre || 'Mi cuenta'}</strong><small>{profile?.role || 'Cargando perfil…'}</small></div>
        </div>
        <button className="signout" title="Cerrar sesión" aria-label="Cerrar sesión" onClick={() => void signOut()}><span aria-hidden="true">↗</span><span className="sidebar-label">Cerrar sesión</span></button>
      </aside>
      <div className="app-body">
        <header className="topbar"><span>Tu bienestar, más cerca.</span><span className="topbar-label"><i /> Espacio Essencial</span></header>
        <main className="page-content">{children}</main>
        <footer className="app-footer">Essencial · Una iniciativa de FundaColor<span>Conecta contigo.</span></footer>
      </div>
    </div>
  )
}
export function PageHeading({ label, title, description }: { label: string; title: string; description: string }) { return <div className="page-heading"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div> }
