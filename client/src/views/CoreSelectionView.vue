<template>
  <div class="h-screen w-full overflow-hidden relative font-sans flex flex-col text-white select-none">
    
    <PhaserBackground :image-url="currentBgImage" />
    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <button @click="$router.push('/home')" class="absolute top-8 left-8 text-white/50 hover:text-white transition-colors z-20 font-bold tracking-widest uppercase">
      &larr; Back
    </button>

    <div class="absolute top-8 right-8 z-20 flex items-center gap-2" :class="timeLeft <= 5 ? 'text-hexred animate-pulse' : 'text-lightOrange'">
      <svg class="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-mono font-black text-4xl tabular-nums drop-shadow-lg">
        {{ String(timeLeft).padStart(2, '0') }}
      </span>
    </div>

    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full">
      <h2 class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Support
      </h2>
      <p class="text-lightBlue/80 mb-12 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select a Support Core for this match
      </p>

      <div v-if="loading" class="flex justify-center py-16">
        <svg class="animate-spin w-10 h-10 text-lightBlue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c..."></path>
        </svg>
      </div>

      <div v-else-if="errorMsg" class="text-hexred font-bold py-8">
        {{ errorMsg }}
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 md:px-0">
        <div v-for="core in randomCores" :key="core.id"
             @click="selectedCore = core"
             class="group relative backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 cursor-pointer transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
             :class="selectedCore?.id === core.id 
                ? 'bg-white/10 border-2 border-lightBlue shadow-[0_0_40px_rgba(59,130,246,0.5)] -translate-y-4 scale-105' 
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-2'">
          
          <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

          <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-8 transition-all duration-500 border shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
               :class="selectedCore?.id === core.id ? 'border-lightBlue text-lightBlue shadow-[0_0_20px_rgba(59,130,246,0.6)] from-blue/30 to-lightBlue/20' : 'border-white/10 text-gray-400 group-hover:border-lightBlue group-hover:text-lightBlue group-hover:from-blue/20 group-hover:to-lightBlue/10 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'">
            <svg class="w-12 h-12 transition-colors duration-500 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="core.icon" />
            </svg>
          </div>

          <h3 class="text-3xl font-black mb-4 tracking-wide transition-colors duration-500"
              :class="selectedCore?.id === core.id ? 'text-lightBlue' : 'text-white group-hover:text-lightBlue'">
            {{ core.name }}
          </h3>
          <p class="text-base text-gray-300/80 leading-relaxed max-w-[250px] mb-6">{{ core.description }}</p>
          
          <div class="mt-auto transition-all transform duration-500"
               :class="selectedCore?.id === core.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 group-hover:opacity-100 group-hover:translate-y-0'">
            <button @click.stop="submitCore(core)" class="relative px-8 py-3 bg-blue/20 rounded-full border border-lightBlue overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.5)] hover:bg-lightBlue/20 transition-colors w-full">
              <div v-if="selectedCore?.id === core.id" class="absolute inset-0 bg-lightBlue/20 animate-pulse"></div>
              <span class="relative z-10 text-xs font-black text-lightBlue tracking-[0.2em] uppercase drop-shadow-md">Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </main>

    <div class="relative z-20 h-2 w-full flex bg-black/50">
      <div class="h-full transition-all duration-1000 ease-linear rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]"
        :class="timeLeft <= 5 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-orange to-lightOrange'"
        :style="{ width: `${(timeLeft / SELECTION_DURATION) * 100}%` }"></div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGameStore } from '../stores/gameStore'
import PhaserBackground from '../components/game/PhaserBackground.vue'

const router = useRouter()
const gameStore = useGameStore()
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

interface CoreOption {
  id: string
  name: string
  description: string
  flat_buff: number
  multiplier_buff: number
  icon: string
}

const DEFAULT_ICON = 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
const ICON_MAP: Record<string, string> = {
  'time freeze': 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  'score multiplier': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'hint reveal': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z'
}

const THEME_MAP: Record<string, string> = {
  'daily-life': '/bg-daily-life.png',
  'cafe': '/bg-cafe.png',
  'travel': '/bg-travel.png'
}

const currentBgImage = ref('/bg-daily-life.png')

function getBackgroundImage(themeKey: string) {
  return THEME_MAP[themeKey] || '/bg-daily-life.png'
}

const supportCores = ref<CoreOption[]>([])
const randomCores = ref<CoreOption[]>([])
const selectedCore = ref<CoreOption | null>(null)
const loading = ref(true)
const errorMsg = ref('')

const SELECTION_DURATION = 15
const timeLeft = ref(SELECTION_DURATION)
let selectionTimer: ReturnType<typeof setInterval> | null = null

function startTimer() {
  if (selectionTimer) return
  selectionTimer = setInterval(() => {
    if (timeLeft.value <= 1) {
      timeLeft.value = 0
      stopTimer()
      triggerTimeout()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function stopTimer() {
  if (selectionTimer) {
    clearInterval(selectionTimer)
    selectionTimer = null
  }
}

function triggerTimeout() {
  if (loading.value) return 
  
  let coreToSubmit = selectedCore.value
  
  if (!coreToSubmit && randomCores.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * randomCores.value.length)
    coreToSubmit = randomCores.value[randomIndex]
  }

  if (coreToSubmit) {
    submitCore(coreToSubmit)
  }
}

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
    loading.value = false
    
    startTimer()

  } catch (err) {
    console.error('fetchSupportCores error:', err)
    errorMsg.value = 'Failed to load Support Cores.'
    loading.value = false
  }
}

async function createSession(coreId: string) {
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ active_core_id: coreId })
    })
    
    if (!res.ok) return
    const data = await res.json()
    
    if (data.session_id) {
      gameStore.sessionId = data.session_id 
    }
    if (data.theme) {
      currentBgImage.value = getBackgroundImage(data.theme)
    }
  } catch (err) {
    console.error('Lỗi khi tạo Session:', err)
  }
}

async function submitCore(core: CoreOption) {
  if (loading.value) return
  loading.value = true
  stopTimer() 

  gameStore.activeCoreId = core.id
  gameStore.activeCoreName = core.name
  
  await createSession(core.id)

  router.push('/game') 
}

onMounted(() => {
  fetchSupportCores()
})

onUnmounted(() => {
  stopTimer() 
})
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>