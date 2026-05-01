import { getStoredToken } from '../auth/authStorage'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!rawApiBaseUrl || !rawApiBaseUrl.trim()) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Define it in your client environment file (for example .env.development or .env.production).',
  )
}

const API_BASE_URL = rawApiBaseUrl.trim().replace(/\/$/, '')

type RequestOptions = RequestInit

async function request<TResponse>(path: string, options: RequestOptions = {}): Promise<TResponse> {
  const token = getStoredToken()
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  let data: unknown
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null
        ? ((data as { error?: string; message?: string }).error ??
          (data as { error?: string; message?: string }).message ??
          `HTTP error ${response.status}`)
        : `HTTP error ${response.status}`
    throw new Error(message)
  }

  return data as TResponse
}

export const httpClient = {
  get: <TResponse>(path: string) => request<TResponse>(path, { method: 'GET' }),
  post: <TResponse>(path: string, body?: unknown) =>
    request<TResponse>(path, { method: 'POST', body: JSON.stringify(body || {}) }),
}
