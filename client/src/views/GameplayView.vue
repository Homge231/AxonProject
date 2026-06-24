<template>
  <div class="h-screen w-full overflow-hidden relative font-sans flex flex-col select-none text-white"
    @click="refocusInput">
    <PhaserBackground :image-url="currentBgImage" />

    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <header
      class="relative z-30 flex justify-between items-center px-8 lg:px-12 py-5 bg-darkNavy/30 backdrop-blur-md border-b border-white/10 shadow-lg">
      <div class="relative" ref="menuRef">
        <button @click.stop="menuOpen = !menuOpen"
          class="flex items-center gap-3 focus:outline-none hover:opacity-80 transition-opacity">
          <svg class="w-8 h-8 text-orange fill-current" viewBox="0 0 24 24">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
          <span
            class="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase drop-shadow-md">
            NAENRA
          </span>
          <svg class="w-4 h-4 text-gray-300 transition-transform duration-200" :class="menuOpen ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <transition name="dropdown">
          <div v-if="menuOpen"
            class="absolute top-full left-0 mt-3 w-56 bg-darkNavy/90 backdrop-blur-xl border border-white/10 shadow-2xl z-50 rounded-b-lg overflow-hidden">
            <div class="px-5 py-3 border-b border-white/10 bg-black/20">
              <p class="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Match in progress</p>
              <p class="text-sm text-gray-200 font-mono mt-1">Score: <span class="text-white font-bold">{{ score
              }}</span></p>
            </div>
            <button @click.stop="goHome"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-left">
              <svg class="w-4 h-4 text-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Back to Home
            </button>
            <button @click.stop="confirmQuit = true; menuOpen = false"
              class="w-full flex items-center gap-3 px-5 py-3.5 text-sm text-hexred hover:bg-hexred/10 transition-colors text-left">
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Quit Match
            </button>
          </div>
        </transition>
      </div>

      <div class="flex items-center gap-8">
        <div
          class="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2 rounded-lg shadow-inner">
          <span class="text-xs font-bold text-lightBlue tracking-[0.2em] uppercase">Q</span>
          <span class="text-xl font-black text-white">{{ questionsAnswered }}</span>
        </div>

        <div class="flex items-center gap-2" :class="timeLeft <= 10 ? 'text-hexred' : 'text-lightOrange'">
          <svg class="w-5 h-5 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-mono font-black text-3xl tabular-nums drop-shadow-lg"
            :class="timeLeft <= 10 ? 'animate-pulse' : ''">{{ String(timeLeft).padStart(2, '0') }}</span>
        </div>

        <div class="text-right hidden md:block">
          <p class="text-[10px] text-gray-400 uppercase tracking-widest drop-shadow-sm">Score</p>
          <p class="font-black text-xl text-white drop-shadow-md inline-block transition-colors duration-200"
            :class="{ 'score-pop text-orange': isScoreAnimating }">
            {{ score }}
          </p>
        </div>
      </div>
    </header>

    <main
      class="relative z-20 flex-1 flex flex-col items-center justify-center px-6 lg:px-16 py-10 max-w-5xl mx-auto w-full">

      <section class="w-full max-w-4xl">
        <div
          class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-14 shadow-2xl transition-all duration-300"
          :class="gameState === 'loading' ? 'animate-pulse' : ''">
          <div v-if="gameState === 'loading'" class="space-y-8 w-full text-center">
            <div class="h-12 bg-white/20 rounded w-1/3 mx-auto mb-6"></div>
            <div class="h-8 bg-white/20 rounded w-3/4 mx-auto"></div>
          </div>

          <div v-else class="flex flex-col items-center text-center w-full">
            <div v-if="currentQuestion.hint" class="mb-8 w-full max-w-full">
              <h1 
                class="text-xl md:text-2xl font-bold text-blue tracking-wider drop-shadow-sm whitespace-nowrap overflow-hidden text-ellipsis px-2">
                {{ currentQuestion.hint }}
              </h1>
            </div>

            <p class="text-xl md:text-3xl font-medium text-white leading-relaxed max-w-3xl">

              <span v-if="currentQuestion.question_text.split(/_+/)[0]">
                {{ currentQuestion.question_text.split(/_+/)[0] }}
              </span>

              <span class="inline-flex items-baseline mx-1">
                <span v-for="(char, idx) in currentQuestion.target_word.split('')" :key="idx"
                  class="inline-block text-center transition-colors duration-150 min-w-[1ch]" :class="{
                    'text-orange animate-pulse': idx === typedLetters.length && gameState === 'playing',
                    'text-white font-bold': typedLetters[idx] !== undefined && gameState === 'playing',
                    'text-success font-bold': gameState === 'correct',
                    'text-hexred font-bold': gameState === 'wrong',
                    'text-white/60': typedLetters[idx] === undefined && idx !== typedLetters.length
                  }">
                  {{ typedLetters[idx] ?? '_' }}
                </span>
              </span>

              <span v-if="currentQuestion.question_text.split(/_+/)[1]">
                {{ currentQuestion.question_text.split(/_+/)[1] }}
              </span>
            </p>

            <transition name="fade">
              <div v-if="gameState === 'correct' || gameState === 'wrong'"
                class="flex items-center gap-3 px-8 py-3.5 border font-bold text-sm tracking-widest uppercase rounded-full shadow-2xl mt-10 mx-auto w-fit backdrop-blur-lg"
                :class="{
                  'border-success/50 bg-success/20 text-green-300': gameState === 'correct',
                  'border-hexred/50 bg-hexred/20 text-red-300': gameState === 'wrong',
                }">
                <span v-if="gameState === 'correct'">✓ Brilliant! +{{ pointsEarned }} pts</span>
                <span v-else>✕ Correct word: <span class="uppercase text-white ml-1 font-black">{{
                  currentQuestion.target_word }}</span></span>
              </div>
            </transition>

          </div>

        </div>
      </section>

    </main>
    <div class="relative z-20 h-2 w-full flex bg-black/50">
      <div class="h-full transition-all duration-1000 ease-linear rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]"
        :class="timeLeft <= 10 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-orange to-lightOrange'"
        :style="{ width: `${(timeLeft / MATCH_DURATION) * 100}%` }"></div>
    </div>

    <transition name="timeout-overlay">
      <div v-if="gameState === 'timeout'" class="absolute inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-darkNavy/80 backdrop-blur-xl"></div>
        <div
          class="relative border border-hexred/50 bg-darkNavy/90 p-12 max-w-lg w-full mx-4 text-center timeout-panel rounded-2xl shadow-[0_0_50px_rgba(230,57,70,0.2)]">
          <p class="text-xs font-bold text-hexred tracking-[0.4em] uppercase mb-4 drop-shadow-md">Match Ended</p>
          <h2
            class="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(230,57,70,0.8)] mb-2 timeout-glitch">
            TIME OUT
          </h2>
          <div class="w-20 h-1 bg-gradient-to-r from-transparent via-hexred to-transparent mx-auto mb-10 mt-6"></div>

          <div class="flex justify-center gap-12 mb-10 bg-black/30 py-6 rounded-xl border border-white/5">
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Final Score</p>
              <p class="text-5xl font-black text-orange drop-shadow-md">{{ score }}</p>
            </div>
            <div class="w-px bg-white/10"></div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-2">Questions</p>
              <p class="text-5xl font-black text-lightBlue drop-shadow-md">{{ questionsAnswered }}</p>
            </div>
          </div>

          <p v-if="savingSession" class="text-xs text-gray-400 uppercase tracking-widest mb-8 animate-pulse">
            <span class="inline-block w-2 h-2 bg-lightBlue rounded-full mr-2"></span>
            Syncing results...
          </p>

          <div class="flex gap-4 justify-center">
            <button @click="router.push('/home')"
              class="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors rounded-lg">Lobby</button>
            <button @click="restartMatch"
              class="flex-1 group relative px-6 py-4 bg-gradient-to-r from-orange to-hexred overflow-hidden font-black text-sm tracking-widest uppercase rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(230,57,70,0.5)] transition-shadow">
              <div
                class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              </div>
              <span class="relative z-10 text-white">Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="overlay">
      <div v-if="confirmQuit"
        class="absolute inset-0 z-50 flex items-center justify-center bg-darkNavy/90 backdrop-blur-md">
        <div
          class="relative border border-white/10 bg-darkNavy/95 p-10 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center">
          <div class="w-16 h-16 bg-hexred/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-8 h-8 text-hexred" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p class="text-xl text-white font-black uppercase mb-2">Abandon Match?</p>
          <p class="text-gray-400 text-sm mb-8 leading-relaxed">Your current progress and score of <span
              class="text-orange font-bold">{{ score }} pts</span> will be completely lost.</p>
          <div class="flex gap-3">
            <button @click="confirmQuit = false; refocusInput()"
              class="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-xs tracking-widest uppercase transition-colors rounded-lg">Resume</button>
            <button @click="goHome"
              class="flex-1 px-4 py-3 bg-hexred hover:bg-red-600 text-white font-bold text-xs tracking-widest uppercase transition-colors rounded-lg shadow-lg">Quit</button>
          </div>
        </div>
      </div>
    </transition>

    <input ref="inputRef" class="sr-only" type="text" autocomplete="off" autocorrect="off" autocapitalize="off"
      spellcheck="false" :disabled="gameState === 'timeout'" @keydown="handleKeydown" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import PhaserBackground from '../components/game/PhaserBackground.vue'

