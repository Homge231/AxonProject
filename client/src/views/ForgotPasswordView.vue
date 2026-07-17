<template>
  <div class="min-h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans flex flex-col items-center justify-center">
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <div class="relative z-10 w-full max-w-md p-10 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
      <div class="mb-8 flex flex-col items-center">
        <div class="w-16 h-16 mb-4 flex items-center justify-center transform -skew-x-12 shadow-[4px_4px_0_rgba(255,123,0,0.5)] bg-white/5 border border-white/10">
          <svg class="w-10 h-10 text-orange fill-current transform skew-x-12" viewBox="0 0 24 24">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <h1 class="text-4xl font-black mb-2 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase italic">Naenra</h1>
        <p class="text-lightBlue font-bold tracking-[0.2em] text-[10px] uppercase">Reset Password</p>
      </div>

      <!-- Step 1: Enter email -->
      <div v-if="!sent" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="player@naenra.com"
            @keyup.enter="handleSubmit"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
          <p v-if="error" class="text-red-400 text-xs mt-1.5 ml-1 font-semibold">{{ error }}</p>
        </div>

        <button
          @click="handleSubmit"
          :disabled="loading"
          class="w-full mt-2 bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/10 hover:border-hexred transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
          <span class="relative z-10">{{ loading ? 'Sending...' : 'Send Reset Code' }}</span>
        </button>

        <button @click="router.push('/')" class="w-full text-center text-xs text-gray-500 hover:text-white transition-colors font-semibold uppercase tracking-widest mt-2">
          Back to Login
        </button>
      </div>

      <!-- Step 2: Email sent confirmation -->
      <div v-else class="text-center space-y-4">
        <div class="bg-success/10 border border-success/50 rounded-xl px-4 py-4 text-success text-sm font-bold tracking-wider">
          Reset code sent! Check your email inbox.
        </div>
        <p class="text-gray-400 text-xs">Enter the 6-digit code along with your new password on the next screen.</p>
        <button
          @click="goToReset"
          class="w-full bg-gradient-to-r from-orange to-hexred text-white font-black py-4 rounded-xl transition-all duration-300 uppercase tracking-widest text-sm"
        >
          Enter Reset Code →
        </button>
        <button @click="router.push('/')" class="text-xs text-lightBlue hover:text-blue transition-colors font-semibold uppercase tracking-widest">
          Back to Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const router = useRouter()
const email = ref('')
const error = ref('')
const loading = ref(false)
const sent = ref(false)

async function handleSubmit() {
  error.value = ''
  if (!email.value || !email.value.includes('@')) {
    error.value = 'Please enter a valid email'
    return
  }
  loading.value = true
  try {
    const res = await fetch(`${SERVER_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value })
    })
    const data = await res.json()
    if (!res.ok) {
      error.value = data.error || 'Failed to send reset code'
      return
    }
    sent.value = true
  } catch {
    error.value = 'Server error. Please try again.'
  } finally {
    loading.value = false
  }
}

function goToReset() {
  router.push(`/reset-password?email=${encodeURIComponent(email.value)}`)
}
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>