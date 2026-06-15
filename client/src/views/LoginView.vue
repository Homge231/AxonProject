<template>
  <div class="flex items-center justify-center h-screen bg-background">
    <div class="w-full max-w-sm p-8 bg-surface-container rounded-xl border border-outline-variant text-center">
      <h1 class="text-3xl font-bold text-primary-fixed tracking-widest uppercase mb-2">
        ARENA.ENG
      </h1>
      <p class="text-on-surface-variant text-sm mb-8 tracking-wide">
        English battle. Real-time. Two players.
      </p>
      <button
        @click="handleLogin"
        :disabled="loading"
        class="w-full flex items-center justify-center gap-3 py-3 bg-surface-container-high border border-outline-variant rounded-lg hover:border-primary-fixed transition-all duration-200 text-on-surface font-bold disabled:opacity-50"
      >
        <svg width="20" height="20" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        {{ loading ? 'Redirecting...' : 'Login with Google' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const auth = useAuthStore()
const loading = ref(false)

async function handleLogin() {
  loading.value = true
  await auth.loginWithGoogle()
}
</script>