// client/src/services/api.ts

/**
 * Global fetch wrapper that automatically attaches the JWT auth token
 * to all requests, ensuring secure access to backend routes.
 */

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('arena_token')

  const headers = new Headers(options.headers || {})

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  })

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    let reason: string | null = null
    try {
      const cloned = response.clone()
      const data = await cloned.json()
      reason = data?.error || null
    } catch {
      // response body not JSON or already consumed — ignore
    }

    localStorage.removeItem('arena_token')

    if (reason === 'SessionInvalidated') {
      window.location.href = '/login?reason=session_invalidated'
    } else {
      window.location.href = '/login'
    }
  }

  return response
}