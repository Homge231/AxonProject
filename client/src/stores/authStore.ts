import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'
import { fetchWithAuth } from '../services/api'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const SESSION_POLL_INTERVAL_MS = 20000

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const profile = ref<any>(null)
  const loading = ref(true)
  let sessionPollTimer: ReturnType<typeof setInterval> | null = null

  // ── Realtime session-kick state ─────────────────────────────────────────
  const currentSessionVersion = ref<number | null>(null)
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  const isLoggedIn = computed(() => !!user.value)
  const isFirstPlay = computed(() => profile.value?.is_first_play ?? false)

  function cleanOAuthUrlFragment() {
    if (window.location.hash.includes('access_token')) {
      const cleanUrl = window.location.pathname + window.location.search
      window.history.replaceState({}, document.title, cleanUrl)
    }
  }

  function startSessionPolling() {
    stopSessionPolling()
    sessionPollTimer = setInterval(() => {
      if (localStorage.getItem('arena_token')) {
        fetchProfile()
      } else {
        stopSessionPolling()
      }
    }, SESSION_POLL_INTERVAL_MS)
  }

  function stopSessionPolling() {
    if (sessionPollTimer) {
      clearInterval(sessionPollTimer)
      sessionPollTimer = null
    }
  }

  // ── Realtime subscription: instant kick when session_version changes ────
  function subscribeToSessionChanges(userId: string) {
    unsubscribeSessionChanges()

    realtimeChannel = supabase
      .channel(`session-watch-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'players',
          filter: `id=eq.${userId}`
        },
        (payload: any) => {
          const newVersion = payload.new?.session_version
          if (
            typeof newVersion === 'number' &&
            currentSessionVersion.value !== null &&
            newVersion !== currentSessionVersion.value
          ) {
            forceLogoutDueToNewSession()
          }
        }
      )
      .subscribe()
  }

  function unsubscribeSessionChanges() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  function forceLogoutDueToNewSession() {
    stopSessionPolling()
    unsubscribeSessionChanges()
    localStorage.removeItem('arena_token')
    user.value = null
    profile.value = null
    currentSessionVersion.value = null
    window.location.href = '/login?reason=session_invalidated'
  }

  /** Decode sessionVersion out of the arena JWT payload without verifying signature. */
  function extractSessionVersionFromToken(token: string): number | null {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const payload = JSON.parse(atob(base64))
      return typeof payload.sessionVersion === 'number' ? payload.sessionVersion : null
    } catch {
      return null
    }
  }

  async function skipTutorial() {
    if (profile.value) {
      profile.value.is_first_play = false
    }
    const token = localStorage.getItem('arena_token')
    if (!token) return

    try {
      await fetchWithAuth('/auth/skip-tutorial', { method: 'POST' })
    } catch (err) {
      console.error('Failed to skip tutorial:', err)
    }
  }

  async function init() {
    const token = localStorage.getItem('arena_token')

    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null

    if (session?.access_token) {
      await exchangeTokenAfterOAuth()
      cleanOAuthUrlFragment()
    }

    // Email login users have no Supabase session — restore from arena JWT
    if (!user.value && token) {
      try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const payload = JSON.parse(atob(base64))
        user.value = { id: payload.id, email: payload.email }
      } catch {}
    }

    if (user.value || localStorage.getItem('arena_token')) await fetchProfile()

    // Restore session_version tracking + realtime subscription on page reload
    const currentToken = localStorage.getItem('arena_token')
    if (currentToken && user.value?.id) {
      const version = extractSessionVersionFromToken(currentToken)
      if (version !== null) {
        currentSessionVersion.value = version
        subscribeToSessionChanges(user.value.id)
      }
    }

    loading.value = false

    if (localStorage.getItem('arena_token')) {
      startSessionPolling()
    }

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null
      if (event === 'SIGNED_IN' && user.value) {
        await exchangeTokenAfterOAuth()
        cleanOAuthUrlFragment()
        await fetchProfile()
        startSessionPolling()
      }
      if (event === 'SIGNED_OUT') {
        // Only clear if no arena token — email login users keep their session
        if (!localStorage.getItem('arena_token')) {
          profile.value = null
          stopSessionPolling()
          unsubscribeSessionChanges()
          currentSessionVersion.value = null
        }
      }
    })
  }

  async function loginWithGoogle() {
    const siteUrl = import.meta.env.VITE_SITE_URL || window.location.origin
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${siteUrl}/home`,
        queryParams: {
          prompt: 'select_account'
        }
      }
    })
  }

  // Not routed through fetchWithAuth: no arena_token exists yet at this point,
  // this call is what produces the token in the first place.
  async function exchangeTokenAfterOAuth() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) return
    try {
      const res = await fetch(`${SERVER_URL}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supabase_token: session.access_token })
      })
      const data = await res.json()
      if (res.ok && data.token) {
        localStorage.setItem('arena_token', data.token)
        await fetchProfile()

        const version = data.user?.session_version ?? extractSessionVersionFromToken(data.token)
        if (version !== null && user.value?.id) {
          currentSessionVersion.value = version
          subscribeToSessionChanges(user.value.id)
        }
      }
    } catch (err) {
      console.error('exchangeTokenAfterOAuth failed', err)
    }
  }

  // Not routed through fetchWithAuth: pre-auth endpoint, no token to attach.
  async function registerWithEmail(email: string, password: string): Promise<{ success: boolean }> {
    try {
      const res = await fetch(`${SERVER_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username: email.split('@')[0] })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  // Not routed through fetchWithAuth: pre-auth endpoint, no token to attach.
  async function loginWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error }
      localStorage.setItem('arena_token', data.token)
      user.value = { id: data.user.id, email: data.user.email }
      await fetchProfile()
      startSessionPolling()

      const version = data.user?.session_version ?? extractSessionVersionFromToken(data.token)
      if (version !== null) {
        currentSessionVersion.value = version
        subscribeToSessionChanges(data.user.id)
      }

      return { success: true }
    } catch {
      return { success: false, error: 'Server error' }
    }
  }

  async function logout() {
    stopSessionPolling()
    unsubscribeSessionChanges()
    currentSessionVersion.value = null
    await supabase.auth.signOut()
    localStorage.removeItem('arena_token')
    user.value = null
    profile.value = null
  }

  async function fetchProfile() {
    const token = localStorage.getItem('arena_token')
    if (!token) return

    try {
      // fetchWithAuth handles 401 (including SessionInvalidated) globally
      const res = await fetchWithAuth('/api/user/profile')
      if (!res.ok) return
      const data = await res.json()
      profile.value = data
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }

  return {
    user, profile, loading, isLoggedIn, isFirstPlay,
    init, loginWithGoogle, loginWithEmail,
    registerWithEmail, logout, fetchProfile,
    exchangeTokenAfterOAuth, skipTutorial
  }
})