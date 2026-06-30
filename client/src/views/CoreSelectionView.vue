<template>
  <div class="min-h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans flex flex-col items-center justify-center px-6">
    <div class="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-orange rounded-full mix-blend-screen filter blur-[128px] opacity-20 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <div class="relative z-10 w-full max-w-3xl">
      <div class="text-center mb-10">
        <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase mb-2">Pre-Match</p>
        <h1 class="text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred italic">
          Select Support Core
        </h1>
      </div>

      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin w-8 h-8 text-orange" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <p v-else-if="errorMsg" class="text-hexred text-sm font-bold text-center uppercase tracking-wider mb-6">{{ errorMsg }}</p>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <button
          v-for="core in cores"
          :key="core.id"
          @click="selectedCoreId = core.id"
          class="text-left p-6 rounded-2xl border transition-all duration-200 backdrop-blur-xl"
          :class="selectedCoreId === core.id
            ? 'border-orange bg-orange/10 shadow-[0_0_25px_rgba(255,123,0,0.25)]'
            : 'border-white/10 bg-white/5 hover:border-white/30'"
        >
          <div class="flex justify-between items-start mb-2">
            <h2 class="text-lg font-black uppercase tracking-wider"
              :class="selectedCoreId === core.id ? 'text-orange' : 'text-white'">
              {{ core.name }}
            </h2>
            <svg v-if="selectedCoreId === core.id" class="w-5 h-5 text-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p v-if="core.description" class="text-gray-400 text-xs mb-4 leading-relaxed">{{ core.description }}</p>
          <div class="flex gap-3 text-[11px] font-mono">
            <span class="px-2 py-1 rounded bg-black/30 text-lightBlue">+{{ core.flat_buff }} flat</span>
            <span class="px-2 py-1 rounded bg-black/30 text-lightOrange">x{{ core.multiplier_buff }} mult</span>
          </div>
        </button>
      </div>

      <div class="flex gap-4 justify-center">
        <button @click="router.push('/home')"
          class="px-8 py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors rounded-xl">
          Back
        </button>
        <button
          @click="confirmAndStart"
          :disabled="!selectedCoreId"
          class="px-10 py-3.5 bg-gradient-to-r from-orange to-hexred text-white font-black text-sm tracking-widest uppercase rounded-xl shadow-lg hover:shadow-[0_0_20px_rgba(230,57,70,0.5)] transition-shadow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm & Find Match
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

interface CoreOption {
  id: string
  name: string
  description: string | null
  flat_buff: number
  multiplier_buff: number
}

const router = useRouter()
const gameStore = useGameStore()
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const cores = ref<CoreOption[]>([])
const selectedCoreId = ref<string | null>(null)
const loading = ref(true)
const errorMsg = ref('')

async function fetchCores() {
  loading.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/cores`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    cores.value = data.cores ?? []
    const noCore = cores.value.find(c => c.name.toLowerCase() === 'no core')
    selectedCoreId.value = (noCore ?? cores.value[0])?.id ?? null
  } catch (err) {
    console.error('fetchCores error:', err)
    errorMsg.value = 'Failed to load Support Cores.'
  } finally {
    loading.value = false
  }
}

function confirmAndStart() {
  if (!selectedCoreId.value) return
  gameStore.activeCoreId = selectedCoreId.value
  router.push('/game')
}

onMounted(fetchCores)
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>