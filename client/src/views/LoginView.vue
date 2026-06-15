<template>
  <div class="min-h-screen flex items-center justify-center bg-darkNavy text-white relative overflow-hidden">
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange rounded-full mix-blend-multiply filter blur-[128px] opacity-20 pointer-events-none"></div>

    <div class="relative z-10 w-full max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] transform transition-all hover:border-white/20">
      
      <div class="mb-8 text-center">
        <h1 class="text-6xl font-black mb-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-lg">
          NAENRA
        </h1>
        <p class="text-lightBlue font-semibold tracking-[0.2em] text-sm">
          TYPING ESPORTS ARENA
        </p>
      </div>

      <div v-if="isLoading" class="mb-6 flex items-center justify-center space-x-2 text-lightOrange">
        <svg class="animate-spin h-5 w-5 text-lightOrange" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Processing...</span>
      </div>

      <form @submit.prevent="handleTraditionalLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400 mb-1">Email</label>
          <input 
            v-model="email" 
            type="email" 
            required
            placeholder="player@naenra.com"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
        </div>

        <div>
          <div class="flex justify-between items-center mb-1">
            <label class="block text-sm font-medium text-gray-400">Password</label>
            <a href="#" class="text-xs text-lightBlue hover:text-blue transition-colors">Forgot?</a>
          </div>
          <input 
            v-model="password" 
            type="password" 
            required
            placeholder="••••••••"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
        </div>

        <button 
          type="submit"
          :disabled="isLoading"
          class="w-full bg-gradient-to-r from-orange to-hexred text-white font-bold py-3.5 px-4 rounded-xl mt-4 hover:shadow-[0_0_20px_rgba(230,57,70,0.4)] transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          Login to Arena
        </button>
      </form>

      <div class="relative flex py-6 items-center">
        <div class="flex-grow border-t border-white/10"></div>
        <span class="flex-shrink-0 mx-4 text-gray-500 text-xs font-semibold tracking-wider uppercase">OR</span>
        <div class="flex-grow border-t border-white/10"></div>
      </div>

      <button 
        @click="handleGoogleLogin"
        :disabled="isLoading"
        class="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white font-semibold py-3 px-4 rounded-xl hover:bg-white/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg class="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <p class="mt-6 text-center text-sm text-gray-400">
        New to Naenra? 
        <a href="#" class="text-lightOrange hover:text-orange font-semibold transition-colors">Create account</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref<boolean>(false)

// Biến lưu trữ dữ liệu form
const email = ref<string>('')
const password = ref<string>('')

const handleTraditionalLogin = () => {
  isLoading.value = true
  
  // Mock API call cho Traditional Login
  console.log('Logging in with:', email.value, password.value)
  setTimeout(() => {
    isLoading.value = false
    router.push('/lobby')
  }, 1000)
}

const handleGoogleLogin = () => {
  isLoading.value = true
  
  // Mock API call cho Google Login
  setTimeout(() => {
    isLoading.value = false
    router.push('/lobby')
  }, 1000)
}
</script>