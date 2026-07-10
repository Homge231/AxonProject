<template>
  <div class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm text-white select-none">
    
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

    <main class="relative z-10 flex flex-col items-center justify-center px-4 md:px-6 max-w-4xl mx-auto w-full">
      <h2
        class="text-4xl md:text-5xl font-black text-white mb-3 drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] tracking-widest text-center uppercase">
        Tactical Upgrade
      </h2>
      <p class="text-lightBlue/80 mb-12 text-sm md:text-base tracking-[0.2em] uppercase text-center font-bold">
        Select a Support Core for Round {{ matchStore.currentRound + 1 }}
      </p>

      <div v-if="loading && upgradeCores.length === 0" class="flex justify-center py-16">
        <svg class="animate-spin w-10 h-10 text-lightBlue" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c..."></path>
        </svg>
      </div>

      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 w-full items-stretch"
        :class="{ 'pointer-events-none': loading && upgradeCores.length > 0 }">
        
        <div v-for="(core, index) in upgradeCores" :key="core.id || index" class="flex flex-col items-center w-full h-full relative">
          
          <!-- Core detailed stats Tooltip -->
          <transition name="fade">
            <CoreTooltip v-if="activeTooltipIndex === index" :core="core" />
          </transition>

          <div @click="selectCore(core)"
            class="tech-border group flex-1 w-full relative backdrop-blur-xl rounded-2xl p-8 md:p-12 cursor-pointer transition-all duration-500 flex flex-col items-center text-center overflow-hidden"
            :class="[
              selectedCore?.id === core.id
                ? 'bg-white/10 border-2 border-lightBlue shadow-[0_0_40px_rgba(59,130,246,0.5)] -translate-y-4 scale-105'
                : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-lightBlue/50 shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-2',
              loading && selectedCore?.id !== core.id && upgradeCores.length > 0 ? 'opacity-40 grayscale' : ''
            ]"
            @mouseenter="showTooltip(index)"
            @mouseleave="hideTooltip"
            @touchstart="handleTouchStart(index, $event)"
            @touchend="handleTouchEnd(core, $event)"
          >
            
            <!-- Hover shimmer overlay -->
            <div class="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <!-- Icon circle -->
            <div class="relative w-20 h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center mb-6 lg:mb-8 transition-all duration-500 border shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)]"
              :class="selectedCore?.id === core.id ? 'border-lightBlue text-lightBlue shadow-[0_0_20px_rgba(59,130,246,0.6)] from-blue/30 to-lightBlue/20' : 'border-white/10 text-gray-400 group-hover:border-lightBlue group-hover:text-lightBlue group-hover:from-blue/20 group-hover:to-lightBlue/10 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]'">
              <img :src="core.icon" :alt="core.name" class="w-12 h-12 lg:w-16 lg:h-16 object-contain filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform group-hover:scale-110 duration-300" />
            </div>

            <h3 class="text-3xl font-black mb-4 tracking-wide transition-colors duration-500"
              :class="selectedCore?.id === core.id ? 'text-lightBlue' : 'text-white group-hover:text-lightBlue'">
              {{ core.name }}
            </h3>

            <p class="text-base text-gray-300/80 leading-relaxed max-w-[250px]">{{ core.description }}</p>
          </div>

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
import { useGameStore } from '../../stores/gameStore'
import { useMatchStore } from '../../stores/matchStore'
import { getCoreIconPath } from '../../game/cores/icons'
import CoreTooltip from './CoreTooltip.vue'

const emit = defineEmits<{ (e: 'selected', coreId: string): void }>()
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const gameStore = useGameStore()
const matchStore = useMatchStore()

// ── Hover & Touch-Hold Tooltip Logic ─────────────────────────────────────────
const activeTooltipIndex = ref<number | null>(null)
let touchTimeout: ReturnType<typeof setTimeout> | null = null
let isHolding = false

function showTooltip(index: number) {
  activeTooltipIndex.value = index
}

function hideTooltip() {
  activeTooltipIndex.value = null
}

