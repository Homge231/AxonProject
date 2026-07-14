<template>
  <div>
    <!-- Persistent Pandora Mode Indicator (Đã làm dịu màu lại thành Indigo Pastel cho hợp vibe) -->
    <div v-if="isPandoraMode" class="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
      <div
        class="px-5 py-2 rounded-full bg-indigo-950/40 border border-indigo-300/20 backdrop-blur-md text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2"
        :class="{ 'shadow-[0_0_15px_rgba(199,210,254,0.15)]': settingsStore.vfxEnabled }">
        <span :class="{ 'animate-pulse': settingsStore.vfxEnabled }">Pandora's Box:</span>
        <span class="text-white text-sm" :class="{ 'drop-shadow-sm': settingsStore.vfxEnabled }">{{ activeCoreName }}</span>
      </div>
    </div>

    <!-- Pastel & Elegant Announcement -->
    <transition name="smooth-fade">
      <div v-if="shiftAnnouncement" class="fixed inset-0 z-[110] flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px]">
        
        <div class="flex flex-col items-center text-center floating-soft">
          <!-- Chữ Pandora Shifts To: Chuyển sang font nhỏ, thoáng, màu tím pastel dịu -->
          <p class="text-sm md:text-base font-medium tracking-[0.4em] text-purple-300/80 uppercase mb-2">
            Pandora Shifts To
          </p>
          
          <!-- Tên Core: Dùng gradient pastel (Hồng phấn -> Tím nhạt -> Xanh lơ) -->
          <h2 class="text-4xl md:text-6xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200"
              :class="{ 'drop-shadow-[0_0_20px_rgba(216,180,254,0.3)]': settingsStore.vfxEnabled }">
            {{ shiftAnnouncement }}
          </h2>
        </div>
        
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../../stores/settingsStore'

const settingsStore = useSettingsStore()

defineProps<{
  isPandoraMode: boolean
  activeCoreName: string | null
  shiftAnnouncement: string
}>()
</script>

<style scoped>
/* Hiệu ứng mờ dần cực kỳ êm ái khi xuất hiện/biến mất */
.smooth-fade-enter-active,
.smooth-fade-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}

.smooth-fade-enter-from,
.smooth-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Hiệu ứng trôi lơ lửng rất chậm và nhẹ */
.floating-soft {
  animation: floatSoftly 3s ease-in-out infinite;
}

@keyframes floatSoftly {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>