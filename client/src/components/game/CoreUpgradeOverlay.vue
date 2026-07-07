<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div v-if="loading" class="text-white text-2xl font-bold animate-pulse">
      Summoning Synergies...
    </div>
    
    <div v-else-if="errorMsg" class="text-hexred text-xl font-bold bg-hexred/10 p-6 rounded-2xl border border-hexred/30 text-center">
      {{ errorMsg }}
    </div>

    <div v-else class="w-full max-w-6xl flex flex-col items-center justify-center">
      
      <div class="mb-12 text-center">
        <h1 class="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange to-yellow drop-shadow-[0_0_15px_rgba(255,165,0,0.5)] mb-3">
          CHOOSE YOUR UPGRADE
        </h1>
        <div class="flex items-center justify-center gap-3">
          <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-white/50"></div>
          <p class="text-gray-400 font-mono text-sm md:text-base tracking-widest uppercase">
            {{ timeLeft }} SECONDS REMAINING
          </p>
          <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-white/50"></div>
        </div>
      </div>

      <div class="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative px-4">
        
        <div v-for="core in randomCores" :key="core.id" 
             class="group relative"
             @click="submitCore(core)">
             
          <!-- Tier Border Effect -->
          <div class="absolute -inset-1 rounded-[2rem] blur-md transition-all duration-300"
               :class="{
                 'bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 opacity-60 group-hover:opacity-100': (matchStore.currentRound + 1) === 2,
                 'bg-gradient-to-br from-purple-400 via-pink-400 to-yellow-400 opacity-60 group-hover:opacity-100': (matchStore.currentRound + 1) === 3
               }">
          </div>

          <div class="relative h-full flex flex-col items-center text-center p-8 md:p-10 rounded-3xl cursor-pointer transition-all duration-300 transform group-hover:-translate-y-2 group-hover:scale-[1.02] bg-white/5 backdrop-blur-xl border-2"
               :class="{
                 'border-gray-300/50': (matchStore.currentRound + 1) === 2,
                 'border-purple-400/50': (matchStore.currentRound + 1) === 3
               }">
            
            <div class="text-5xl md:text-6xl mb-6 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform group-hover:scale-110 duration-300">
              {{ core.icon }}
            </div>
            
            <h2 class="text-2xl md:text-3xl font-black text-white tracking-widest uppercase mb-4 drop-shadow-md"
                :class="{
                  'text-gray-100': (matchStore.currentRound + 1) === 2,
                  'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400': (matchStore.currentRound + 1) === 3
                }">
              {{ core.name }}
            </h2>
            
            <p class="text-gray-300 text-sm md:text-base leading-relaxed max-w-sm">
              {{ core.description }}
            </p>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
import { useGameStore } from '../../stores/gameStore'
import { useMatchStore } from '../../stores/matchStore'

const emit = defineEmits<{ (e: 'selected', coreId: string): void }>()

const gameStore = useGameStore()
const matchStore = useMatchStore()

