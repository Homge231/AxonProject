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
    const { data: { session } } = await supabase.auth.getSession()
    user.value = session?.user ?? null
    if (user.value) await fetchProfile()
    loading.value = false

    supabase.auth.onAuthStateChange(async (event, session) => {
      user.value = session?.user ?? null
      if (event === 'SIGNED_IN' && user.value) {
        await fetchProfile()
      }
      if (event === 'SIGNED_OUT') {
        profile.value = null
      }
    })
  }

  async function loginWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/home`
      }
    })
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

  async function loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${SERVER_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) return { success: false, error: data.error }
      localStorage.setItem('arena_token', data.token)
      user.value = data.user
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
    if (!user.value) return
    const { data } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.value.id)
      .single()
    profile.value = data
  }

  return {
    user, profile, loading, isLoggedIn,
    init, loginWithGoogle, loginWithEmail,
    registerWithEmail, logout, fetchProfile
  }
})
