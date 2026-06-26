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
              <p class="text-sm text-gray-200 font-mono mt-1">Score: <span class="text-white font-bold">{{ score }}</span></p>
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
          <p class="font-black text-xl drop-shadow-md inline-block transition-colors duration-200"
            :class="{
              'score-pop-correct text-orange': scoreFlash === 'correct',
              'score-pop-wrong text-hexred': scoreFlash === 'wrong',
              'text-white': scoreFlash === null
            }">
            {{ score }}
          </p>
        </div>
      </div>
    </header>

    <main
      class="relative z-20 flex-1 flex flex-col items-center justify-center py-10 px-6 lg:px-16 max-w-5xl mx-auto w-full">

      <section class="w-full max-w-4xl flex flex-col gap-10" style="perspective: 1500px;">

        <div v-if="gameState === 'loading'" class="w-full flex flex-col gap-10">
          <div class="bg-blue/10 backdrop-blur-xl border border-blue/20 rounded-2xl p-6 h-28 animate-pulse"></div>
          <div class="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-14 h-44 animate-pulse"></div>
        </div>

        <template v-else>
          <transition name="card-flip" mode="out-in">
            <div :key="currentQuestion.target_word" class="w-full flex flex-col items-center gap-10">

              <div v-if="currentQuestion.hint"
                class="relative overflow-hidden bg-blue/10 backdrop-blur-xl border border-blue/30 rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(59,130,246,0.15)] text-center w-full transition-all duration-300 transform hover:-translate-y-1">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue to-transparent"></div>
                <div class="flex items-center justify-center gap-1.5 mb-3 opacity-90">
                  <svg class="w-4 h-4 text-lightBlue drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                  </svg>
                  <span class="text-[10px] font-bold text-lightBlue tracking-[0.25em] uppercase">Hint</span>
                </div>
                <h1
                  class="text-2xl md:text-4xl font-black text-lightBlue tracking-wider drop-shadow-lg leading-tight break-words px-2 py-1">
                  {{ currentQuestion.hint }}
                </h1>
              </div>

              <div
                class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center w-full transition-all duration-300">
                <p class="text-xl md:text-3xl font-medium text-gray-200 leading-relaxed max-w-3xl">
                  <span v-if="currentQuestion.question_text.split(/_+/)[0]">
                    {{ currentQuestion.question_text.split(/_+/)[0] }}
                  </span>
                  <span class="text-white/50 font-bold mx-2 tracking-widest">---</span>
                  <span v-if="currentQuestion.question_text.split(/_+/)[1]">
                    {{ currentQuestion.question_text.split(/_+/)[1] }}
                  </span>
                </p>
              </div>

              <div class="w-full flex flex-col items-center gap-3 overflow-hidden">
                <div
                  class="flex flex-nowrap items-center justify-center gap-2 md:gap-3 w-full overflow-x-auto pb-3 scrollbar-none">
                  <div v-for="(char, idx) in currentQuestion.target_word.split('')" :key="idx" class="flex-shrink-0">
                    <div
                      class="relative w-10 h-14 md:w-14 md:h-20 bg-black/40 backdrop-blur-md rounded-t-lg flex items-center justify-center border-b-4 transition-all duration-200"
                      :class="{
                        'slot--active border-orange bg-black/60 shadow-[0_-4px_15px_rgba(255,165,0,0.25)]': idx === typedLetters.length && gameState === 'playing',
                        'slot--correct border-success': gameState === 'correct',
                        'slot--wrong border-hexred': gameState === 'wrong',
                        'border-white/20': idx !== typedLetters.length || gameState !== 'playing'
                      }">
                      <span
                        class="text-2xl md:text-4xl font-black uppercase tracking-widest drop-shadow-md transition-all duration-100"
                        :class="{
                          'text-white': typedLetters[idx] !== undefined && gameState === 'playing',
                          'glow-sweep': gameState === 'correct',
                          'text-hexred drop-shadow-[0_0_10px_rgba(230,57,70,0.6)]': gameState === 'wrong',
                          'opacity-0': typedLetters[idx] === undefined,
                          'opacity-100': typedLetters[idx] !== undefined,
                        }" :style="gameState === 'correct' ? { animationDelay: `${idx * 0.05}s` } : {}">
                        {{ typedLetters[idx] ?? '_' }}
                      </span>
                      <span v-if="idx === typedLetters.length && gameState === 'playing'"
                        class="absolute bottom-2 left-1/2 -translate-x-1/2 w-5 h-1 bg-orange animate-pulse rounded-full"></span>
                    </div>
                  </div>
                </div>

                <div v-if="gameState === 'playing'"
                  class="text-xs md:text-sm font-semibold text-lightBlue/80 tracking-widest font-mono mt-1">
                  ({{ currentQuestion.target_word.length }} letters)
                </div>
              </div>

              <transition name="fade">
                <div v-if="gameState === 'correct' || gameState === 'wrong'"
                  class="relative z-10 flex items-center gap-3 px-8 py-3.5 border font-bold text-sm tracking-widest uppercase rounded-full shadow-2xl mx-auto w-fit backdrop-blur-lg"
                  :class="{
                    'border-success/50 bg-success/20 text-green-300': gameState === 'correct',
                    'border-hexred/50 bg-hexred/20 text-red-300': gameState === 'wrong',
                  }">
                  <span v-if="gameState === 'correct'">✓ Brilliant! +{{ pointsEarned }} pts</span>
                  <span v-else>
                    ✕ Correct word:
                    <span class="uppercase text-white ml-1 font-black">{{ currentQuestion.target_word }}</span>
                    <span class="ml-3 text-hexred font-black">−{{ pointsDeducted }} pts</span>
                  </span>
                </div>
              </transition>

            </div>
          </transition>
        </template>

      </section>
    </main>

    <div class="relative z-20 h-2 w-full flex bg-black/50">
      <div class="h-full transition-all duration-1000 ease-linear rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]"
        :class="timeLeft <= 10 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-orange to-lightOrange'"
        :style="{ width: `${(timeLeft / MATCH_DURATION) * 100}%` }"></div>
    </div>

    <Avatar :src="playerAvatarUrl" alt="Player Avatar" />

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
              class="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors rounded-lg">Home</button>
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
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import PhaserBackground from '../components/game/PhaserBackground.vue'
import Avatar from '../components/Avatar.vue'