const DEFAULT_ICON = '🔮'
const ICON_MAP: Record<string, string> = {
  'balanced core': '⚖️',
  'harmony core': '☯️',
  'perfect harmony': '💠',
  'equilibrium': '⚖️',
  'yin yang': '☯️',
  'steady pace': '🚶',
  'zenith core': '🏔️',
  'nirvana': '🧘',
  'cosmic balance': '🪐',
  'combo core': '🔥',
  'radiant combo': '☄️',
  'prismatic combo': '💥',
  'combo shield': '🧱',
  'combo time': '⏱️',
  'combo multiplier': '📈',
  'golden combo': '🏆',
  'chain lightning': '⚡',
  'combo mastery': '🎓',
  'oracle core': '👁️',
  'clairvoyance': '🔭',
  'omniscience': '🌟',
  'third eye': '🧿',
  'future sight': '🔮',
  'divine guidance': '👼',
  'mind reader': '🧠',
  'predictive strike': '⚔️',
  'cosmic wisdom': '🌌',
  'speedster': '⚡',
  'time warp': '⏳',
  'chronobreak': '🛑',
  'speed shield': '🛡️',
  'mach speed': '🚀',
  'overdrive': '⚙️',
  'time freeze': '❄️',
  'warp speed': '🌌',
  'grand prix': '🏎️',
  'mission core': '🎯',
  'bounty hunter': '💰',
  'exodia': '👑',
  'daily quest': '📜',
  'shield mission': '🛡️',
  'time mission': '⏳',
  'bounty overlord': '💰',
  'apex predator': '🦁',
  'mission specialist': '🕵️',
  'power core': '💪',
  'overclock core': '🔋',
  'supernova core': '🌋',
  'hypercharge': '⚡',
  'power surge': '💥',
  'brute force': '🔨',
  'gigawatt core': '🔌',
  'desperado': '🤠',
  'absolute power': '👑',
  'aegis shield': '🛡️',
  'reflective aegis': '🪞',
  'bastion of light': '🏰',
  'shield battery': '🔋',
  'fortress aegis': '🏰',
  'shield synergy': '⛓️',
  'spiked shield': '🔱',
  'indomitable': '✊',
  'aegis nova': '💥',
  "pandora's box": '🎲',
  "trickster's glass": '🃏',
  "chaos theory": '🌀',
  'chaos prism': '💎',
  'warp reality': '🕳️',
  "pandora's curse": '☠️',
  'butterfly effect': '🦋',
  "pandora's wrath": '👺',
  'cosmic entropy': '🌪️',
  'combo focus': '🎯',
  'super combo': '💥',
  'speed demon': '😈',
  'sonic boom': '💥',
  'oracle blessing': '😇',
  'divine eye': '👁️',
  'swift mission': '🏃',
  'mission master': '🏆',
  'shield burst': '💥',
  'guardian angel': '👼',
  'harmony wave': '🌊',
  'universal harmony': '🌌',
  'overload': '⚡',
  'supermassive core': '🕳️',
  "pandora's mirror": '🪞',
  'reality collapse': '🌌'
}

type CoreOption = { id: string; name: string; description: string; icon: string; flat_buff: number; multiplier_buff: number }

const randomCores = ref<CoreOption[]>([])
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
  if (randomCores.value.length > 0) {
    // Default to the synergy upgrade (index 0) if time runs out
    submitCore(randomCores.value[0])
  }
}

async function fetchSupportCores() {
  loading.value = true
  errorMsg.value = ''
  try {
    const token = localStorage.getItem('arena_token')
    const prevCoreId = gameStore.activeCoreId
    const targetRound = matchStore.currentRound + 1
    
    // Pass previous_core_id to the backend to get the synergy tree
    const url = new URL(`${SERVER_URL}/api/game/cores`)
    if (prevCoreId) url.searchParams.append('previous_core_id', prevCoreId)
    url.searchParams.append('round', targetRound.toString())

    const res = await fetch(url.toString(), {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
    })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()

    randomCores.value = (data.cores ?? []).map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      flat_buff: c.flat_buff,
      multiplier_buff: c.multiplier_buff,
      icon: ICON_MAP[c.name?.toLowerCase()] || DEFAULT_ICON
    }))

    loading.value = false
    startTimer()
  } catch (err) {
    console.error('fetchSupportCores error:', err)
    errorMsg.value = 'Failed to load Upgrades.'
    loading.value = false
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

async function submitCore(core: CoreOption) {
  if (loading.value) return
  loading.value = true
  stopTimer()

  // Wait, if Chaos Theory, we need to handle secondary core.
  // Actually, Chaos Theory doesn't require a secondary selection, it's just the core itself that triggers it backend.
  // But wait! Chaos Theory is a Tier 3 Pandora core. R3 has no R4 upgrade, so we don't need to select further.
  gameStore.activeCoreId = core.id
  gameStore.activeCoreName = core.name

  await updateSessionCore(core.id)
  emit('selected', core.id)
}

onMounted(() => {
  fetchSupportCores()
})

onUnmounted(() => {
  stopTimer()
})
</script>
