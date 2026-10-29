export class BackendRequestError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'BackendRequestError'
    this.status = status
  }
}

export interface BackendClientOptions {
  baseUrl: string
  getAccessToken: () => Promise<string | null>
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

// Wrapper mínimo de fetch que arma Authorization: Bearer <access_token> a
// partir de la sesión de Supabase — reutilizado por apps/web y apps/desktop
// para no duplicar el manejo de errores en cada página.
export function createBackendClient({ baseUrl, getAccessToken }: BackendClientOptions) {
  async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const token = await getAccessToken()
    if (!token) throw new BackendRequestError(401, 'No hay sesión activa')

    const response = await fetch(`${baseUrl}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '')
      throw new BackendRequestError(response.status, text || `Error ${response.status}`)
    }

    return (await response.json()) as T
  }

  return {
    get: <T>(path: string) => request<T>(path),
    post: <T>(path: string, body?: unknown) => request<T>(path, { method: 'POST', body }),
    patch: <T>(path: string, body?: unknown) => request<T>(path, { method: 'PATCH', body }),
  }
}

export type BackendClient = ReturnType<typeof createBackendClient>
