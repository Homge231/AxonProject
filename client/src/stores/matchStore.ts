import { defineStore } from 'pinia'
import { ref } from 'vue'

export type MatchPhase = 'selection' | 'playing' | 'recap' | 'match_over'

export const useMatchStore = defineStore('match', () => {
  const currentRound = ref(1)
  const maxRounds = ref(3)
  const matchPhase = ref<MatchPhase>('selection')
  const topics = ref<string[]>(['daily-life', 'cafe', 'travel'])

  function shuffleTopics() {
    const array = [...topics.value]
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]
    }
    topics.value = array
  }

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
    shuffleTopics()
  }

  function isFinalRound() {
    return currentRound.value === maxRounds.value
  }

  return {
    currentRound,
    maxRounds,
    matchPhase,
    topics,
    incrementRound,
    resetMatch,
    shuffleTopics,
    isFinalRound
  }
})
