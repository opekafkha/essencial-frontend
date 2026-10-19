import { Navigate, Outlet } from 'react-router-dom'
import type { Role } from '../shared'
import { useAuth } from '../context/useAuth'

export function RequireRole({ allow }: { allow: Role[] }) {
  const { profile, loading } = useAuth()

  if (loading) return null
  if (!profile || !allow.includes(profile.role)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}
