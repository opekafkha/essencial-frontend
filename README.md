# ESSENCIAL — frontend

Plataforma de bienestar/salud mental de FundaColor. Ver [AGENTS.md](./AGENTS.md) para stack,
estructura y decisiones de diseño. El backend vive en su propio repo aparte
(`essencial-backend`), consumido vía HTTP (`VITE_BACKEND_URL`).

## Arranque rápido

```bash
nvm use            # Node 20
npm install
cp .env.example .env
# completar VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY / VITE_BACKEND_URL,
# apuntando al backend corriendo (local o desplegado)

npm run dev         # http://localhost:5173
```
