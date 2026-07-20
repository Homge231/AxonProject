// client/src/services/api.ts

const BASE_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const appStartTime = Date.now()

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
    // Guard against stale in-flight requests: this request may have been sent
    // using an OLD token that just got invalidated on the server. If a NEWER
    // login has already replaced arena_token in localStorage by the time this
    // response comes back, this 401 is stale and must NOT wipe out the fresh
    // session or force a redirect — that would kick the user out of the
    // session they just logged into.
    const currentToken = localStorage.getItem('arena_token')
    if (currentToken !== token) {
      // Token has already changed since this request was fired — ignore.
      return response
    }

    let reason: string | null = null
    try {
      const cloned = response.clone()
      const data = await cloned.json()
      reason = data?.error || null
    } catch {
      // response body not JSON or already consumed — ignore
    }

    localStorage.removeItem('arena_token')

    // Avoid redirect loops if we're already on the login page.
    if (!window.location.pathname.startsWith('/login')) {
      // If the session was invalidated during the initial page load (e.g. they had a stale token from yesterday),
      // do not show the scary red error message. Only show it if they were actively using the app.
      if (reason === 'SessionInvalidated' && (Date.now() - appStartTime > 3000)) {
        window.location.href = '/login?reason=session_invalidated'
      } else {
        window.location.href = '/login'
      }
    }
  }

  return response
}