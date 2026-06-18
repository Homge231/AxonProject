<template>
  <div class="min-h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans selection:bg-orange/40 flex flex-col items-center justify-center">
    
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>

    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <div class="relative z-10 w-full max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transform transition-all hover:border-white/20">
      
      <div class="mb-8 flex flex-col items-center">
        <div class="w-16 h-16 mb-4 flex items-center justify-center transform -skew-x-12 shadow-[4px_4px_0_rgba(255,123,0,0.5)] bg-white/5 border border-white/10">
          <svg class="w-10 h-10 text-orange fill-current transform skew-x-12" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <h1 class="text-4xl font-black mb-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-lg uppercase italic">
          Naenra
        </h1>
        <p class="text-lightBlue font-bold tracking-[0.2em] text-[10px] uppercase">
          TYPING ESPORTS ARENA
        </p>
      </div>

      <div v-if="successMessage" class="bg-success/10 border border-success/50 rounded-xl px-4 py-3 mb-6 text-success text-sm font-bold text-center tracking-wider">
        {{ successMessage }}
      </div>

      <div class="flex mb-8 bg-darkNavy/50 rounded-xl p-1 border border-white/10">
        <button
          @click="switchMode('login')"
          :class="mode === 'login' ? 'bg-gradient-to-r from-orange to-hexred text-white shadow-lg' : 'text-gray-400 hover:text-white'"
          class="flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300"
        >
          Login
        </button>
        <button
          @click="switchMode('register')"
          :class="mode === 'register' ? 'bg-gradient-to-r from-orange to-hexred text-white shadow-lg' : 'text-gray-400 hover:text-white'"
          class="flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all duration-300"
        >
          Register
        </button>
      </div>

      <!-- Register Form -->
      <div v-if="mode === 'register'" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Username</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="Player_One"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="errors.username" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ errors.username }}</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="player@naenra.com"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="errors.email" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ errors.email }}</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="errors.password" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ errors.password }}</p>
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
          <input
            v-model="form.confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="errors.confirmPassword" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ errors.confirmPassword }}</p>
        </div>

        <button
          @click="handleRegister"
          :disabled="loading"
          class="w-full mt-6 bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/10 hover:border-hexred transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'INITIALIZING...' : 'CREATE ACCOUNT' }}
          </span>
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="mode === 'login'" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="player@naenra.com"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="errors.email" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ errors.email }}</p>
        </div>

        <div>
          <div class="flex justify-between items-center mb-1.5 px-1">
            <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
            <button
              type="button" 
              @click="router.push('/forgot-password')"
              class="text-xs text-lightBlue hover:text-blue transition-colors font-semibold"
            >
              Forgot?
            </button>
          </div>
          <input
            v-model="form.password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="errors.password" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ errors.password }}</p>
        </div>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full mt-6 bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/10 hover:border-hexred transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
          <span class="relative z-10 flex items-center justify-center gap-2">
            <svg v-if="loading" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            {{ loading ? 'AUTHENTICATING...' : 'ENTER ARENA' }}
          </span>
        </button>
      </div>

      <div class="relative flex py-8 items-center">
        <div class="flex-grow border-t border-white/10"></div>
        <span class="flex-shrink-0 mx-4 text-gray-500 text-[10px] font-bold tracking-[0.2em] uppercase">SYSTEM OVERRIDE</span>
        <div class="flex-grow border-t border-white/10"></div>
      </div>

      <button
        @click="handleGoogle"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-3 py-3.5 bg-darkNavy/50 border border-white/10 rounded-xl hover:bg-white/5 hover:border-white/20 transition-all duration-300 text-white text-sm font-bold tracking-wider disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        CONNECT WITH GOOGLE
      </button>

      <p v-if="errors.general" class="text-hexred text-xs font-bold text-center mt-6 animate-pulse uppercase tracking-wider">
        >> ERROR: {{ errors.general }}
      </p>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const auth = useAuthStore()
const mode = ref<'login' | 'register'>('login')
const loading = ref(false)
const successMessage = ref('')

const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })
const errors = reactive({ username: '', email: '', password: '', confirmPassword: '', general: '' })

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode
  clearErrors()
  successMessage.value = ''
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
}

function clearErrors() {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.general = ''
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateForm(): boolean {
  clearErrors()
  let valid = true
  if (mode.value === 'register') {
    if (!form.username.trim()) {
      errors.username = 'Username is required'
      valid = false
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
      valid = false
    }
  }
  if (!form.email || !validateEmail(form.email)) {
    errors.email = 'Invalid email format'
    valid = false
  }
  if (!form.password || form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    valid = false
  }
  return valid
}

async function handleRegister() {
  if (!validateForm()) return
  loading.value = true
  try {
    const res = await fetch(`${SERVER_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        password: form.password,
        username: form.username
      })
    })
    const data = await res.json()
    if (!res.ok) {
      errors.general = data.error || 'Registration failed'
      return
    }
    router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`)
  } catch {
    errors.general = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleLogin() {
  if (!validateForm()) return
  loading.value = true
  try {
    const res = await fetch(`${SERVER_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email, password: form.password })
    })
    const data = await res.json()
    if (!res.ok) {
      errors.general = data.error || 'Login failed'
      return
    }
    localStorage.setItem('arena_token', data.token)
    auth.user = data.user
    router.push('/home')
  } catch {
    errors.general = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handleGoogle() {
  loading.value = true
  await auth.loginWithGoogle()
}
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>