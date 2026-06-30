<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans flex flex-col items-center justify-center px-6">
    <div
      class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0">
    </div>
    <div
      class="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0">
    </div>

    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black italic text-white/[0.02] tracking-tighter whitespace-nowrap select-none pointer-events-none z-0 transform -skew-x-12">
      NAENRA
    </div>

    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <div class="relative z-10 w-full max-w-4xl flex flex-col items-center">
      <h2 class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Support
      </h2>
      <p class="text-lightBlue/80 mb-12 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select a Support Core for this match
      </p>

      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin w-10 h-10 text-lightBlue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>

      <p v-else-if="errorMsg" class="text-hexred text-sm font-bold text-center uppercase tracking-wider mb-6">{{ errorMsg }}</p>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full max-w-3xl mx-auto">
        <div v-for="core in randomCores" :key="core.id"
             @click="selectCore(core)"
             class="group relative bg-white/5 backdrop-blur-xl border rounded-[2.5rem] p-8 md:p-12 hover:bg-white/10 cursor-pointer transition-all duration-500 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-4 flex flex-col items-center text-center overflow-hidden"
             :class="selectedCoreId === core.id
               ? 'border-lightBlue/70 bg-white/10 shadow-[0_0_40px_rgba(59,130,246,0.35)] -translate-y-2'
               : 'border-white/10 hover:border-lightBlue/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.3)]'">
          <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-8 group-hover:from-blue/20 group-hover:to-lightBlue/10 transition-all duration-500 border border-white/10 group-hover:border-lightBlue shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <svg class="w-12 h-12 text-gray-400 group-hover:text-lightBlue transition-colors duration-500 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="core.icon" />
            </svg>
          </div>

          <h3 class="text-3xl font-black text-white mb-4 tracking-wide group-hover:text-lightBlue transition-colors duration-500">
            {{ core.name }}
          </h3>
          <p class="text-base text-gray-300/80 leading-relaxed max-w-[250px] mb-4">
            {{ core.description || 'No special effect.' }}
          </p>

          <div class="flex gap-3 text-[11px] font-mono mb-2">
            <span class="px-2 py-1 rounded bg-black/30 text-lightBlue">+{{ core.flat_buff }} flat</span>
            <span class="px-2 py-1 rounded bg-black/30 text-lightOrange">x{{ core.multiplier_buff }} mult</span>
          </div>

          <div class="mt-6 opacity-0 group-hover:opacity-100 transition-all transform translate-y-6 group-hover:translate-y-0 duration-500">
            <div class="relative px-8 py-3 bg-blue/20 rounded-full border border-lightBlue overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <div class="absolute inset-0 bg-lightBlue/20 animate-pulse"></div>
              <span class="relative z-10 text-xs font-black text-lightBlue tracking-[0.2em] uppercase drop-shadow-md">Select</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'

interface CoreOption {
  id: string
  name: string
  description: string | null
  flat_buff: number
  multiplier_buff: number
  icon: string
}

const ICON_MAP: Record<string, string> = {
  'no core': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'speed core': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'power core': 'M13 2L3 14h7v8l10-12h-7V2z',
  'balanced core': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'combo core': 'M9 9V7a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2h-2M9 9H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2M9 9l6 6'
}
const DEFAULT_ICON = 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'

const router = useRouter()
const gameStore = useGameStore()
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const supportCores = ref<CoreOption[]>([])
const selectedCoreId = ref<string | null>(null)
const loading = ref(true)
const errorMsg = ref('')
const randomCores = ref<CoreOption[]>([])

function getRandomCores(cores: CoreOption[], count: number): CoreOption[] {
  const shuffled = [...cores].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function fetchSupportCores() {
  loading.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/cores`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()

    supportCores.value = (data.cores ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      flat_buff: c.flat_buff,
      multiplier_buff: c.multiplier_buff,
      icon: ICON_MAP[c.name?.toLowerCase()] || DEFAULT_ICON
    }))

    randomCores.value = getRandomCores(supportCores.value, 2)
    selectedCoreId.value = randomCores.value.length > 0 ? randomCores.value[0].id : null

  } catch (err) {
    console.error('fetchSupportCores error:', err)
    errorMsg.value = 'Failed to load Support Cores.'
  } finally {
    loading.value = false
  }
}

function selectCore(core: CoreOption) {
  selectedCoreId.value = core.id
  router.push('/game')
}



onMounted(fetchSupportCores)
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>