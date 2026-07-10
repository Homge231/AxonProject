<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps<{
  targetId: string
  message: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
  title?: string
  icon?: string
  step?: number
  totalSteps?: number
  keyHints?: string[]
}>()

const emit = defineEmits<{
  (e: 'next'): void
  (e: 'skip'): void
}>()

const targetRect = ref<DOMRect | null>(null)
const isVisible = ref(false)

let checkInterval: ReturnType<typeof setInterval> | null = null

const calculatePosition = () => {
  const el = document.getElementById(props.targetId)
  if (el) {
    const rect = el.getBoundingClientRect()
    if (rect.width > 0 && rect.height > 0) {
      targetRect.value = rect
      isVisible.value = true
      return
    }
  }
  
  isVisible.value = false
}

const popoverStyle = computed(() => {
  if (!targetRect.value) return {}
  const rect = targetRect.value
  
  let top = 'auto'
  let bottom = 'auto'
  let left = 'auto'
  let transform = 'none'

  const p = props.placement || 'bottom'

  if (p === 'bottom') {
    top = `${rect.bottom + 25}px`
  } else if (p === 'top') {
    bottom = `${window.innerHeight - rect.top + 25}px`
  } else {
    top = `${rect.top + rect.height / 2}px`
  }

  if (p === 'bottom' || p === 'top' || p === 'center') {
    const rawLeft = rect.left + (rect.width / 2)
    const popoverWidth = window.innerWidth < 500 ? window.innerWidth * 0.9 : 450
    const halfWidth = popoverWidth / 2
    
    let popoverLeftEdge = rawLeft - halfWidth
    const minLeft = 20
    const maxLeft = window.innerWidth - popoverWidth - 20
    
    if (popoverLeftEdge < minLeft) popoverLeftEdge = minLeft
    if (popoverLeftEdge > maxLeft) popoverLeftEdge = maxLeft
    
    left = `${popoverLeftEdge}px`
    transform = 'none'
  }

  return { top, bottom, left, transform }
})

onMounted(() => {
  calculatePosition()
  checkInterval = setInterval(calculatePosition, 500)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
})

onUnmounted(() => {
  if (checkInterval) clearInterval(checkInterval)
  window.removeEventListener('resize', calculatePosition)
  window.removeEventListener('scroll', calculatePosition, true)
})

watch(() => props.targetId, () => {
  setTimeout(calculatePosition, 300)
})
</script>

<template>
  <Teleport to="body">
    <div v-if="isVisible && targetRect" class="fixed inset-0 z-[100] pointer-events-auto">
      
      <!-- Backdrop Overlay -->
      <div 
        class="absolute inset-0 bg-black/70 backdrop-blur-sm transition-all duration-300"
        :style="`clip-path: polygon(
          0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%,
          ${targetRect.left - 10}px ${targetRect.top - 10}px,
          ${targetRect.left - 10}px ${targetRect.bottom + 10}px,
          ${targetRect.right + 10}px ${targetRect.bottom + 10}px,
          ${targetRect.right + 10}px ${targetRect.top - 10}px,
          ${targetRect.left - 10}px ${targetRect.top - 10}px
        )`"
      ></div>

      <!-- Highlighted Element Border (Optional) -->
      <div 
        class="absolute border-2 border-white/50 rounded-lg pointer-events-none transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
        :style="{
          top: `${targetRect.top - 10}px`,
          left: `${targetRect.left - 10}px`,
          width: `${targetRect.width + 20}px`,
          height: `${targetRect.height + 20}px`
        }"
      ></div>

      <!-- Popover Box -->
      <div 
        class="absolute flex flex-col gap-4 bg-gray-900 border border-white/20 p-5 rounded-xl shadow-2xl w-[450px] max-w-[90vw] z-[101]"
        :style="popoverStyle"
      >
        <!-- Header: Step counter and Skip button -->
        <div class="flex items-center justify-between border-b border-white/10 pb-2">
          <div class="flex items-center gap-2">
            <span v-if="props.icon" class="text-xl">{{ props.icon }}</span>
            <span v-if="props.step && props.totalSteps" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-white/10 px-2 py-0.5 rounded-full">
              Step {{ props.step }}/{{ props.totalSteps }}
            </span>
          </div>
          <button 
            @click="emit('skip')"
            class="text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-widest transition-colors"
          >
            Skip Tutorial
          </button>
        </div>

        <!-- Content -->
        <div>
          <h3 v-if="props.title" class="text-white text-lg font-black tracking-wide mb-2">
            {{ props.title }}
          </h3>
          <p class="text-gray-300 text-sm font-medium leading-relaxed">
            {{ message }}
          </p>
        </div>

        <!-- Key Hints -->
        <div v-if="props.keyHints && props.keyHints.length > 0" class="flex gap-2 mt-1">
          <span v-for="hint in props.keyHints" :key="hint" class="bg-black border border-white/20 text-gray-300 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded shadow-inner">
            {{ hint }}
          </span>
        </div>

        <!-- Footer / Next Button -->
        <div class="flex items-center justify-between mt-1">
          <!-- Progress Dots (Optional visual flair) -->
          <div v-if="props.totalSteps" class="flex gap-1">
            <div v-for="i in props.totalSteps" :key="i" class="w-1.5 h-1.5 rounded-full"
                 :class="i === props.step ? 'bg-lightBlue' : i < (props.step || 0) ? 'bg-white/40' : 'bg-white/10'">
            </div>
          </div>
          <div v-else></div> <!-- spacer -->

          <button 
            @click="emit('next')"
            class="bg-white text-black font-black text-xs uppercase tracking-wider px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors shadow-lg"
          >
            Got It! &rarr;
          </button>
        </div>
      </div>

    </div>
  </Teleport>
</template>
