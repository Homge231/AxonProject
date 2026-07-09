<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md text-white select-none">
    
    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <div class="absolute top-8 right-8 z-20 flex items-center gap-2"
      :class="timeLeft <= 5 ? 'text-hexred animate-pulse' : 'text-lightOrange'">
      <svg class="w-6 h-6 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-mono font-black text-4xl tabular-nums drop-shadow-lg">
        {{ String(timeLeft).padStart(2, '0') }}
      </span>
    </div>

    <main class="relative z-10 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full">
      <h2 class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Upgrade
      </h2>
      <p class="text-lightBlue/80 mb-12 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select a Support Core for Round 2
      </p>

      <div v-if="loading && randomCores.length === 0" class="flex justify-center py-16">
        <svg class="animate-spin w-10 h-10 text-lightBlue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c..."></path>
        </svg>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 md:px-0 items-stretch"
        :class="{ 'pointer-events-none': loading && randomCores.length > 0 }">
        
        <div v-for="(core, index) in randomCores" :key="index" class="flex flex-col items-center gap-6 w-full h-full">
          
          <div @click="selectCore(core)"
            class="tech-border group flex-1 w-full relative backdrop-blur-md rounded-2xl p-8 md:p-12 cursor-pointer transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            :class="[
              selectedCore?.id === core.id
                ? 'bg-black/60 border-2 border-lightBlue shadow-[0_0_40px_rgba(59,130,246,0.5)] -translate-y-4 scale-105'
                : 'bg-black/40 border border-white/10 hover:bg-black/50 hover:border-lightBlue/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-2',
              rerollingIndex === index ? 'reroll-anim pointer-events-none' : '',
              loading && selectedCore?.id !== core.id && randomCores.length > 0 ? 'opacity-40 grayscale' : ''
            ]">
            
            <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative w-24 h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-8 transition-all duration-500 border shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
              :class="selectedCore?.id === core.id ? 'border-lightBlue text-lightBlue shadow-[0_0_20px_rgba(59,130,246,0.6)] from-blue/30 to-lightBlue/20' : 'border-white/10 text-gray-400 group-hover:border-lightBlue group-hover:text-lightBlue group-hover:from-blue/20 group-hover:to-lightBlue/10 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'">
              <span class="text-5xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform group-hover:scale-110 duration-300">
                {{ core.icon || '🔮' }}
              </span>
            </div>
            
            <h3 class="text-3xl font-black mb-4 tracking-wide transition-colors duration-500"
              :class="selectedCore?.id === core.id ? 'text-lightBlue' : 'text-white group-hover:text-lightBlue'">
              {{ core.name }}
            </h3>
            
            <p class="text-base text-gray-300/80 leading-relaxed max-w-[250px] mb-6">{{ core.description }}</p>
          </div>

          <button @click="handleCardReroll(index)"
            :disabled="rerolledSlots[index] || rerollingIndex !== null || loading"
            class="group relative px-6 py-2.5 rounded-full transition-all duration-300 flex items-center justify-center gap-2 shadow-lg disabled:cursor-not-allowed"
            :class="rerolledSlots[index]
              ? 'bg-black/60 border border-gray-700 opacity-40 blur-[1px] grayscale'
              : 'bg-black/40 backdrop-blur-md border border-white/20 hover:border-lightBlue hover:bg-white/10 cursor-pointer'">
            <svg class="w-4 h-4 transition-transform duration-500 text-gray-400 group-hover:text-lightBlue"
              :class="{ 'animate-spin': rerollingIndex === index }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span class="font-bold tracking-widest text-xs uppercase transition-colors"
              :class="rerolledSlots[index] ? 'text-gray-500' : 'text-gray-400 group-hover:text-lightBlue'">
              {{ rerolledSlots[index] ? 'Used' : 'Reroll' }}
            </span>
          </button>
          
        </div>
      </div>
    </main>

    <div class="absolute bottom-0 left-0 z-20 h-2 w-full flex bg-black/50">
      <div class="h-full transition-all duration-1000 ease-linear rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]"
        :class="timeLeft <= 5 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-orange to-lightOrange'"
        :style="{ width: `${(timeLeft / SELECTION_DURATION) * 100}%` }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits(['selected'])
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const DEFAULT_ICON = '🔮'
const ICON_MAP: Record<string, string> = {
  'balanced core': '⚖️', 'combo core': '🔥', 'oracle core': '👁️', 'speedster': '⚡', 
  'mission core': '🎯', 'power core': '💪', 'aegis shield': '🛡️', "pandora's box": '🎲'
}

