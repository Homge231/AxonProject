<template>
  <div>
    <!-- Persistent Pandora Mode Indicator -->
    <div v-if="isPandoraMode" class="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
      <div
        class="px-5 py-2 rounded-full bg-purple-900/60 border border-purple-500/50 backdrop-blur-md text-xs font-bold text-purple-200 uppercase tracking-widest flex items-center gap-2"
        :class="{ 'shadow-[0_0_15px_rgba(168,85,247,0.4)]': settingsStore.vfxEnabled }">
        <span :class="{ 'animate-pulse': settingsStore.vfxEnabled }">Pandora's Box:</span>
        <span class="text-white text-sm" :class="{ 'drop-shadow-md': settingsStore.vfxEnabled }">{{ activeCoreName }}</span>
      </div>
    </div>

    <!-- Flashy Announcement -->
    <transition name="fade">
      <div v-if="shiftAnnouncement" class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <h2
          class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-widest uppercase text-center leading-tight"
          :class="{ 'drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] animate-pulse': settingsStore.vfxEnabled }">
          PANDORA SHIFTS TO<br>
          <span class="text-white text-5xl md:text-6xl block mt-2"
                :class="{ 'drop-shadow-[0_0_25px_rgba(255,255,255,1)]': settingsStore.vfxEnabled }">{{
            shiftAnnouncement }}</span>
        </h2>
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
