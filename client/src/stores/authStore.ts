import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../lib/supabase'

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
      console.log('Auth event:', event)
      user.value = session?.user ?? null
      if (event === 'SIGNED_IN' && user.value) {
        await fetchProfile()
        window.location.href = '/lobby'
      }
      if (event === 'SIGNED_OUT') {
        profile.value = null
        window.location.href = '/'
      }
    })
  }

  async function loginWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/lobby`
      }
    })
    if (error) console.error('Login error:', error)
  }

  async function logout() {
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
  }

  async function fetchProfile() {
    if (!user.value) return
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .eq('id', user.value.id)
      .single()
    if (error) console.error('Profile error:', error)
    profile.value = data
  }

  return {
    user, profile, loading, isLoggedIn,
    init, loginWithGoogle, logout, fetchProfile
  }
})
