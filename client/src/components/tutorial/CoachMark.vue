<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

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

let retryCount = 0
let retryTimer: ReturnType<typeof setTimeout> | null = null

const calculatePosition = () => {
  const el = document.getElementById(props.targetId)
  if (el) {
    targetRect.value = el.getBoundingClientRect()
    isVisible.value = true
    retryCount = 0
  } else {
    isVisible.value = false
    if (retryCount < 20) {
      retryCount++
      retryTimer = setTimeout(calculatePosition, 250)
    }
  }
}

onMounted(() => {
  // Add a slight delay to ensure DOM is fully rendered
  setTimeout(calculatePosition, 300)
  window.addEventListener('resize', calculatePosition)
  window.addEventListener('scroll', calculatePosition, true)
})

onUnmounted(() => {
  if (retryTimer) clearTimeout(retryTimer)
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
        :style="{
          top: placement === 'bottom' ? `${targetRect.bottom + 25}px` : (placement === 'top' ? 'auto' : `${targetRect.top + targetRect.height/2}px`),
          bottom: placement === 'top' ? `${window.innerHeight - targetRect.top + 25}px` : 'auto',
          left: (placement === 'bottom' || placement === 'top' || placement === 'center') ? `${targetRect.left + (targetRect.width / 2)}px` : 'auto',
          transform: (placement === 'bottom' || placement === 'top' || placement === 'center') ? 'translateX(-50%)' : 'none'
        }"
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