const router = useRouter()
const authStore = useAuthStore()

interface QuestionPayload {
  id: string
  question_text: string
  target_word: string
  hint?: string
}

type GameState = 'loading' | 'playing' | 'correct' | 'wrong' | 'timeout'
type ScoreFlash = 'correct' | 'wrong' | null

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const MATCH_DURATION = 60
const FEEDBACK_MS = 1000
const REFETCH_THRESHOLD = 5
const BASE_POINTS = 100 // Sprint 3: nhân với core multiplier

const THEME_MAP: Record<string, string> = {
  'daily-life': '/bg-daily-life.png',
  'cafe': '/bg-cafe.png',
  'travel': '/bg-travel.png'
}

// ── State ────────────────────────────────────────────────────────────────────
const gameState = ref<GameState>('loading')
const timeLeft = ref(MATCH_DURATION)
const score = ref(0)
const scoreFlash = ref<ScoreFlash>(null)
const questionsAnswered = ref(0)
const pointsEarned = ref(0)
const pointsDeducted = ref(0)
const typedLetters = ref<string[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const confirmQuit = ref(false)
const savingSession = ref(false)
const sessionId = ref<string | null>(null)
const currentBgImage = ref('/bg-daily-life.png')

const playerAvatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authStore.profile?.username || 'Player')}`
)

// ── Question queue ────────────────────────────────────────────────────────────
const questionQueue = ref<QuestionPayload[]>([])
const isFetchingBatch = ref(false)
const currentQuestion = ref<QuestionPayload>({ id: '', question_text: '', target_word: '' })

let matchTimer: ReturnType<typeof setInterval> | null = null
let flashTimer: ReturnType<typeof setTimeout> | null = null

// ── Score flash helper ────────────────────────────────────────────────────────
function triggerScoreFlash(type: ScoreFlash) {
  if (flashTimer) clearTimeout(flashTimer)
  scoreFlash.value = type
  flashTimer = setTimeout(() => { scoreFlash.value = null }, 400)
}

// ── Timer ─────────────────────────────────────────────────────────────────────
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

function getBackgroundImage(themeKey: string) {
  return THEME_MAP[themeKey] || '/bg-daily-life.png'
}

// ── Session API ───────────────────────────────────────────────────────────────
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
    if (data.theme) currentBgImage.value = getBackgroundImage(data.theme)
    // avatar_url no longer needed from session — handled by computed from authStore
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

// ── Batch fetching ────────────────────────────────────────────────────────────
const MOCK_QUESTIONS: QuestionPayload[] = [
  { id: 'm1', question_text: 'The scientist made a remarkable ________ that changed medicine forever.', target_word: 'discovery', hint: 'The act of finding something new' },
  { id: 'm2', question_text: 'She spoke with great ________ when addressing the crowd at the stadium.', target_word: 'confidence', hint: 'A feeling of self-assurance' },
  { id: 'm3', question_text: 'His ability to ________ complex data in seconds impressed the entire team.', target_word: 'analyze', hint: 'Examine methodically and in detail' },
  { id: 'm4', question_text: 'The team celebrated their ________ after months of hard work.', target_word: 'victory', hint: 'Winning a competition' },
  { id: 'm5', question_text: 'She showed great ________ in the face of adversity.', target_word: 'resilience', hint: 'Ability to recover quickly' },
]

async function fetchBatch(): Promise<void> {
  if (isFetchingBatch.value || gameState.value === 'timeout') return
  isFetchingBatch.value = true
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/questions`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) throw new Error('fetch failed')
    const data = await res.json()
    questionQueue.value.push(...(data.questions as QuestionPayload[]))
  } catch {
    const shuffled = [...MOCK_QUESTIONS].sort(() => Math.random() - 0.5)
    questionQueue.value.push(...shuffled)
  } finally {
    isFetchingBatch.value = false
  }
}

