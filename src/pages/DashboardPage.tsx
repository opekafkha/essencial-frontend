import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function DashboardPage() {
  const { profile, signOut } = useAuth()
  const canGenerarSala = profile?.role === 'profesional' || profile?.role === 'admin'

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center gap-3 px-4">
      <h1 className="text-2xl font-semibold">Bienvenido{profile?.nombre ? `, ${profile.nombre}` : ''}</h1>
      <p className="text-slate-600">Rol: {profile?.role}</p>
      {canGenerarSala && (
        <Link to="/generar-sala" className="w-fit rounded border px-4 py-2 text-sm hover:bg-slate-50">
          Generar sala de videollamada
        </Link>
      )}
      <button
        onClick={() => void signOut()}
        className="w-fit rounded border px-4 py-2 text-sm hover:bg-slate-50"
      >
        Cerrar sesión
      </button>
    </main>
  )
}
