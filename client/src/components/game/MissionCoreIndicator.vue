<template>
  <!-- Mission Tracker UI -->
  <div class="flex flex-col items-start gap-2 bg-darkNavy/40 backdrop-blur-md border border-lightBlue/30 px-5 py-3 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.2)]">
    <div class="flex items-center justify-between w-full">
      <span class="text-[10px] font-bold text-lightBlue/80 tracking-[0.2em] uppercase">Mission Progress</span>
      <span class="text-xs font-black text-white tabular-nums">{{ missionProgress }}/5</span>
    </div>
    <div class="flex items-center gap-1.5">
      <svg v-for="i in 5" :key="i" class="w-6 h-6 transition-all duration-300"
        :class="i <= missionProgress ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)] scale-110' : 'text-gray-600'"
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    </div>
  </div>

  <!-- Massive Celebratory Animation for Mission Core -->
  <Teleport to="body">
    <transition name="mission-celebration">
      <div v-if="showCelebration" class="fixed inset-0 z-[100] flex flex-col items-center justify-center pointer-events-none">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
        <div class="relative z-10 flex flex-col items-center">
          <h1 class="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 to-yellow-500 drop-shadow-[0_0_40px_rgba(250,204,21,0.8)] tracking-widest uppercase mb-4 scale-up-center">
            Mission Accomplished!
          </h1>
          <p class="text-3xl font-bold text-white drop-shadow-md">+500 PTS</p>
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  missionProgress: number
  showCelebration: boolean
}>()
</script>

<style scoped>
.mission-celebration-enter-active,
.mission-celebration-leave-active {
  transition: opacity 0.5s ease;
}

.mission-celebration-enter-from,
.mission-celebration-leave-to {
  opacity: 0;
}

.scale-up-center {
  animation: scale-up-center 0.6s cubic-bezier(0.390, 0.575, 0.565, 1.000) both;
}

@keyframes scale-up-center {
  0% { transform: scale(0.5); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}
</style>
