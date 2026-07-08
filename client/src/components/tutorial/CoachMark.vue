<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'

const props = defineProps<{
  targetId: string
  message: string
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center'
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
    left = `${rect.left + (rect.width / 2)}px`
    transform = 'translateX(-50%)'
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
        class="absolute flex flex-col gap-3 bg-gray-900 border border-white/20 p-5 rounded-xl shadow-2xl max-w-sm z-[101]"
        :style="popoverStyle"
      >
        <p class="text-white text-sm font-medium leading-relaxed">
          {{ message }}
        </p>

        <div class="flex items-center gap-3 mt-2">
          <button 
            @click="emit('next')"
            class="flex-1 bg-white text-black font-bold text-xs uppercase tracking-wider py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Got It!
          </button>
          <button 
            @click="emit('skip')"
            class="px-4 py-2 text-white/50 hover:text-white font-medium text-xs uppercase tracking-wider transition-colors"
          >
            Skip Tutorial
          </button>
        </div>
      </div>

    </div>
  </Teleport>
</template>
