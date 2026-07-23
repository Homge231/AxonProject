<template>
  <transition name="widget-fade">
    <div 
      v-if="visible"
      class="absolute top-24 right-6 md:right-10 z-30 flex items-center gap-4 bg-darkNavy/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105"
    >
      <!-- Opponent Profile Info -->
      <div class="flex items-center gap-3">
        <div class="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-black/40">
          <img v-if="avatar" :src="avatar" :alt="name" class="w-full h-full object-cover" />
          <span v-else class="text-white font-black text-xl flex items-center justify-center h-full">?</span>
        </div>
        <div class="flex flex-col">
          <span class="text-[9px] font-bold text-orange tracking-[0.2em] uppercase">Opponent</span>
          <span class="text-sm font-black text-white tracking-wide truncate max-w-[120px]">{{ name }}</span>
        </div>
      </div>
      
      <!-- Score Divider -->
      <div class="w-[1px] h-10 bg-white/10"></div>
      
      <!-- Opponent Score -->
      <div class="flex flex-col items-center min-w-[60px]">
        <span class="text-[9px] font-bold text-lightBlue tracking-[0.2em] uppercase">Score</span>
        <span 
          class="text-2xl font-black text-white tabular-nums drop-shadow-[0_0_10px_rgba(255,255,255,0.2)] transition-all duration-200"
          :class="{ 'score-pop': isScoreChanging }"
        >
          {{ score }}
        </span>
      </div>

      <!-- Opponent Active Core Icon -->
      <template v-if="coreDetails">
        <div class="w-[1px] h-10 bg-white/10"></div>

        <div class="relative flex items-center justify-center">
          <img
            :src="coreIcon"
            :alt="coreDetails.name"
            class="w-10 h-10 object-contain cursor-pointer drop-shadow-md transition-transform hover:scale-110 active:scale-95 bg-white/5 p-1 rounded-lg border border-white/10"
            @mouseenter="showTooltip = true"
            @mouseleave="hideTooltip"
            @touchstart.passive="startHold"
            @touchend="hideTooltip"
            @touchcancel="hideTooltip"
            @dragstart.prevent
            @contextmenu.prevent="() => false"
          />

          <transition name="fade">
            <CoreTooltip
              v-if="showTooltip"
              :core="coreDetails"
              class="!absolute !top-full !bottom-auto !right-0 !left-auto !-translate-x-0 !mt-3 !mb-0"
            />
          </transition>
        </div>
      </template>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import CoreTooltip from './CoreTooltip.vue'

const props = defineProps<{
  visible: boolean
  name: string
  avatar: string
  score: number
  coreIcon?: string
  coreDetails?: {
    id: string
    name: string
    description: string
    flat_buff?: number
    multiplier_buff?: number
    tier?: number
    core_type?: string
    classification?: string
  } | null
}>()

const isScoreChanging = ref(false)
const showTooltip = ref(false)
let holdTimer: ReturnType<typeof setTimeout> | null = null
const HOLD_DELAY_MS = 500

watch(() => props.score, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    isScoreChanging.value = true
    setTimeout(() => {
      isScoreChanging.value = false
    }, 300)
  }
})

function startHold() {
  if (holdTimer) clearTimeout(holdTimer)
  holdTimer = setTimeout(() => {
    showTooltip.value = true
  }, HOLD_DELAY_MS)
}

function hideTooltip() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  showTooltip.value = false
}
</script>

<style scoped>
.widget-fade-enter-active,
.widget-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.widget-fade-enter-from,
.widget-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.score-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  color: #38bdf8; /* Cyan glow on score change */
  text-shadow: 0 0 15px rgba(56, 189, 248, 0.8);
}

@keyframes pop {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
