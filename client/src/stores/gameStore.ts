import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGameStore = defineStore('game', () => {
  const roomCode      = ref<string>('')
  const playerName    = ref<string>('')
  const players       = ref<any[]>([])
  const gameState     = ref<string>('lobby')
  const myScore       = ref<number>(0)
  const opponentScore = ref<number>(0)
  const kp            = ref<number>(0)

  return {
    roomCode, playerName, players,
    gameState, myScore, opponentScore, kp
  }
})