// ── Question loading ──────────────────────────────────────────────────────────
async function loadQuestion() {
  gameState.value = 'loading'
  typedLetters.value = []

  if (questionQueue.value.length <= REFETCH_THRESHOLD) {
    fetchBatch()
  }

  const next = questionQueue.value.shift()
  if (!next) {
    currentQuestion.value = MOCK_QUESTIONS[Math.floor(Math.random() * MOCK_QUESTIONS.length)]
    fetchBatch()
  } else {
    currentQuestion.value = next
  }

  gameState.value = 'playing'
  await nextTick()
  inputRef.value?.focus()
}

// ── Input handling ────────────────────────────────────────────────────────────
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
  const target = currentQuestion.value.target_word
  const isCorrect = typed === target

  if (isCorrect) {
    gameState.value = 'correct'
    pointsEarned.value = BASE_POINTS
    score.value += pointsEarned.value
    questionsAnswered.value++
    triggerScoreFlash('correct')
    syncAnswer(typed)
  } else {
    gameState.value = 'wrong'

    let wrongCount = 0
    for (let i = 0; i < target.length; i++) {
      if (typed[i] !== target[i]) wrongCount++
    }
    const penalty = Math.min(25, Math.max(5, wrongCount * 5))
    pointsDeducted.value = penalty
    score.value = Math.max(0, score.value - penalty)
    triggerScoreFlash('wrong')
  }

  setTimeout(() => {
    if (gameState.value !== 'timeout') loadQuestion()
  }, FEEDBACK_MS)
}

