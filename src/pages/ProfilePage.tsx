import { Link } from 'react-router-dom'
import { PageHeading } from '../components/Design'
import { Loader } from '../components/Loader'
import { useAuth } from '../context/useAuth'
import { useAccountPlan } from '../features/account/useAccountPlan'
import './ProfilePage.css'

export function ProfilePage() {
  const { profile, loading } = useAuth()
  const plan = useAccountPlan()
  const name = profile?.nombre || 'Mi cuenta'
  return <>
    <Link className="profile-back" to="/dashboard">← Volver a mi inicio</Link>
    <PageHeading label="MI CUENTA" title="Tu espacio, tus datos." description="Consulta tu información personal y el plan de tu cuenta." />
    {loading ? <Loader label="Cargando tu perfil…" showLabel /> : !profile ? <p className="error-message" role="alert">No se pudo cargar tu perfil. Vuelve a abrir esta página para intentarlo de nuevo.</p> :
      <div className="profile-grid">
        <section className="card profile-details" aria-labelledby="profile-details-title">
          <header className="profile-identity"><span className="profile-avatar" aria-hidden="true">{name.slice(0, 1).toUpperCase()}</span><div><h2 id="profile-details-title">Datos personales</h2><span className="badge">{profile.role}</span></div></header>
          <dl className="profile-fields"><div><dt>Nombre completo</dt><dd>{profile.nombre || 'Sin nombre registrado'}</dd></div><div><dt>Correo electrónico</dt><dd>{profile.email}</dd></div><div><dt>Número de teléfono</dt><dd>{profile.telefono || 'Sin teléfono registrado'}</dd></div></dl>
        </section>
        <section className="card profile-plan" aria-labelledby="profile-plan-title">
          <span className="eyebrow">TU MEMBRESÍA</span><h2 id="profile-plan-title">{plan.name}</h2>
          {plan.preview && <><span className="badge">Vista previa</span><p>Este plan es provisional. Todavía no está vinculado a una compra.</p></>}
        </section>
      </div>}
  </>
}
