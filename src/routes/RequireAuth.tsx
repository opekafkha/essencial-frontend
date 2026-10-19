import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) return null
  if (!session) {
    return <Navigate to="/login" replace state={{ next: location.pathname }} />
  }
  return <Outlet />
}
