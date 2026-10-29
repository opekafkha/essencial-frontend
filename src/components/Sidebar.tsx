import { History, LayoutDashboard, LayoutGrid, Sprout, UsersRound, Video } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'
import type { AccountPlan } from '../features/account/useAccountPlan'
import type { ProfileRow } from '../shared'
import { Brand } from './Brand'
import BranchedMenu from './BranchedMenu'
import { SidebarUser } from './SidebarUser'
import './Sidebar.css'

interface SidebarProps {
  profile: ProfileRow | null
  plan: AccountPlan
  collapsed: boolean
  pathname: string
  search: string
  onToggle: () => void
  onNavigate: (path: string) => void
  onSignOut: () => Promise<void>
  accountSettings?: ReactNode
}

export function Sidebar({ profile, plan, collapsed, pathname, search, onToggle, onNavigate, onSignOut, accountSettings }: SidebarProps) {
  const inCall = pathname.startsWith('/join/')
  const pro = profile?.role === 'profesional' || profile?.role === 'admin'
  return (
      <aside className="sidebar" aria-label="Menú de Essencial">
        <div className="sidebar-header">
          <Brand onToggle={onToggle} expanded={!collapsed} />
        </div>
        <span className="nav-label">TU ESPACIO</span>
        <nav id="sidebar-navigation" aria-label="Navegación principal">
          <NavLink to="/dashboard" title="Mi inicio" aria-label="Mi inicio"><span aria-hidden="true"><LayoutDashboard size={18} strokeWidth={1.7} /></span><span className="sidebar-label">Mi inicio</span></NavLink>
          {pro && <NavLink to="/generar-sala" className={inCall ? 'active' : undefined} title="Videollamadas" aria-label="Videollamadas"><span aria-hidden="true"><Video size={18} strokeWidth={1.7} /></span><span className="sidebar-label">Videollamadas</span></NavLink>}
          {profile?.role === 'admin' && collapsed && <NavLink to="/admin" title="Administración" aria-label="Administración"><span aria-hidden="true"><LayoutGrid size={17} strokeWidth={1.7} aria-hidden="true" /></span><span className="sidebar-label">Administración</span></NavLink>}
        </nav>
        {profile?.role === 'admin' && !collapsed && <BranchedMenu items={[{ label: 'Administración', icon: <LayoutGrid size={17} strokeWidth={1.7} aria-hidden="true" />, children: [{ value: 'usuarios', label: 'Usuarios', icon: <UsersRound size={17} strokeWidth={1.7} aria-hidden="true" /> }, { value: 'actuales', label: 'Salas actuales', icon: <Video size={17} strokeWidth={1.7} aria-hidden="true" /> }, { value: 'pasadas', label: 'Salas pasadas', icon: <History size={17} strokeWidth={1.7} aria-hidden="true" /> }] }]} active={pathname === '/admin' ? new URLSearchParams(search).get('vista') ?? 'usuarios' : ''} onSelect={value => onNavigate(`/admin?vista=${value}`)} />}
        <div className="sidebar-note"><span className="tiny-flower" aria-hidden="true"><Sprout size={27} strokeWidth={1.5} /></span><p>Un pequeño espacio.<br />Un gran paso para ti.</p></div>
        <SidebarUser profile={profile} plan={plan} onManageProfile={() => onNavigate('/perfil')} onSignOut={onSignOut}>{accountSettings}</SidebarUser>
      </aside>
  )
}
