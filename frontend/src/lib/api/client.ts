const API_BASE = '/api'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface RequestOptions {
  params?: Record<string, string | number | boolean>
  body?: unknown
  headers?: Record<string, string>
  // Set to true to opt out of the global 401 → /login redirect (e.g. the login call itself).
  skipAuthRedirect?: boolean
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

function buildUrl(path: string, params?: Record<string, string | number | boolean>): string {
  const url = new URL(`${API_BASE}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
  }
  return url.toString()
}

function getAuthHeaders(): Record<string, string> {
  if (typeof document === 'undefined') return {}
  const match = document.cookie.match(/(?:^|; )auth_token=([^;]*)/)
  const token = match ? decodeURIComponent(match[1]) : null
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function clearAuthCookies() {
  if (typeof document === 'undefined') return
  const expire = 'expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  document.cookie = `auth_token=; ${expire}`
  document.cookie = `user_role=; ${expire}`
  document.cookie = `user_id=; ${expire}`
  document.cookie = `must_change_password=; ${expire}`
}

function redirectToLogin() {
  if (typeof window === 'undefined') return
  if (window.location.pathname.startsWith('/login')) return
  const from = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/login?from=${from}`
}

async function request<T>(method: HttpMethod, path: string, options: RequestOptions = {}): Promise<T> {
  const { params, body, headers = {}, skipAuthRedirect = false } = options

  const res = await fetch(buildUrl(path, params), {
    method,
    // No `credentials: 'include'` — we don't want the browser to attach Basic auth
    // headers from past WWW-Authenticate challenges to our fetches.
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && !skipAuthRedirect) {
    clearAuthCookies()
    redirectToLogin()
    throw new ApiError(401, 'Unauthorized — redirecting to login')
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null)
    const message = data?.error?.message ?? data?.message ?? res.statusText
    throw new ApiError(res.status, message, data)
  }

  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),

  post: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('POST', path, { ...options, body }),

  put: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PUT', path, { ...options, body }),

  patch: <T>(path: string, body?: unknown, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('PATCH', path, { ...options, body }),

  delete: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('DELETE', path, options),
}

export { ApiError }
