import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')

const auth = useAuthStore()

supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth event:', event, session?.user?.email)
  if (event === 'SIGNED_IN' && session?.user) {
    auth.user = session.user
    await auth.fetchProfile()
    router.push('/lobby')
  }
  if (event === 'SIGNED_OUT') {
    auth.user = null
    router.push('/')
  }
})

supabase.auth.getSession().then(({ data: { session } }) => {
  if (session?.user) {
    auth.user = session.user
    auth.fetchProfile()
    router.push('/lobby')
  }
})
