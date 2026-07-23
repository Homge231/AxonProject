import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const playerName    = ref<string>('')
  const gameState     = ref<string>('home')
  const activeCoreId  = ref<string | null>(null)
  const activeCoreName = ref<string | null>(null)
  const coreHistory    = ref<{ id: string, name: string, icon: string }[]>([])
  const sessionId      = ref<string | null>(null)

  return {
    playerName,
    gameState,
    activeCoreId, activeCoreName, coreHistory, sessionId
  }
})