async function syncAnswer(answer: string) {
  if (!sessionId.value || !currentQuestion.value.id) return
  try {
    const token = localStorage.getItem('arena_token')
    await fetch(`${SERVER_URL}/api/game/submit-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        session_id: sessionId.value,
        question_id: currentQuestion.value.id,
        answer: answer
      })
    })
  } catch (err) {
    console.error('Failed to sync answer:', err)
  }
}

function triggerTimeout() {
  gameState.value = 'timeout'
  inputRef.value?.blur()
  callTimeoutEndpoint()
}

// ── Match control ─────────────────────────────────────────────────────────────
async function restartMatch() {
  score.value = 0
  questionsAnswered.value = 0
  timeLeft.value = MATCH_DURATION
  questionQueue.value = []
  scoreFlash.value = null
  stopMatchTimer()
  await createSession()
  await fetchBatch()
  await loadQuestion()
  startMatchTimer()
}

function goHome() {
  stopMatchTimer()
  router.push('/home')
}

// ── Misc ──────────────────────────────────────────────────────────────────────
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
  await fetchBatch()
  await loadQuestion()
  startMatchTimer()
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  stopMatchTimer()
  if (flashTimer) clearTimeout(flashTimer)
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

.score-pop-correct {
  animation: scoreScaleCorrect 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.score-pop-wrong {
  animation: scoreScaleWrong 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scoreScaleCorrect {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.6); text-shadow: 0 0 15px rgba(255, 165, 0, 0.8); }
  100% { transform: scale(1); }
}

@keyframes scoreScaleWrong {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.4); text-shadow: 0 0 15px rgba(230, 57, 70, 0.9); }
  100% { transform: scale(1); }
}

.slot--correct { animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
.slot--wrong   { animation: shake 0.4s ease; }

@keyframes pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-6px); }
  75%       { transform: translateX(6px); }
}

.timeout-glitch { animation: glitch 0.8s ease forwards; }

@keyframes glitch {
  0%   { clip-path: inset(0 0 100% 0); opacity: 0; transform: skewX(-10deg) scale(1.1); color: #fff; }
  30%  { clip-path: inset(0 0 0% 0);   opacity: 1; transform: skewX(5deg);              color: #E63946; }
  60%  { transform: skewX(-2deg); color: #fff; }
  100% { transform: skewX(0);    color: #E63946; }
}

.timeout-panel { animation: panel-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards; }

@keyframes panel-in {
  from { transform: scale(0.9) translateY(20px); opacity: 0; }
  to   { transform: scale(1) translateY(0);      opacity: 1; }
}

.fade-enter-active, .fade-leave-active         { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from,   .fade-leave-to             { opacity: 0; transform: translateY(10px); }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.2s, transform 0.2s; }
.dropdown-enter-from,   .dropdown-leave-to     { opacity: 0; transform: translateY(-10px); }

.timeout-overlay-enter-active, .timeout-overlay-leave-active { transition: opacity 0.3s; }
.timeout-overlay-enter-from,   .timeout-overlay-leave-to     { opacity: 0; }

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from,   .overlay-leave-to     { opacity: 0; }

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

.card-flip-enter-active, .card-flip-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}
.card-flip-enter-from { opacity: 0; transform: rotateX(-90deg) scale(0.9); }
.card-flip-leave-to   { opacity: 0; transform: rotateX(90deg)  scale(0.9); }

.glow-sweep { animation: sweepWave 1s ease-in-out infinite; display: inline-block; }

@keyframes sweepWave {
  0%, 100% {
    color: #22c55e;
    text-shadow: 0 0 5px rgba(34, 197, 94, 0.3);
    transform: scale(1) translateY(0);
  }
  50% {
    color: #ffffff;
    text-shadow: 0 0 15px rgba(34, 197, 94, 1), 0 0 25px rgba(34, 197, 94, 0.8), 0 0 35px rgba(255, 255, 255, 0.5);
    transform: scale(1.15) translateY(-3px);
  }
}
</style>