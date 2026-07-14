import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { audioService } from '../services/audioService'

export const useSettingsStore = defineStore('settings', () => {
  const isSettingsOpen = ref(false)
  
  // Default values
  const volumeLevel = ref(50)
  const vfxEnabled = ref(true)

  // Load from localStorage
  const storedVolume = localStorage.getItem('arena_volume')
  if (storedVolume !== null) {
    volumeLevel.value = parseInt(storedVolume, 10)
  }

  const storedVfx = localStorage.getItem('arena_vfx')
  if (storedVfx !== null) {
    vfxEnabled.value = storedVfx === 'true'
  }

  // Persist and apply changes
  watch(volumeLevel, (newVal) => {
    localStorage.setItem('arena_volume', String(newVal))
    // Trigger a silent unlock trick if volume > 0 and wasn't playing, though slider slide is an interaction.
    // We let audioService handle the volume dynamically when playing.
  })

  watch(vfxEnabled, (newVal) => {
    localStorage.setItem('arena_vfx', String(newVal))
  })

  return {
    isSettingsOpen,
    volumeLevel,
    vfxEnabled
  }
})
