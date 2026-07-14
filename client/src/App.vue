<template>
  <div class="app-wrapper relative">
    <RouterView />
    <ErrorNotification />
    
    <!-- Global Settings Modal -->
    <GlobalSettingsOverlay />

    <!-- Floating Global Settings Button -->
    <button 
      @click="settingsStore.isSettingsOpen = true"
      class="fixed bottom-6 right-6 z-[9990] w-12 h-12 bg-black/50 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-black/70 hover:scale-110 transition-all shadow-lg focus:outline-none"
      title="Global Settings"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorNotification from './components/ErrorNotification.vue'
import GlobalSettingsOverlay from './components/GlobalSettingsOverlay.vue'
import { useSettingsStore } from './stores/settingsStore'

const settingsStore = useSettingsStore()
</script>

<style scoped>
</style>