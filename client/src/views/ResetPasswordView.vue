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
        <p class="text-lightBlue font-bold tracking-[0.2em] text-[10px] uppercase">Set New Password</p>
      </div>

      <div v-if="done" class="text-center space-y-4">
        <div class="bg-success/10 border border-success/50 rounded-xl px-4 py-4 text-success text-sm font-bold tracking-wider">
          Password updated successfully.
        </div>
        <button @click="router.push('/')" class="text-xs text-lightBlue hover:text-blue transition-colors font-semibold uppercase tracking-widest">
          Go to Login
        </button>
      </div>

      <div v-else class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">New Password</label>
          <input
            v-model="password"
            type="password"
            placeholder="••••••••"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
        </div>

        <div>
          <label class="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
            class="w-full bg-darkNavy/50 border border-white/10 rounded-xl px-4 py-3.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-blue focus:ring-1 focus:ring-blue transition-colors"
          />
        </div>

        <p v-if="error" class="text-red-400 text-xs ml-1 font-semibold">{{ error }}</p>

        <button
          @click="handleReset"
          :disabled="loading"
          class="w-full mt-2 bg-white/5 border border-white/10 text-white font-black py-4 rounded-xl hover:bg-white/10 hover:border-hexred transition-all duration-300 uppercase tracking-widest text-sm disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
        >
          <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"></div>
          <span class="relative z-10">{{ loading ? 'Updating...' : 'Update Password' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'

const router = useRouter()
const password = ref('')
const confirmPassword = ref('')
const error = ref('')
const loading = ref(false)
const done = ref(false)

async function handleReset() {
  error.value = ''
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  loading.value = true
  try {
    const { error: err } = await supabase.auth.updateUser({ password: password.value })
    if (err) {
      error.value = err.message
      return
    }
    done.value = true
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>