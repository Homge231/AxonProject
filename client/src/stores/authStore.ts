import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const profile = ref<any>(null)
  const loading = ref(true)

  const isLoggedIn = computed(() => !!user.value)

  async function init() {
    const token = localStorage.getItem('arena_token')

    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null

    if (session?.access_token) {
      await exchangeTokenAfterOAuth()
    }

    // Email login users have no Supabase session — restore from arena JWT
    if (!user.value && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        user.value = { id: payload.id, email: payload.email }
      } catch {}
    }

    if (user.value || localStorage.getItem('arena_token')) await fetchProfile()
    loading.value = false

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null
      if (event === 'SIGNED_IN' && user.value) {
        await exchangeTokenAfterOAuth()
        await fetchProfile()
      }
      if (event === 'SIGNED_OUT') {
        // Only clear if no arena token — email login users keep their session
        if (!localStorage.getItem('arena_token')) {
          profile.value = null
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
      }
    } catch (err) {
      console.error('exchangeTokenAfterOAuth failed', err)
    }
  }

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
      return { success: true }
    } catch {
      return { success: false, error: 'Server error' }
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('arena_token')
    user.value = null
    profile.value = null
  }

  async function fetchProfile() {
    const token = localStorage.getItem('arena_token')
    if (!token) return

    try {
      const res = await fetch(`${SERVER_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return
      const data = await res.json()
      profile.value = data
    } catch (err) {
      console.error('fetchProfile error:', err)
    }
  }

  return {
    user, profile, loading, isLoggedIn,
    init, loginWithGoogle, loginWithEmail,
    registerWithEmail, logout, fetchProfile,
    exchangeTokenAfterOAuth
  }
})
