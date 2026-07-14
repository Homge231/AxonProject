import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useAuthStore } from './stores/authStore'

const app = createApp(App)
const pinia = createPinia()
const auth = useAuthStore(pinia)

app.use(pinia)
app.use(router)

auth.init().finally(() => {
  router.isReady().then(() => {
    app.mount('#app')
  })
})