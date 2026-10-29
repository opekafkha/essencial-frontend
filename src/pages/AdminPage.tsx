import { RoleSelect } from '../components/RoleSelect'
import { Link, useSearchParams } from 'react-router-dom'
import { PageHeading } from '../components/Design'
import { useEffect, useState } from 'react'
import { sileo } from 'sileo'
import { fetchAdminRooms, fetchAdminUsers, updateUserRole, type AdminRoom, type AdminUser, type Role } from '../shared'
import { backendClient } from '../lib/backendClient'
import './AdminPage.css'

type Tab = 'usuarios' | 'reuniones'

const ROLE_LABELS: Record<Role, string> = { miembro: 'Miembro', profesional: 'Profesional', admin: 'Admin' }

export function AdminPage() {
  const [params] = useSearchParams()
  const view = params.get('vista') ?? 'usuarios'
  const tab: Tab = view === 'usuarios' ? 'usuarios' : 'reuniones'
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [rooms, setRooms] = useState<AdminRoom[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [roleUpdating, setRoleUpdating] = useState<string | null>(null)

  async function handleRoleChange(userId: string, role: Role) {
    setRoleUpdating(userId)
    try {
      const updated = await updateUserRole(backendClient, userId, role)
      setUsers((prev) => prev?.map((u) => (u.id === userId ? updated : u)) ?? prev)
      sileo.success({
        position: 'bottom-right',
        title: 'Rol actualizado',
        description: `${updated.nombre ?? updated.email} ahora es ${ROLE_LABELS[updated.role]}.`,
        fill: 'var(--theme-accent)',
        styles: { title: 'essencial-toast-title', description: 'essencial-toast-description', badge: 'essencial-toast-badge' },
      })
    } catch {
      sileo.error({ position: 'bottom-right', title: 'No se pudo cambiar el rol', description: 'Intenta de nuevo en un momento.' })
    } finally {
      setRoleUpdating(null)
    }
  }

  useEffect(() => {
    let active = true

    const load = tab === 'usuarios' ? fetchAdminUsers(backendClient) : fetchAdminRooms(backendClient)
    load
      .then((data) => {
        if (!active) return
        if (tab === 'usuarios') setUsers(data as AdminUser[])
        else setRooms(data as AdminRoom[])
      })
      .catch(() => {
        if (active) setError('No se pudo cargar la información.')
      })

    return () => {
      active = false
    }
  }, [tab])

  // The backend already returns expired links with status 'expirada'.
  const visibleRooms = rooms?.filter(r => (r.status === 'activa') === (view !== 'pasadas'))

  return (
    <><PageHeading label="ADMINISTRACIÓN" title="Una mirada a tu comunidad." description="Consulta los usuarios y los espacios de conexión de Essencial." /><section className="card admin-card">

      <div className="admin-view-heading"><h2>{tab === 'usuarios' ? 'Usuarios' : view === 'pasadas' ? 'Salas pasadas' : 'Salas actuales'}</h2></div>
      {error && <p role="alert" className="error-message">{error}</p>}{!error && (tab === 'usuarios' ? users === null : rooms === null) && <p role="status" className="empty-state">Cargando información…</p>}

      {tab === 'usuarios' && (
        <div className="table-scroll">
          <table className="data-table">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Nombre</th>
              <th className="py-2">Email</th><th>Teléfono</th>
              <th className="py-2">Rol</th>
              <th>Plan</th>
            </tr>
          </thead>
          <tbody>
            {users?.length === 0 && <tr><td colSpan={5} className="empty-state">Todavía no hay usuarios para mostrar.</td></tr>}{users?.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-2">{u.nombre ?? '—'}</td>
                <td className="py-2">{u.email}</td><td>{u.telefono ?? '—'}</td>
                <td className="py-2">
                  <RoleSelect value={u.role} disabled={roleUpdating === u.id}
                    label={`Rol de ${u.nombre ?? u.email}`}
                    onChange={role => void handleRoleChange(u.id, role)} />
                </td>
                <td><span className={u.plan?.trim() ? 'badge' : 'admin-plan-empty'}>{u.plan?.trim() || '----'}</span></td>
              </tr>
            ))}
          </tbody>
        </table></div>
      )}

      {tab === 'reuniones' && (
        <><p className="admin-rooms-note">Consulta salas vigentes y pasadas. Las entradas son reportadas por la aplicación al conectar; no indican presencia en tiempo real. Las salas antiguas pueden no tener participantes registrados.</p><div className="table-scroll"><table className="data-table">
          <thead>
            <tr className="border-b text-slate-500">
              <th className="py-2">Creada por</th>
              <th className="py-2">Sala</th>
              <th>Participantes registrados</th><th className="py-2">Expira</th><th className="py-2">Acceso</th>
            </tr>
          </thead>
          <tbody>
            {visibleRooms?.map((r) => (
              <tr key={r.slug} className="border-b">
                <td className="py-2">{r.creatorNombre ?? r.creatorEmail}</td>
                <td className="py-2">{r.roomName}</td>
                <td className="admin-participants">{r.participants.length ? r.participants.map(p => <p key={p.id}>{p.nombre ?? p.email}{p.nombre && <> · {p.email}</>}<br /><small>Entrada: {new Date(p.joinedAt).toLocaleString()}</small></p>) : 'Sin participantes registrados.'}</td><td className="py-2">{new Date(r.expiresAt).toLocaleString()}</td><td className="py-2">{view === 'pasadas' ? <span className="badge">{r.status === 'cerrada' ? 'Cerrada' : 'Expirada'}</span> : <Link className="button primary" to={`/join/${encodeURIComponent(r.slug)}`} aria-label={`Preparar entrada a la sala de ${r.creatorNombre ?? r.creatorEmail}`}>Preparar entrada <span aria-hidden="true">↗</span></Link>}</td>
              </tr>
            ))}
            {visibleRooms?.length === 0 && (
              <tr>
                <td className="py-2 text-slate-500" colSpan={5}>
                  {view === 'pasadas' ? 'No hay salas pasadas.' : 'No hay salas actuales.'}
                </td>
              </tr>
            )}
          </tbody>
        </table></div></>
      )}
    </section><p className="table-note">Vista de consulta · Los datos se cargan al abrir cada sección.</p></>
  )
}