function handleTouchStart(index: number, e: TouchEvent) {
  isHolding = false
  if (touchTimeout) clearTimeout(touchTimeout)
  touchTimeout = setTimeout(() => {
    isHolding = true
    showTooltip(index)
  }, 250)
}

function handleTouchEnd(core: any, e: TouchEvent) {
  if (touchTimeout) {
    clearTimeout(touchTimeout)
    touchTimeout = null
  }
  
  e.preventDefault()
  
  if (isHolding) {
    hideTooltip()
  } else {
    selectCore(core)
  }
}

// Icon mapping is now centralized in game/cores/icons.ts

// ── State ───────────────────────────────────────────────────────────────────
const DEFAULT_ICON = '🔮'
const ICON_MAP: Record<string, string> = {
  'balanced core': '⚖️', 'combo core': '🔥', 'oracle core': '👁️', 'speedster': '⚡',
  'mission core': '🎯', 'power core': '💪', 'aegis shield': '🛡️', "pandora's box": '🎲'
}

type CoreOption = { id: string; name: string; description: string; icon: string; flat_buff: number; multiplier_buff: number }

const upgradeCores = ref<CoreOption[]>([])
const selectedCore = ref<CoreOption | null>(null)
const loading = ref(true)

const SELECTION_DURATION = 15
const timeLeft = ref(SELECTION_DURATION)
let timer: ReturnType<typeof setInterval> | null = null

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
  if (timer) { clearInterval(timer); timer = null }
}

function autoSelect() {
  if (selectedCore.value) return // Wait for the timeout in selectCore to finish

  if (upgradeCores.value.length > 0) {
    const randomIndex = Math.floor(Math.random() * upgradeCores.value.length)
    selectCore(upgradeCores.value[randomIndex])
  } else {
    emit('selected', '')
  }
}

async function fetchUpgradeCores() {
  loading.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const prevCoreId = gameStore.activeCoreId
    const targetRound = matchStore.currentRound + 1

    const url = new URL(`${SERVER_URL}/api/game/cores`)
    if (prevCoreId) url.searchParams.append('previous_core_id', prevCoreId)
    url.searchParams.append('round', targetRound.toString())

    const res = await fetch(url.toString(), {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()

    upgradeCores.value = (data.cores ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      flat_buff: c.flat_buff,
      multiplier_buff: c.multiplier_buff,
      icon: ICON_MAP[c.name?.toLowerCase()] || DEFAULT_ICON
    })).slice(0, 2)
  } catch (err) {
    console.error('Failed to fetch upgrade cores', err)
  } finally {
    loading.value = false
    startTimer()
  }
}

async function updateSessionCore(coreId: string) {
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/session/core`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ session_id: gameStore.sessionId, new_core_id: coreId })
    })

    if (!res.ok) {
      console.error('Failed to update session core')
    }
  } catch (err) {
    console.error('Error updating Session core:', err)
  }
}

// ── Select a Core Upgrade ───────────────────────────────────────────────────
async function selectCore(core: CoreOption) {
  if (loading.value) return

  selectedCore.value = core
  loading.value = true
  stopTimer()

  // Update Pinia state
  gameStore.activeCoreId = core.id
  gameStore.activeCoreName = core.name
  gameStore.coreHistory.push({ id: core.id, name: core.name, icon: core.icon })

  // Notify backend
  await updateSessionCore(core.id)

  // Brief visual feedback before closing the overlay
  setTimeout(() => {
    emit('selected', core.id)
  }, 500)
}

onMounted(() => fetchUpgradeCores())
onUnmounted(() => stopTimer())
</script>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}

.tech-border {
  position: relative;
}

.tech-border::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 2px;
  background: linear-gradient(60deg,
      rgba(255, 255, 255, 0.1) 0%,
      #3b82f6 30%,
      rgba(255, 165, 0, 0.8) 50%,
      #3b82f6 70%,
      rgba(255, 255, 255, 0.1) 100%);
  background-size: 300% 300%;
  animation: sweepGlow 4s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  z-index: 10;
}

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