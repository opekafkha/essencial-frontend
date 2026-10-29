import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sileo'
import { AppLayout, AuthLayout } from './components/Design'
import { AuthProvider } from './context/AuthProvider'
import { RequireAuth } from './routes/RequireAuth'
import { RequireRole } from './routes/RequireRole'
import { RegisterPage } from './pages/RegisterPage'
import { CheckEmailPage } from './pages/CheckEmailPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { JoinCallPage } from './pages/JoinCallPage'
import { GenerarSalaPage } from './pages/GenerarSalaPage'
import { ProfilePage } from './pages/ProfilePage'
import { AdminPage } from './pages/AdminPage'

// Bloqueo temporal para pruebas, independiente de cualquier plan de
// Vercel (Deployment Protection en Hobby no cubre el dominio de
// producción). Activar poniendo VITE_MAINTENANCE_MODE=true en las
// variables de entorno de Vercel y haciendo redeploy; desactivar
// quitando la variable (o en false) y redeploy de nuevo.
function MaintenancePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center',
      padding: '2rem', fontFamily: 'system-ui, sans-serif',
    }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>404</h1>
      <p style={{ color: '#666' }}>Esta página no existe.</p>
    </div>
  )
}

export function App() {
  if (import.meta.env.VITE_MAINTENANCE_MODE === 'true') {
    return <MaintenancePage />
  }

  return (
    <AuthProvider>
      <Toaster position="top-right" theme="system" />
      <Toaster position="bottom-right" theme="system" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route element={<AuthLayout />}>
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/revisa-tu-correo" element={<CheckEmailPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route element={<RequireAuth />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/join/:slug" element={<JoinCallPage />} />
            <Route element={<RequireRole allow={['profesional', 'admin']} />}>
              <Route path="/generar-sala" element={<GenerarSalaPage />} />
            </Route>
            <Route element={<RequireRole allow={['admin']} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
