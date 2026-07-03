<template>
  <div class="h-screen w-full overflow-hidden relative font-sans flex flex-col text-white select-none">

    <PhaserBackground :image-url="currentBgImage" />
    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <button @click="$router.push('/home')"
      class="absolute top-8 left-8 text-white/50 hover:text-white transition-colors z-20 font-bold tracking-widest uppercase">
      &larr; Back
    </button>

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
    <main class="relative z-10 flex-1 flex flex-col items-center justify-center px-6 max-w-4xl mx-auto w-full">
      <h2
        class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Support
      </h2>
      <p class="text-lightBlue/80 mb-12 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select a Support Core for this match
      </p>
      <div v-if="loading && randomCores.length === 0" class="flex justify-center py-16">
        <svg class="animate-spin w-10 h-10 text-lightBlue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c..."></path>
        </svg>
      </div>

      <div v-else-if="errorMsg" class="text-hexred font-bold py-8">
        {{ errorMsg }}
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-4 md:px-0 items-stretch"
        :class="{ 'pointer-events-none': loading }">

        <div v-for="(core, index) in randomCores" :key="index" class="flex flex-col items-center gap-6 w-full h-full">

          <div @click="submitCore(core)"
            class="tech-border group flex-1 w-full relative backdrop-blur-xl rounded-2xl p-8 md:p-12 cursor-pointer transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            :class="[
              selectedCore?.id === core.id
                ? 'bg-white/10 border-2 border-lightBlue shadow-[0_0_40px_rgba(59,130,246,0.5)] -translate-y-4 scale-105'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-2',
              rerollingIndex === index ? 'reroll-anim pointer-events-none' : '',
              loading && selectedCore?.id !== core.id ? 'opacity-40 grayscale' : '' // Dims the unselected card when submitting
            ]">

            <div
              class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
            </div>
            <div
              class="relative w-24 h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-8 transition-all duration-500 border shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
              :class="selectedCore?.id === core.id ? 'border-lightBlue text-lightBlue shadow-[0_0_20px_rgba(59,130,246,0.6)] from-blue/30 to-lightBlue/20' : 'border-white/10 text-gray-400 group-hover:border-lightBlue group-hover:text-lightBlue group-hover:from-blue/20 group-hover:to-lightBlue/10 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'">
              <svg class="w-12 h-12 transition-colors duration-500 drop-shadow-md" fill="none" stroke="currentColor"
                viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" :d="core.icon" />
              </svg>
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
              :class="{ 'animate-spin': rerollingIndex === index }" fill="none" stroke="currentColor"
              viewBox="0 0 24 24">
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

// ── Reroll State (Independent per card) ─────────────────────────────────────
const rerolledSlots = ref([false, false])
const rerollingIndex = ref<number | null>(null)

// ── Timer State ─────────────────────────────────────────────────────────────
const SELECTION_DURATION = 15
const timeLeft = ref(SELECTION_DURATION)
let selectionTimer: ReturnType<typeof setInterval> | null = null
// ── Individual Reroll Logic ─────────────────────────────────────────────────
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
// ── Triggers & Handlers ─────────────────────────────────────────────────────
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

  // Fallback: If no core is selected, pick a random one
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
    console.error('Error creating Session:', err)
  }
}

async function submitCore(core: CoreOption) {
  if (loading.value) return

  // Instantly highlight the selected card for visual feedback
  selectedCore.value = core
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

/* CSS Flip/Shuffle Animation applied to single card */
.reroll-anim {
  animation: flip-shuffle 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes flip-shuffle {
  0% {
    transform: perspective(1000px) rotateY(0deg) scale(1);
    opacity: 1;
    filter: blur(0px);
  }

  50% {
    transform: perspective(1000px) rotateY(90deg) scale(0.8);
    opacity: 0;
    filter: blur(4px);
  }

  100% {
    transform: perspective(1000px) rotateY(0deg) scale(1);
    opacity: 1;
    filter: blur(0px);
  }
}

/* ── Animated Tech Border ────────────────────────────────────────────────── */
.tech-border {
  position: relative;
}

.tech-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  /* Matches your tailwind rounded-2xl */
  padding: 2px;
  /* This is the thickness of the animated line */

  /* The glowing colors (Blue and a hint of Orange) */
  background: linear-gradient(60deg,
      rgba(255, 255, 255, 0.1) 0%,
      #3b82f6 30%,
      /* Light Blue */
      rgba(255, 165, 0, 0.8) 50%,
      /* Orange flare */
      #3b82f6 70%,
      rgba(255, 255, 255, 0.1) 100%);
  background-size: 300% 300%;
  animation: sweepGlow 4s linear infinite;

  /* Masking magic: Keeps the inside clear so your backdrop-blur still works */
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}

/* Speed up the animation when the user hovers over the card */
.tech-border:hover::after {
  animation: sweepGlow 1.5s linear infinite;
  padding: 3px;
}

@keyframes sweepGlow {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 100% 50%;
  }
}
</style>