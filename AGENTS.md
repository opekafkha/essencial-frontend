# ESSENCIAL frontend — guía del repo

Plataforma de bienestar/salud mental de FundaColor. App web única (Vite + React 19 + TS +
Tailwind) para **miembros** (usuarios). Repo separado del backend (`essencial-backend`,
self-hosted en Railway: Postgres + GoTrue + MinIO + servidor Express) — se comunican solo por
HTTP, nunca comparten código ni base de datos entre repos.

No existe app de escritorio: la versión Electron (`apps/desktop`, para `profesional`/`admin`) se
retiró — una sola app web cubre todos los roles sin la complejidad de mantener dos builds.
`RequireRole.tsx` queda listo para cuando se engancha una pantalla de rol `profesional`/`admin`.

## Estructura

- `src/App.tsx` — rutas: `/` (redirect a `/login`), `/registro` (`RegisterPage`),
  `/revisa-tu-correo` (`CheckEmailPage`), `/login`, y detrás de `RequireAuth`: `/dashboard`,
  `/join/:slug` (`JoinCallPage`, se une a una videollamada embebida con `@livekit/components-react`
  — `<LiveKitRoom><VideoConference /></LiveKitRoom>`, no un iframe externo), y detrás de
  `RequireRole allow={['profesional', 'admin']}`: `/generar-sala` (`GenerarSalaPage`, crea la sala
  con `POST /video-rooms`).
- `src/routes/RequireAuth.tsx` — guard de sesión (UX, no seguridad real — la autorización vive en
  el backend). `src/routes/RequireRole.tsx` — guard por rol, usado por `/generar-sala`.
- `src/context/AuthProvider.tsx` — sesión vía `supabase.auth.getSession()`/`onAuthStateChange`;
  perfil vía `fetchMe(backendClient)` (`GET /me` en el backend, no PostgREST).
- `src/lib/supabaseClient.ts` — cliente apuntado a `VITE_SUPABASE_URL` (el backend, que proxea
  `/auth/v1/*` hacia GoTrue self-hosted). Sesión en `localStorage` (default de supabase-js).
- `src/lib/backendClient.ts` — wrapper de fetch hacia `VITE_BACKEND_URL`, agrega
  `Authorization: Bearer <access_token>` automáticamente.
- `src/shared/` — tipos, schemas de Zod, constantes de rol, el factory del cliente de Auth
  (`src/shared/auth/create-client.ts` — no es Supabase Cloud, solo reutiliza
  `@supabase/supabase-js` como cliente HTTP porque GoTrue habla el mismo protocolo) y el cliente
  HTTP hacia el backend. Antes vivía en un paquete npm separado (`packages/shared`) compartido con
  la app de escritorio — al quedar una sola app, se fusionó directo al código de esta.

## Autenticación y backend

Login/registro pasan por `@supabase/supabase-js` apuntado a `VITE_SUPABASE_URL`, que en este stack
es el propio backend actuando de proxy hacia GoTrue (no un proyecto de Supabase Cloud). El perfil
del usuario se pide a `GET /me` en el backend (`fetchMe` en `src/shared`), no por una query directa
a la base de datos.

## Comandos

- `npm run dev` — levantar la app (`http://localhost:5173`).
- `npm run build` — `tsc -b && vite build`.
- `npm run lint` / `npm run typecheck`.

## Env vars (`.env`, ver `.env.example`)

`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (placeholder sin función de seguridad en el stack
self-hosted), `VITE_BACKEND_URL`.

## Flujo de registro

`RegisterPage` → `supabase.auth.signUp()` (vía el proxy del backend) → `CheckEmailPage`. Con
`GOTRUE_MAILER_AUTOCONFIRM=true` (sin SMTP configurado todavía) el correo queda autoconfirmado, así
que esta pantalla es informativa pero no bloquea nada.

## Decisiones que no romper

- El rol admite **exactamente 3 valores**: `miembro`, `profesional`, `admin` (`src/shared/constants/roles.ts`).
  El rol B2B queda para Fase 2 — no agregarlo todavía.
- El registro público (`RegisterPage`) **siempre** crea un usuario en rol `miembro`. Los roles
  `profesional`/`admin` se crean aparte (seed del backend).
- Cada beneficiario de una membresía tiene su **propia cuenta** — nunca una cuenta compartida o
  gestionada por otra persona.

## Gotcha WSL

`vite.config.ts` tiene `server.watch.usePolling: true` — sin esto el dev server no detecta cambios
de archivos bajo `/mnt/c/...` en WSL. Si `vite build` falla con "Cannot find module
`@rollup/rollup-linux-x64-gnu`": instalarlo como optional dependency
(`npm install --save-optional @rollup/rollup-linux-x64-gnu`).

## Fuera de alcance en esta tanda (RQ-01/02/03/04/44)

RQ-05 (bloqueo tras 3 intentos, reset de password custom), RQ-06 (auditoría de accesos con
IP/dispositivo), RQ-09/RQ-10 (catálogo de planes, precios, envío real de invitaciones), RQ-16+
(agenda completa). No construir nada de esto todavía — son requerimientos separados y facturados
aparte según el plan del cliente.

## Video — LiveKit (reemplazó a Daily.co; se evaluó MiroTalk P2P en el camino, no se desplegó)

Daily.co era pago — se reemplazó por LiveKit self-hosted (SFU real, no P2P: la calidad de la
llamada no depende de la conexión/NAT de cada usuario), ver `essencial-backend/src/lib/livekit.ts`
y `essencial-backend/infra/RUNBOOK.md` paso 4. `GenerarSalaPage.tsx` no cambió (sigue llamando
`POST /video-rooms` tal cual). `JoinCallPage.tsx` usa `livekit-client` + `@livekit/components-react`:
`GET /video-rooms/:slug` devuelve `{ token }` (JWT firmado por el backend, sin llamada de red a
LiveKit — no como Daily/MiroTalk que sí pegaban a una API externa) y la página conecta con
`<LiveKitRoom token={token} serverUrl={VITE_LIVEKIT_URL}><VideoConference /></LiveKitRoom>` — UI
embebida en la propia app, no un iframe hacia otro dominio.

`apps/desktop` (retirado) tenía un `secureStorageAdapter` que cifraba la sesión con el keychain del
OS vía Electron `safeStorage` — no tiene equivalente real en un navegador (no hay acceso JS al
keychain del sistema), así que `/generar-sala` reutiliza el mismo `supabaseClient`/`AuthProvider`
de sesión en `localStorage` que ya usa el resto de la app — no se portó un adapter "seguro"
aparte, sería una abstracción sin base real en este entorno.