const supportCores = ref<any[]>([])
const randomCores = ref<any[]>([])
const selectedCore = ref<any | null>(null)
const loading = ref(true)

const rerolledSlots = ref([false, false])
const rerollingIndex = ref<number | null>(null)

const SELECTION_DURATION = 15
const timeLeft = ref(SELECTION_DURATION)
let timer: ReturnType<typeof setInterval> | null = null

function getRandomCores(cores: any[], count: number) {
  const shuffled = [...cores].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

async function fetchUpgradeCores() {
  loading.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/cores`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    const data = await res.json()
    
    supportCores.value = (data.cores || []).map((c: any) => ({
      ...c,
      icon: ICON_MAP[c.name?.toLowerCase()] || DEFAULT_ICON
    }))
    
    randomCores.value = getRandomCores(supportCores.value, 2)
  } catch (err) {
    console.error('Failed to fetch upgrade cores', err)
  } finally {
    loading.value = false
    startTimer()
  }
}

function handleCardReroll(index: number) {
  if (rerolledSlots.value[index] || rerollingIndex.value !== null || loading.value) return

  rerolledSlots.value[index] = true
  rerollingIndex.value = index

  if (selectedCore.value?.id === randomCores.value[index].id) {
    selectedCore.value = null
  }

  setTimeout(() => {
    const currentIds = randomCores.value.map(c => c.id)
    let availableCores = supportCores.value.filter(c => !currentIds.includes(c.id))

    if (availableCores.length < 1) {
      availableCores = [...supportCores.value]
    }

    const newCore = getRandomCores(availableCores, 1)[0]
    randomCores.value.splice(index, 1, newCore)
  }, 300)

  setTimeout(() => {
    rerollingIndex.value = null
  }, 600)
}

function startTimer() {
  timer = setInterval(() => {
    if (timeLeft.value <= 1) {
      timeLeft.value = 0
      stopTimer()
      autoSelect()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function autoSelect() {
  if (selectedCore.value) {
    emit('selected', selectedCore.value.id)
  } else if (randomCores.value.length > 0) {
    emit('selected', randomCores.value[0].id)
  }
}

function selectCore(core: any) {
  if (loading.value) return
  selectedCore.value = core
  loading.value = true
  stopTimer()
  
  setTimeout(() => {
    emit('selected', core.id)
  }, 500)
}

onMounted(() => {
  fetchUpgradeCores()
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

.reroll-anim {
  animation: flip-shuffle 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flip-shuffle {
  0% { transform: perspective(1000px) rotateY(0deg) scale(1); opacity: 1; filter: blur(0px); }
  50% { transform: perspective(1000px) rotateY(90deg) scale(0.8); opacity: 0; filter: blur(4px); }
  100% { transform: perspective(1000px) rotateY(0deg) scale(1); opacity: 1; filter: blur(0px); }
}

.tech-border { position: relative; }
.tech-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(60deg, rgba(255,255,255,0.1) 0%, #3b82f6 30%, rgba(255,165,0,0.8) 50%, #3b82f6 70%, rgba(255,255,255,0.1) 100%);
  background-size: 300% 300%;
  animation: sweepGlow 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}
.tech-border:hover::after { animation: sweepGlow 1.5s linear infinite; padding: 3px; }

@keyframes sweepGlow {
  0% { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}
</style>