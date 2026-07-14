<template>
  <transition name="fade">
    <div v-if="settingsStore.isSettingsOpen" class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div 
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="settingsStore.isSettingsOpen = false"
      ></div>

      <!-- Modal Content -->
      <div class="relative w-full max-w-md bg-darkNavy/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden">
        
        <!-- Header -->
        <div class="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
          <h2 class="text-xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred">
            Global Settings
          </h2>
          <button 
            @click="settingsStore.isSettingsOpen = false"
            class="text-gray-400 hover:text-white transition-colors focus:outline-none"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="space-y-8">
          
          <!-- Volume Control -->
          <div>
            <div class="flex justify-between items-center mb-3">
              <label class="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-5 h-5 text-lightBlue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M11 5L6 9H2v6h4l5 4V5z"></path>
                </svg>
                Master Volume
              </label>
              <span class="text-xs font-mono text-lightBlue">{{ settingsStore.volumeLevel }}%</span>
            </div>
            
            <div class="relative flex items-center group">
              <input 
                type="range" 
                min="0" 
                max="100" 
                v-model="settingsStore.volumeLevel"
                class="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer outline-none border border-white/10 accent-lightBlue"
                :style="`background: linear-gradient(to right, #0ea5e9 ${settingsStore.volumeLevel}%, rgba(0,0,0,0.5) ${settingsStore.volumeLevel}%)`"
              />
            </div>
            <p class="text-[10px] text-gray-500 mt-2">Adjusts the volume of in-game sound effects.</p>
          </div>

          <!-- VFX Toggle -->
          <div>
            <div class="flex justify-between items-center">
              <label class="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                <svg class="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                VFX Enhancements
              </label>
              
              <!-- Custom Toggle Switch -->
              <button 
                @click="settingsStore.vfxEnabled = !settingsStore.vfxEnabled"
                class="relative inline-flex items-center h-6 w-11 rounded-full transition-colors focus:outline-none"
                :class="settingsStore.vfxEnabled ? 'bg-success' : 'bg-gray-600'"
              >
                <span 
                  class="inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ease-in-out"
                  :class="settingsStore.vfxEnabled ? 'translate-x-6' : 'translate-x-1'"
                />
              </button>
            </div>
            <p class="text-[10px] text-gray-500 mt-2">Disable to reduce visual clutter and improve performance. Turns off intense glowing borders, shakes, and background animations.</p>
          </div>
          
        </div>
        
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../stores/settingsStore'

const settingsStore = useSettingsStore()
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
  box-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
  transition: transform 0.1s;
}

input[type=range]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}
</style>
