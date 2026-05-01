const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL

if (!rawApiBaseUrl || !rawApiBaseUrl.trim()) {
  throw new Error(
    'Missing VITE_API_BASE_URL. Define it in your client environment file (for example .env.development or .env.production).',
  )
}

const API_BASE_URL = rawApiBaseUrl.trim().replace(/\/$/, '')

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  let data = null
  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `HTTP error ${response.status}`
    throw new Error(message)
  }

  return data
}

export const httpClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body || {}) }),
}
