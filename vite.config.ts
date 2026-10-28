import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Certificado self-signed compartido con el backend y LiveKit (ver
// certs/ en la raiz del repo) para poder probar desde otra PC en la
// misma red local: getUserMedia (camara/microfono) exige contexto
// seguro (https), que "localhost" cumple gratis pero una IP de LAN no.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    https: {
      cert: readFileSync('../certs/dev-cert.pem'),
      key: readFileSync('../certs/dev-key.pem'),
    },
    watch: {
      usePolling: true,
    },
  },
})
