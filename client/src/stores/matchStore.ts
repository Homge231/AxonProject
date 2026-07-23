import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useMatchStore = defineStore('match', () => {
  const currentRound = ref(1)
  const maxRounds = ref(3)
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
    }
  }

  function resetMatch() {
    currentRound.value = 1
    shuffleTopics()
  }

  function isFinalRound() {
    return currentRound.value === maxRounds.value
  }

  return {
    currentRound,
    maxRounds,
    topics,
    incrementRound,
    resetMatch,
    shuffleTopics,
    isFinalRound
  }
})
