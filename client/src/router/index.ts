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
      path: '/forgot-password',
      name: 'forgot-password',
      component: () => import('../views/ForgotPasswordView.vue')
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/' 
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true }
    },
  ]
})

router.beforeEach(async (to) => {
  const hash = window.location.hash;
  if (hash.includes('access_token') || hash.includes('type=recovery')) {
    return true;
  }

  if (to.name === 'reset-password' || to.name === 'forgot-password') {
    return true
  }

  if (!to.meta.requiresAuth) {
    return true
  }

  // arena_token alone is sufficient — email login users have no Supabase session
  const token = localStorage.getItem('arena_token')
  if (token) return true

  // Fallback for Google OAuth users
  const { data: { session } } = await supabase.auth.getSession()
  if (session) return true

  return { name: 'login' }
})

// Handle chunk load errors when deploying new versions
router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError') {
    window.location.href = to.fullPath
  }
})

export default router