import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', 
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/signup', 
      name: 'signup',
      component: () => import('../views/SignupView.vue')
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true }
    },
    { 
      path: '/core', 
      component: () => import('../views/CoreSelectionView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/game', 
      component: () => import('../views/GameplayView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/shop', 
      component: () => import('../views/ShopView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/end', 
      component: () => import('../views/MatchEndView.vue'), 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/error', 
      name: 'error', 
      component: () => import('../views/ErrorView.vue') 
    },
    {
      path: '/verify-otp',
      name: 'verify-otp',
      component: () => import('../views/VerifyOTPView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' 
    },
  ]
})

router.beforeEach(async (to, _from, next) => {
  // 1. Kiểm tra route có yêu cầu auth không
  if (!to.meta.requiresAuth) {
    return next()
  }

  // 2. Kiểm tra cả 2 nguồn: Token custom (LocalStorage) và Session (Supabase)
  const token = localStorage.getItem('arena_token')
  const { data: { session } } = await supabase.auth.getSession()

  // 3. Nếu không có cả hai -> Chặn truy cập, về login
  if (!token && !session) {
    return next({ name: 'login' }) 
  }

  // 4. Nếu có một trong hai -> Cho phép vào
  return next()
})

export default router