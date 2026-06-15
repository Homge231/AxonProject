import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/lobby',
      name: 'lobby',
      component: () => import('../views/LobbyView.vue') // Lazy load
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login' // Fallback
    }
  ]
})

export default router