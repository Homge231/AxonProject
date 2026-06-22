import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

router.isReady().then(() => {
  app.mount('#app')
})

const auth = useAuthStore(pinia)

supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    auth.user = session.user
    await auth.fetchProfile()
    await auth.exchangeTokenAfterOAuth()
    // Add this: redirect to /home after Google OAuth if on login page
    const currentPath = window.location.pathname
    if (currentPath === '/' || currentPath === '/login') {
      router.push('/home')
    }
  }
  if (event === 'SIGNED_OUT') {
    auth.user = null
  }
})