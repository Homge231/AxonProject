import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',      component: () => import('../views/LoginView.vue') },
    { path: '/lobby', component: () => import('../views/LobbyView.vue'),  meta: { requiresAuth: true } },
    { path: '/core',  component: () => import('../views/CoreSelectionView.vue'), meta: { requiresAuth: true } },
    { path: '/game',  component: () => import('../views/GameplayView.vue'), meta: { requiresAuth: true } },
    { path: '/shop',  component: () => import('../views/ShopView.vue'),    meta: { requiresAuth: true } },
    { path: '/end',   component: () => import('../views/MatchEndView.vue'), meta: { requiresAuth: true } },
  ]
})

router.beforeEach(async (to) => {
  if (!to.meta.requiresAuth) return true

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return '/'
  return true
})

export default router
