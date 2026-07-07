import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MatchPhase = 'selection' | 'playing' | 'recap' | 'match_over'

export const useMatchStore = defineStore('match', () => {
  const currentRound = ref(1)
  const maxRounds = ref(3)
  const matchPhase = ref<MatchPhase>('selection')

  function incrementRound() {
    if (currentRound.value < maxRounds.value) {
      currentRound.value++
    } else {
      matchPhase.value = 'match_over'
    }
  }

  function resetMatch() {
    currentRound.value = 1
    matchPhase.value = 'selection'
  }

  function isFinalRound() {
    return currentRound.value === maxRounds.value
  }

  return {
    currentRound,
    maxRounds,
    matchPhase,
    incrementRound,
    resetMatch,
    isFinalRound
  }
})
