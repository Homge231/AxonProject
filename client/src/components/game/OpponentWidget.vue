<template>
  <transition name="widget-fade">
    <div 
      v-if="visible"
      ref="widgetRef"
      class="absolute top-24 right-6 md:right-10 z-30 flex flex-col items-end gap-2"
      @mouseenter="isCorePopupOpen = true"
      @mouseleave="isCorePopupOpen = false"
    >
      <!-- Main Opponent Floating HUD Bar (Click/Tap Wrapper) -->
      <div 
        class="flex items-center gap-4 bg-darkNavy/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 cursor-pointer select-none"
        @click="toggleCorePopup"
      >
        <!-- Opponent Profile Info -->
        <div class="flex items-center gap-3">
          <div class="relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 bg-black/40">
            <img v-if="avatar" :src="avatar" :alt="name" class="w-full h-full object-cover" />
            <span v-else class="text-white font-black text-xl flex items-center justify-center h-full">?</span>
          </div>
          <div class="flex flex-col">
            <span class="text-[9px] font-bold text-orange tracking-[0.2em] uppercase flex items-center gap-1">
              Opponent
              <span v-if="coreDetails" class="text-[8px] text-lightBlue">✦ Core</span>
            </span>
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

        <!-- Chevron / Indicator Icon for Pop-up -->
        <div v-if="coreDetails" class="ml-1 text-xs text-gray-400 transition-transform duration-200" :class="{ 'rotate-180 text-orange': isCorePopupOpen }">
          ▼
        </div>
      </div>

      <!-- Pop-up Container for Selection Core Icon(s) -->
      <transition name="fade">
        <div
          v-if="isCorePopupOpen && activeCoresList.length > 0"
          class="bg-darkNavy/90 backdrop-blur-xl border border-white/20 p-3 rounded-xl shadow-2xl flex flex-col gap-2 z-40"
          style="position: relative; overflow: visible;"
        >
          <span class="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Active Cores:</span>

          <div class="flex items-center gap-3">
            <div
              v-for="(cDetails, cIdx) in activeCoresList"
              :key="cDetails.id || cIdx"
              class="flex flex-col items-center group cursor-pointer"
              style="position: relative;"
              @mouseenter="hoveredCoreIdx = cIdx"
              @mouseleave="hoveredCoreIdx = null"
              @touchstart.passive="startHold(cIdx)"
              @touchend="hideTooltip"
              @touchcancel="hideTooltip"
            >
              <span 
                class="text-[8px] font-bold uppercase tracking-wider mb-1"
                :class="cIdx === 0 ? 'text-emerald-400' : 'text-blue-400'"
              >
                {{ cIdx === 0 ? 'MAIN' : `UPGRADE ${cIdx}` }}
              </span>

              <img
                :src="cDetails.icon || getCoreIconPath(cDetails.name) || coreIcon || '/icons/cores/default.svg'"
                :alt="cDetails.name"
                @error="($event.target as HTMLImageElement).src = '/icons/cores/default.svg'"
                class="w-10 h-10 object-contain cursor-pointer drop-shadow-md transition-transform group-hover:scale-110 active:scale-95 bg-white/5 p-1 rounded-lg border"
                :class="cIdx === 0 ? 'border-emerald-500/40' : 'border-blue-500/40'"
                @dragstart.prevent
                @contextmenu.prevent="() => false"
              />

              <!-- Tooltip anchored to the RIGHT edge so it grows toward screen center -->
              <transition name="fade">
                <div
                  v-if="hoveredCoreIdx === cIdx"
                  class="core-tooltip-anchor"
                >
                  <CoreTooltip
                    :core="cDetails"
                    position="bottom"
                  />
                </div>
              </transition>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import CoreTooltip from './CoreTooltip.vue'
import { getCoreIconPath } from '../../game/cores/icons'

interface CoreItem {
  id: string
  name: string
  description: string
  icon?: string
  flat_buff?: number
  multiplier_buff?: number
  tier?: number
  core_type?: string
  classification?: string
}

const props = defineProps<{
  visible: boolean
  name: string
  avatar: string
  score: number
  coreIcon?: string
  coreDetails?: CoreItem | null
  coresHistory?: CoreItem[]
}>()

const isScoreChanging = ref(false)
const isCorePopupOpen = ref(false)
const hoveredCoreIdx = ref<number | null>(null)
const widgetRef = ref<HTMLElement | null>(null)
let holdTimer: ReturnType<typeof setTimeout> | null = null
const HOLD_DELAY_MS = 500

const activeCoresList = computed(() => {
  if (props.coresHistory && props.coresHistory.length > 0) {
    return props.coresHistory
  }
  if (props.coreDetails) {
    return [props.coreDetails]
  }
  return []
})

function toggleCorePopup() {
  if (activeCoresList.value.length === 0) return
  isCorePopupOpen.value = !isCorePopupOpen.value
}

function handleClickOutside(event: MouseEvent) {
  if (widgetRef.value && !widgetRef.value.contains(event.target as Node)) {
    isCorePopupOpen.value = false
    hoveredCoreIdx.value = null
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})

watch(() => props.score, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    isScoreChanging.value = true
    setTimeout(() => {
      isScoreChanging.value = false
    }, 300)
  }
})

function startHold(index: number) {
  if (holdTimer) clearTimeout(holdTimer)
  holdTimer = setTimeout(() => {
    hoveredCoreIdx.value = index
  }, HOLD_DELAY_MS)
}

function hideTooltip() {
  if (holdTimer) {
    clearTimeout(holdTimer)
    holdTimer = null
  }
  hoveredCoreIdx.value = null
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

/*
 * Anchor the CoreTooltip to the RIGHT edge of its icon cell.
 * CoreTooltip itself is `absolute left-1/2 -translate-x-1/2 w-80`.
 * We override the centering by setting `right: 0; left: auto; transform: none`
 * so the 320px card grows leftward (toward the game board center),
 * staying fully within the viewport instead of bleeding off-screen.
 */
.core-tooltip-anchor {
  position: absolute;
  top: 100%;
  right: 0;
  left: auto;
  margin-top: 0.75rem;
  z-index: 200;
  width: 0;              /* collapse own footprint; child is absolutely sized */
  overflow: visible;
}

/* Override CoreTooltip's built-in centering when inside the anchor */
.core-tooltip-anchor :deep(.absolute) {
  left: auto !important;
  right: 0 !important;
  transform: none !important;
}
</style>
