import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './Sidebar.css'
import { Brand } from './Brand'
import { Sidebar } from './Sidebar'
import { PageTransition } from './PageTransition'
import './AuthLayout.css'
import './AppSurface.css'
import { useAuth } from '../context/useAuth'
import { Loader } from './Loader'
import { useAccountPlan } from '../features/account/useAccountPlan'

export interface AuthLayoutContext { setAuthLoading: (loading: boolean) => void }
export function AuthLayout() {
  const { pathname } = useLocation()
  const [loading, setAuthLoading] = useState(false)
  const loadingLabel = 'Iniciando sesión…'
  const registerSide = pathname === '/registro' || pathname === '/revisa-tu-correo'
  const shellRef = useRef<HTMLElement>(null)
  const previousSide = useRef(registerSide)

  useLayoutEffect(() => {
    if (previousSide.current === registerSide) return
    previousSide.current = registerSide
    const shell = shellRef.current
    if (!shell) return
    if (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      delete shell.dataset.authTabsMoving
      return
    }
    // Reveal from the seam once both panel edges have reached their final position.
    const duration = window.getComputedStyle(shell).getPropertyValue('--auth-slide-duration').trim()
    const milliseconds = duration ? parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000) : 480
    shell.dataset.authTabsMoving = ''
    const reveal = () => { delete shell.dataset.authTabsMoving }
    const finish = (event: TransitionEvent) => {
      if (event.propertyName === 'transform' && event.target === shell.querySelector('.auth-story')) {
        window.clearTimeout(timer)
        reveal()
      }
    }
    // The event follows the rendered slide; the timer covers missing/cancelled transitions.
    const timer = window.setTimeout(reveal, milliseconds + 80)
    shell.addEventListener('transitionend', finish)
    return () => {
      window.clearTimeout(timer)
      shell.removeEventListener('transitionend', finish)
    }
  }, [registerSide])
  return (
    <main ref={shellRef} className="auth-layout" data-auth-side={registerSide ? 'register' : 'login'}>
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
      <div className="auth-seam-tab auth-seam-tab--bottom" aria-hidden="true" />
      <section className="auth-form">
        <div className="mobile-brand"><Brand /></div>
        <div className="form-content" key={pathname}>{loading && <div className="auth-mobile-loader"><Loader size="sm" label={loadingLabel} showLabel /></div>}<Outlet context={{ setAuthLoading } satisfies AuthLayoutContext} /></div>
        <p className="auth-footnote">A tu ritmo, desde donde estés.</p>
      </section>
    </main>
  )
}
export function AppLayout({ children, className = '' }: { children?: ReactNode; className?: string }) {
  const { profile, signOut } = useAuth()
  const plan = useAccountPlan()
  const { pathname, search } = useLocation()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(() => {
    try { return window.sessionStorage.getItem('essencial.sidebar.collapsed') === 'true' } catch { return false }
  })

  return (
    <div className={`app-layout ${pathname === '/dashboard' ? 'dashboard-layout' : ''} ${className}`.trim()} data-sidebar-collapsed={collapsed}>
      <Sidebar profile={profile} plan={plan} collapsed={collapsed} pathname={pathname} search={search}
        onToggle={() => {
          const next = !collapsed
          setCollapsed(next)
          try { window.sessionStorage.setItem('essencial.sidebar.collapsed', String(next)) } catch { /* Browser storage may be unavailable. */ }
        }} onNavigate={navigate} onSignOut={signOut} />
      <div className="app-body">
        <header className="topbar"><span>Tu bienestar, más cerca.</span><span className="topbar-label"><i /> Espacio Essencial</span></header>
        <main className="page-content"><PageTransition>{children ?? <Outlet />}</PageTransition></main>
        <footer className="app-footer">Essencial · Una iniciativa de FundaColor<span>Conecta contigo.</span></footer>
      </div>
    </div>
  )
}
export function PageHeading({ label, title, description }: { label: string; title: string; description: string }) { return <div className="page-heading"><span className="eyebrow">{label}</span><h1>{title}</h1><p>{description}</p></div> }
