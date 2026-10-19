import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { RequireAuth } from './routes/RequireAuth'
import { RequireRole } from './routes/RequireRole'
import { RegisterPage } from './pages/RegisterPage'
import { CheckEmailPage } from './pages/CheckEmailPage'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { JoinCallPage } from './pages/JoinCallPage'
import { GenerarSalaPage } from './pages/GenerarSalaPage'

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/revisa-tu-correo" element={<CheckEmailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/join/:slug" element={<JoinCallPage />} />
          <Route element={<RequireRole allow={['profesional', 'admin']} />}>
            <Route path="/generar-sala" element={<GenerarSalaPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