const router = useRouter()

interface QuestionPayload {
  hint: string
  question_text: string
  target_word: string
}

type GameState = 'loading' | 'playing' | 'correct' | 'wrong' | 'timeout'

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const MATCH_DURATION = 45
const FEEDBACK_MS = 1000

const gameState = ref<GameState>('loading')
const timeLeft = ref(MATCH_DURATION)
const score = ref(0)
const isScoreAnimating = ref(false)
const questionsAnswered = ref(0)
const pointsEarned = ref(0)
const typedLetters = ref<string[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const confirmQuit = ref(false)
const savingSession = ref(false)
const sessionId = ref<string | null>(null)

const currentQuestion = ref<QuestionPayload>({
  hint: '',
  question_text: '',
  target_word: ''
})
let matchTimer: ReturnType<typeof setInterval> | null = null

// Ảnh cố định cho Tuần này
const currentBgImage = ref('/bg-daily-life.png')

function startMatchTimer() {
  if (matchTimer) return
  matchTimer = setInterval(() => {
    if (timeLeft.value <= 1) {
      timeLeft.value = 0
      clearInterval(matchTimer!)
      matchTimer = null
      triggerTimeout()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function stopMatchTimer() {
  if (matchTimer) { clearInterval(matchTimer); matchTimer = null }
}

async function createSession() {
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) return
    const data = await res.json()
    sessionId.value = data.session_id
  } catch (err) {
    console.error(err)
  }
}

async function callTimeoutEndpoint() {
  if (!sessionId.value) return
  savingSession.value = true
  try {
    const token = localStorage.getItem('arena_token')
    await fetch(`${SERVER_URL}/api/game/timeout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        session_id: sessionId.value,
        score: score.value,
        questions_answered: questionsAnswered.value,
      })
    })
  } catch (err) {
    console.error(err)
  } finally {
    savingSession.value = false
  }
}

async function fetchQuestion(): Promise<QuestionPayload> {
  const token = localStorage.getItem('arena_token')
  const res = await fetch(`${SERVER_URL}/api/game/question`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  })
  if (!res.ok) throw new Error('Failed to fetch question')
  return await res.json()
}

async function loadQuestion() {
  gameState.value = 'loading'
  typedLetters.value = []
  try {
    currentQuestion.value = await fetchQuestion()
    gameState.value = 'playing'
    await nextTick()
    inputRef.value?.focus()
  } catch (err) {
    console.error('Failed to load question:', err)
    // Stop the timer and show a safe state
    stopMatchTimer()
    gameState.value = 'loading'
  }
}
function handleKeydown(e: KeyboardEvent) {
  if (gameState.value === 'timeout') return
  if (gameState.value !== 'playing') return
  if (menuOpen.value || confirmQuit.value) return

  if (e.key === 'Backspace') {
    typedLetters.value = typedLetters.value.slice(0, -1)
    return
  }
  if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return

  const maxLen = currentQuestion.value.target_word.length
  if (typedLetters.value.length >= maxLen) return

  typedLetters.value = [...typedLetters.value, e.key.toLowerCase()]
  if (typedLetters.value.length === maxLen) checkAnswer()
}

function checkAnswer() {
  const typed = typedLetters.value.join('')
  questionsAnswered.value++

  if (typed === currentQuestion.value.target_word) {
    pointsEarned.value = 100 + Math.floor(timeLeft.value * 3)
    score.value += pointsEarned.value
    gameState.value = 'correct'

    isScoreAnimating.value = true
    setTimeout(() => {
      isScoreAnimating.value = false
    }, 300)
  } else {
    gameState.value = 'wrong'
  }

  setTimeout(() => {
    if (gameState.value !== 'timeout') loadQuestion()
  }, FEEDBACK_MS)
}

function triggerTimeout() {
  gameState.value = 'timeout'
  inputRef.value?.blur()
  callTimeoutEndpoint()
}

async function restartMatch() {
  score.value = 0
  questionsAnswered.value = 0
  timeLeft.value = MATCH_DURATION
  stopMatchTimer()
  await createSession()
  await loadQuestion()
  startMatchTimer()
}

function goHome() {
  stopMatchTimer()
  router.push('/home')
}

function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

function refocusInput() {
  if (gameState.value === 'timeout') return
  if (!menuOpen.value && !confirmQuit.value) inputRef.value?.focus()
}

onMounted(async () => {
  await createSession()
  await loadQuestion()
  startMatchTimer()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  stopMatchTimer()
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}

.text-shadow {
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.slot--active {
  transform: translateY(-4px);
}

.slot--correct {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.slot--wrong {
  animation: shake 0.4s ease;
}

@keyframes pop {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.15);
  }

  100% {
    transform: scale(1);
  }
}

@keyframes shake {

  0%,
  100% {
    transform: translateX(0);
  }

  25% {
    transform: translateX(-6px);
  }

  75% {
    transform: translateX(6px);
  }
}

.timeout-glitch {
  animation: glitch 0.8s ease forwards;
}

@keyframes glitch {
  0% {
    clip-path: inset(0 0 100% 0);
    opacity: 0;
    transform: skewX(-10deg) scale(1.1);
    color: #fff;
  }

  30% {
    clip-path: inset(0 0 0% 0);
    opacity: 1;
    transform: skewX(5deg);
    color: #E63946;
  }

  60% {
    transform: skewX(-2deg);
    color: #fff;
  }

  100% {
    transform: skewX(0);
    color: #E63946;
  }
}

.timeout-panel {
  animation: panelå-in 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
}

@keyframes panel-in {
  from {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }

  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.timeout-overlay-enter-active,
.timeout-overlay-leave-active {
  transition: opacity 0.3s backdrop-filter 0.3s;
}

.timeout-overlay-enter-from,
.timeout-overlay-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.score-pop {
  animation: scoreScale 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scoreScale {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.6);
    text-shadow: 0 0 15px rgba(255, 165, 0, 0.8);
  }

  100% {
    transform: scale(1);
  }
}
</style>