import { ref, onUnmounted } from 'vue'

export interface PointPopup {
  id: number
  value: number
  type: 'correct' | 'wrong' | 'typo' | 'speedster' | 'shield_blocked' | 'prismatic' | 'custom'
  x: number
  y: number
  message?: string
}

export type ScoreFlash = 'correct' | 'wrong' | 'typo' | 'prismatic' | 'forgive' | null

export function useScoreAnimation(letterSlotsRef: any) {
  const score = ref(0)
  const pointsEarned = ref(0)
  const pointsDeducted = ref(0)
  const scoreFlash = ref<ScoreFlash>(null)
  const pointPopups = ref<PointPopup[]>([])
  
  let popupIdCounter = 0
  let activeAnimationId: number | null = null
  let flashTimer: ReturnType<typeof setTimeout> | null = null
  const activePopupTimers = new Set<ReturnType<typeof setTimeout>>()

  function triggerScoreFlash(type: ScoreFlash) {
    if (flashTimer) clearTimeout(flashTimer)
    scoreFlash.value = type
    flashTimer = setTimeout(() => { scoreFlash.value = null }, 400)
  }

  function spawnPointPopup(value: number, type: PointPopup['type'], message?: string) {
    let x = window.innerWidth / 2 - 50
    let y = window.innerHeight / 2 - 60
    if (letterSlotsRef.value) {
      const rect = letterSlotsRef.value.getBoundingClientRect()
      x = rect.left + rect.width / 2 - 50
      y = rect.top - 10
    }

    const id = popupIdCounter++
    pointPopups.value.push({ id, value, type, x, y, message })
    const duration = type === 'speedster' || type === 'prismatic' ? 1800 : 1200
    
    const timer = setTimeout(() => {
      pointPopups.value = pointPopups.value.filter(p => p.id !== id)
      activePopupTimers.delete(timer)
    }, duration)
    activePopupTimers.add(timer)
  }

  function updateScoreAnimated(newTotalScore: number) {
    if (activeAnimationId !== null) {
      cancelAnimationFrame(activeAnimationId)
      activeAnimationId = null
    }

    const startScore = score.value
    const targetScore = newTotalScore
    const duration = 500
    const startTime = performance.now()

    function animateScore(currentTime: number) {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      score.value = Math.floor(startScore + (targetScore - startScore) * progress)
      if (progress < 1) {
        activeAnimationId = requestAnimationFrame(animateScore)
      } else {
        activeAnimationId = null
      }
    }
    activeAnimationId = requestAnimationFrame(animateScore)
  }

  function clearActiveAnimation() {
    if (activeAnimationId !== null) {
      cancelAnimationFrame(activeAnimationId)
      activeAnimationId = null
    }
  }

  onUnmounted(() => {
    if (flashTimer) clearTimeout(flashTimer)
    for (const timer of activePopupTimers) {
      clearTimeout(timer)
    }
    activePopupTimers.clear()
    clearActiveAnimation()
  })

  return {
    score,
    pointsEarned,
    pointsDeducted,
    scoreFlash,
    pointPopups,
    triggerScoreFlash,
    spawnPointPopup,
    updateScoreAnimated,
    clearActiveAnimation
  }
}
