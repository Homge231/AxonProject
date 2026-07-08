<template>
  <div>
    <!-- Persistent Pandora Mode Indicator -->
    <div v-if="isPandoraMode" class="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
      <div
        class="px-5 py-2 rounded-full bg-purple-900/60 border border-purple-500/50 backdrop-blur-md text-xs font-bold text-purple-200 uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2">
        <span class="animate-pulse">Pandora's Box:</span>
        <span class="text-white drop-shadow-md text-sm">{{ activeCoreName }}</span>
      </div>
    </div>

    <!-- Flashy Announcement -->
    <transition name="fade">
      <div v-if="shiftAnnouncement" class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <h2
          class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-widest drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] uppercase animate-pulse text-center leading-tight">
          PANDORA SHIFTS TO<br>
          <span class="text-white text-5xl md:text-6xl drop-shadow-[0_0_25px_rgba(255,255,255,1)] block mt-2">{{
            shiftAnnouncement }}</span>
        </h2>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  isPandoraMode: boolean
  activeCoreName: string | null
  shiftAnnouncement: string
}>()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
