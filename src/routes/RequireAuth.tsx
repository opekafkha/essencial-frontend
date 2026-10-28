import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { Loader } from '../components/Loader'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div className="session-loading"><Loader size="lg" showLabel label="Preparando tu sesión…" /></div>
  if (!session) {
    return <Navigate to="/login" replace state={{ next: location.pathname }} />
  }
  return <Outlet />
}
