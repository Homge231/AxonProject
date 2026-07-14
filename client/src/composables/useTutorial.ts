/**
 * useTutorial.ts
 * ─────────────────────────────────────────────────────────────────
 * Central composable for the full game tutorial (11 steps).
 * State is persisted in localStorage so it only shows once.
 * Call `resetTutorial()` from Profile to let the player replay it.
 *
 * SCREEN MAP:
 *  core-select  → steps 0, 1, 2
 *  gameplay     → steps 3, 4, 5, 6, 7
 *  upgrade      → steps 8, 9
 *  match-end    → step 10
 */
import { ref, computed } from 'vue'

const STORAGE_KEY = 'naenra_tutorial_step'
const DONE_KEY = 'naenra_tutorial_done'

export interface TutorialStep {
  screen: 'core-select' | 'gameplay' | 'upgrade' | 'match-end'
  targetId: string
  icon: string
  title: string
  message: string
  keyHints?: string[]
  placement?: 'top' | 'bottom' | 'center'
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // ── Core Selection ──────────────────────────────────────────────
  {
    screen: 'core-select',
    targetId: 'tutorial-core-legend',
    icon: '⚔️',
    title: '2 Types of Cores',
    message:
      '⚔️ Power Cores amplify your score with multipliers, combo bonuses, and speed rewards. ' +
      '🔮 Effect Cores grant special mechanics — Shields, Letter Hints, and side Missions. ' +
      'Hover any card to see full stats!',
    placement: 'bottom',
  },
  {
    screen: 'core-select',
    targetId: 'tutorial-core-cards',
    icon: '🎴',
    title: 'Pick Your Core',
    message:
      'Click a card to select it. You have 15 seconds — if the timer runs out, a Core is picked randomly for you! ' +
      'Each slot has one free Reroll if you want a different option.',
    placement: 'top',
  },
  {
    screen: 'core-select',
    targetId: 'tutorial-reroll',
    icon: '🔄',
    title: 'Reroll Button',
    message:
      'Click the Reroll button below each card to swap it for a different Core. ' +
      'You can only Reroll each slot once — choose wisely!',
    placement: 'top',
  },
  // ── Gameplay ────────────────────────────────────────────────────
  {
    screen: 'gameplay',
    targetId: 'tutorial-typing-area',
    icon: '⌨️',
    title: 'Type the Answer',
    message:
      'Read the sentence above — it has a blank (---). ' +
      'Type the missing word letter by letter into the slots below. ' +
      'No mouse clicks needed!',
    placement: 'top',
  },
  {
    screen: 'gameplay',
    targetId: 'tutorial-typing-area',
    icon: '✅',
    title: 'Auto-Submit',
    message:
      'Once you fill the final letter slot, the game automatically submits your answer. ' +
      'Correct → slots glow green and you earn points. ' +
      'Wrong → slots flash red and points are deducted.',
    placement: 'top',
  },
  {
    screen: 'gameplay',
    targetId: 'tutorial-typing-area',
    icon: '⏭️',
    title: 'Skip a Question',
    message:
      'Don\'t know the word? Press Enter to skip to the next question immediately. ' +
      'Skipping deducts points and breaks your combo, but saves precious seconds!',
    keyHints: ['⏎ Enter = Skip'],
    placement: 'top',
  },
  {
    screen: 'gameplay',
    targetId: 'tutorial-score-area',
    icon: '📈',
    title: 'Dynamic Base Points',
    message:
      'Longer and more difficult words reward significantly MORE base points (up to 200 points)! ' +
      'Think twice before skipping those long words — they are your ticket to victory!',
    placement: 'bottom',
  },
  {
    screen: 'gameplay',
    targetId: 'tutorial-score-area',
    icon: '📊',
    title: 'Your Score',
    message:
      'Your score goes up on correct answers and drops on mistakes or skips. ' +
      'The more accurate and fast you are, the higher your score — and your ELO ranking!',
    placement: 'bottom',
  },
  {
    screen: 'gameplay',
    targetId: 'tutorial-round-indicator',
    icon: '🔁',
    title: 'Round System',
    message:
      'Each match has 3 Rounds of 60 seconds each. After Round 1 and Round 2, ' +
      'you\'ll get a Tactical Upgrade screen where you can power up your Core!',
    placement: 'bottom',
  },
  // ── Core Upgrade ────────────────────────────────────────────────
  {
    screen: 'upgrade',
    targetId: 'tutorial-upgrade-cards',
    icon: '⬆️',
    title: 'Tactical Upgrade!',
    message:
      'These are Tier 2 (or Tier 3) Cores chosen specifically based on the Core you used last round. ' +
      'They are strictly stronger — higher multipliers, better flat buffs, and expanded mechanics!',
    placement: 'top',
  },
  {
    screen: 'upgrade',
    targetId: 'tutorial-upgrade-cards',
    icon: '🔀',
    title: 'Hybrid Cores',
    message:
      'One of these options may be a Hybrid Core — it combines the mechanics of two different Core families. ' +
      'For example, "Combo Shield" gives you both Streak Bonuses AND a Shield to protect your combo!',
    placement: 'top',
  },
  // ── Match End ───────────────────────────────────────────────────
  {
    screen: 'match-end',
    targetId: 'tutorial-match-result',
    icon: '🏆',
    title: 'Match Complete!',
    message:
      'This is your match summary. Your final score affects your ELO ranking. ' +
      'Review your answer history below to see where you lost points — and get better next time! ' +
      'Good luck on the leaderboard! 🎉',
    placement: 'top',
  },
]

// ── Shared reactive state (module-level singleton) ─────────────────────────
const _currentStep = ref<number>(
  parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
)
const _isActive = ref<boolean>(
  !localStorage.getItem(DONE_KEY)
)

export function useTutorial() {
  const currentStep = _currentStep
  const isActive = _isActive

  const currentStepData = computed<TutorialStep | null>(() => {
    if (!isActive.value) return null
    return TUTORIAL_STEPS[currentStep.value] ?? null
  })

  /** Only show steps that belong to the current screen */
  function isCurrentScreen(screen: TutorialStep['screen']): boolean {
    return isActive.value && currentStepData.value?.screen === screen
  }

  function next() {
    const next = currentStep.value + 1
    if (next >= TUTORIAL_STEPS.length) {
      complete()
    } else {
      currentStep.value = next
      localStorage.setItem(STORAGE_KEY, String(next))
    }
  }

  function complete() {
    isActive.value = false
    localStorage.setItem(DONE_KEY, '1')
    localStorage.removeItem(STORAGE_KEY)
  }

  /** Called from Profile — lets player replay the tutorial */
  function resetTutorial() {
    currentStep.value = 0
    isActive.value = true
    localStorage.removeItem(DONE_KEY)
    localStorage.setItem(STORAGE_KEY, '0')
  }

  const totalSteps = TUTORIAL_STEPS.length
  const currentStepNumber = computed(() => currentStep.value + 1)

  return {
    isActive,
    currentStep,
    currentStepData,
    currentStepNumber,
    totalSteps,
    isCurrentScreen,
    next,
    complete,
    resetTutorial,
  }
}
