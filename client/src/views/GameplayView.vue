<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans flex flex-col select-none" @click="refocusInput">

    <!-- Ambient blobs -->
    <div class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-10 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-40 pointer-events-none z-0"></div>

    <!-- ── Header ── -->
    <header class="relative z-30 flex justify-between items-center px-8 lg:px-12 py-5 border-b border-white/5">

      <!-- Logo + Dropdown -->
      <div class="relative" ref="menuRef">
        <button
          @click.stop="menuOpen = !menuOpen"
          class="flex items-center gap-3 group focus:outline-none"
        >
          <svg class="w-8 h-8 text-orange fill-current" viewBox="0 0 24 24">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
          <span class="text-xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred uppercase">NAENRA</span>
          <!-- chevron -->
          <svg
            class="w-4 h-4 text-gray-500 transition-transform duration-200"
            :class="menuOpen ? 'rotate-180' : ''"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </button>

        <!-- Dropdown panel -->
        <transition name="dropdown">
          <div
            v-if="menuOpen"
            class="absolute top-full left-0 mt-2 w-52 bg-darkNavy border border-white/10 shadow-2xl z-50 overflow-hidden"
          >
            <div class="px-4 py-2 border-b border-white/5">
              <p class="text-[9px] text-gray-600 uppercase tracking-widest font-bold">Match in progress</p>
              <p class="text-xs text-gray-400 font-mono mt-0.5">Score: <span class="text-white font-bold">{{ score }}</span> · Q: <span class="text-white font-bold">{{ questionsAnswered }}</span></p>
            </div>
            <button
              @click.stop="goHome"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-left"
            >
              <svg class="w-4 h-4 text-orange flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
              </svg>
              Back to Home
            </button>
            <button
              @click.stop="confirmQuit = true; menuOpen = false"
              class="w-full flex items-center gap-3 px-4 py-3 text-sm text-hexred hover:bg-hexred/10 transition-colors text-left"
            >
              <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Quit Match
            </button>
          </div>
        </transition>
      </div>

      <!-- Match meta -->
      <div class="flex items-center gap-6">
        <!-- Questions answered counter -->
        <div class="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 -skew-x-6">
          <span class="text-[10px] font-bold text-lightBlue tracking-[0.2em] uppercase skew-x-6">Q</span>
          <span class="text-lg font-black text-white skew-x-6">{{ questionsAnswered }}</span>
        </div>
        <!-- Countdown timer (45s, shared) -->
        <div class="flex items-center gap-2" :class="timeLeft <= 10 ? 'text-hexred' : 'text-lightOrange'">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <span class="font-mono font-black text-2xl tabular-nums" :class="timeLeft <= 10 ? 'animate-pulse' : ''">
            {{ String(timeLeft).padStart(2, '0') }}
          </span>
        </div>
        <!-- Score -->
        <div class="text-right hidden md:block">
          <p class="text-[10px] text-gray-500 uppercase tracking-widest">Score</p>
          <p class="font-black text-lg text-white">{{ score }}</p>
        </div>
      </div>
    </header>

    <!-- ── Main ── -->
    <main class="relative z-20 flex-1 flex flex-col px-6 lg:px-16 py-8 gap-8 max-w-4xl mx-auto w-full">

      <!-- SECTION 1: Question -->
      <section class="flex-1 flex flex-col justify-center">
        <p class="text-[10px] font-bold text-lightBlue tracking-[0.3em] uppercase mb-4 flex items-center gap-2">
          <span class="inline-block w-4 h-px bg-lightBlue"></span>
          Context
        </p>
        <div
          class="relative border border-white/10 bg-white/[0.03] p-8 lg:p-10"
          :class="{ 'border-orange/40': gameState === 'playing' }"
        >
          <span class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-orange"></span>
          <span class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-orange"></span>

          <div v-if="gameState === 'loading'" class="space-y-3 animate-pulse">
            <div class="h-5 bg-white/10 rounded w-full"></div>
            <div class="h-5 bg-white/10 rounded w-5/6"></div>
            <div class="h-5 bg-white/10 rounded w-3/4"></div>
          </div>
          <p v-else class="text-2xl lg:text-3xl font-medium leading-relaxed text-gray-200 tracking-wide">
            {{ currentQuestion.question_text }}
          </p>
        </div>
      </section>

      <!-- Divider -->
      <div class="flex items-center gap-4">
        <div class="flex-1 h-px bg-white/10"></div>
        <span class="text-[10px] font-bold text-gray-600 tracking-[0.3em] uppercase">Your Answer</span>
        <div class="flex-1 h-px bg-white/10"></div>
      </div>

      <!-- SECTION 2: Answer slots -->
      <section class="flex flex-col items-center gap-6 pb-4">
        <div class="flex items-end justify-center gap-2 flex-wrap">
          <template v-if="gameState === 'loading'">
            <div v-for="i in 8" :key="i" class="w-10 h-14 border-b-2 border-white/20 animate-pulse bg-white/5"></div>
          </template>
          <template v-else>
            <div
              v-for="(char, idx) in currentQuestion.target_word.split('')"
              :key="idx"
              class="slot flex flex-col items-center gap-1"
            >
              <div
                class="relative w-10 h-14 flex items-end justify-center pb-1 transition-all duration-150"
                :class="{
                  'slot--active':  idx === typedLetters.length && gameState === 'playing',
                  'slot--correct': gameState === 'correct',
                  'slot--wrong':   gameState === 'wrong',
                }"
              >
                <span
                  class="text-2xl font-black uppercase tracking-widest transition-all duration-100"
                  :class="{
                    'text-white':   typedLetters[idx] !== undefined && gameState === 'playing',
                    'text-success': gameState === 'correct',
                    'text-hexred':  gameState === 'wrong',
                    'opacity-0':    typedLetters[idx] === undefined,
                    'opacity-100':  typedLetters[idx] !== undefined,
                  }"
                >{{ typedLetters[idx] ?? '_' }}</span>
                <span
                  class="absolute bottom-0 left-0 w-full h-0.5 transition-colors duration-150"
                  :class="{
                    'bg-orange':   idx === typedLetters.length && gameState === 'playing',
                    'bg-white/20': idx !== typedLetters.length || gameState !== 'playing',
                    'bg-success':  gameState === 'correct',
                    'bg-hexred':   gameState === 'wrong',
                  }"
                ></span>
                <span
                  v-if="idx === typedLetters.length && gameState === 'playing'"
                  class="absolute bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-5 bg-orange animate-pulse"
                ></span>
              </div>
              <span class="text-[9px] text-white/20 font-mono">{{ idx + 1 }}</span>
            </div>
          </template>
        </div>

        <!-- Feedback -->
        <transition name="fade">
          <div
            v-if="gameState === 'correct' || gameState === 'wrong'"
            class="flex items-center gap-3 px-6 py-3 border font-bold text-sm tracking-widest uppercase"
            :class="{
              'border-success/40 bg-success/10 text-success': gameState === 'correct',
              'border-hexred/40 bg-hexred/10 text-hexred':   gameState === 'wrong',
            }"
          >
            <span v-if="gameState === 'correct'">✓ Correct! +{{ pointsEarned }} pts</span>
            <span v-else>✕ The word was: <span class="uppercase">{{ currentQuestion.target_word }}</span></span>
          </div>
        </transition>

        <p v-if="gameState === 'playing'" class="text-[11px] text-gray-600 tracking-widest">
          {{ currentQuestion.target_word.length }} letters — type to fill the blank
        </p>
      </section>
    </main>

    <!-- ── Bottom timer bar (45s progress) ── -->
    <div class="relative z-20 h-1.5 w-full flex">
      <div
        class="h-full transition-all duration-1000 ease-linear"
        :class="timeLeft <= 10 ? 'bg-hexred' : 'bg-gradient-to-r from-orange to-hexred'"
        :style="{ width: `${(timeLeft / MATCH_DURATION) * 100}%` }"
      ></div>
      <div class="flex-1 h-full bg-white/5"></div>
    </div>

    <!-- ── Time's up overlay ── -->
    <transition name="overlay">
      <div v-if="gameState === 'finished'" class="absolute inset-0 z-40 flex items-center justify-center bg-darkNavy/90 backdrop-blur-sm">
        <div class="text-center px-8">
          <p class="text-[10px] text-lightBlue tracking-[0.3em] uppercase mb-4">Match Complete</p>
          <p class="text-7xl font-black text-white mb-2">{{ score }}</p>
          <p class="text-gray-500 text-sm mb-2">pts · {{ questionsAnswered }} questions answered</p>
          <div class="flex gap-4 mt-8 justify-center">
            <button
              @click="router.push('/home')"
              class="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors"
            >Home</button>
            <button
              @click="restartMatch"
              class="group relative px-8 py-3 bg-darkNavy border border-white/10 overflow-hidden font-bold text-sm tracking-widest uppercase"
            >
              <div class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-300 z-0"></div>
              <span class="relative z-10 text-gray-300 group-hover:text-white transition-colors">Play Again</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ── Quit confirm overlay ── -->
    <transition name="overlay">
      <div v-if="confirmQuit" class="absolute inset-0 z-50 flex items-center justify-center bg-darkNavy/90 backdrop-blur-sm">
        <div class="border border-white/10 bg-darkNavy p-8 max-w-sm w-full mx-4">
          <span class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-hexred"></span>
          <p class="text-[10px] text-hexred tracking-[0.3em] uppercase mb-3 font-bold">Abandon Match?</p>
          <p class="text-gray-400 text-sm mb-6">Your current score of <span class="text-white font-bold">{{ score }} pts</span> will be lost.</p>
          <div class="flex gap-3">
            <button
              @click="confirmQuit = false; refocusInput()"
              class="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors"
            >Cancel</button>
            <button
              @click="goHome"
              class="flex-1 px-4 py-2.5 bg-hexred/20 hover:bg-hexred/30 border border-hexred/40 text-hexred font-bold text-sm tracking-widest uppercase transition-colors"
            >Quit</button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Hidden keyboard trap -->
    <input
      ref="inputRef"
      class="sr-only"
      type="text"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      @keydown="handleKeydown"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// ── Types ──────────────────────────────────────────────────────────────────
interface QuestionPayload {
  question_text: string
  target_word: string
}

type GameState = 'loading' | 'playing' | 'correct' | 'wrong' | 'finished'

// ── Constants ──────────────────────────────────────────────────────────────
const SERVER_URL    = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const MATCH_DURATION = 45   // shared 45-second countdown
const FEEDBACK_MS    = 1000 // ms to show correct/wrong before next question

// ── State ──────────────────────────────────────────────────────────────────
const gameState        = ref<GameState>('loading')
const timeLeft         = ref(MATCH_DURATION)
const score            = ref(0)
const questionsAnswered = ref(0)
const pointsEarned     = ref(0)
const typedLetters     = ref<string[]>([])
const inputRef         = ref<HTMLInputElement | null>(null)
const menuRef          = ref<HTMLElement | null>(null)
const menuOpen         = ref(false)
const confirmQuit      = ref(false)

const currentQuestion = ref<QuestionPayload>({ question_text: '', target_word: '' })

// ── Match timer (counts down from 45, shared across all questions) ─────────
let matchTimer: ReturnType<typeof setInterval> | null = null

function startMatchTimer() {
  if (matchTimer) return // already running
  matchTimer = setInterval(() => {
    if (timeLeft.value <= 1) {
      clearInterval(matchTimer!)
      matchTimer = null
      endMatch()
    } else {
      timeLeft.value--
    }
  }, 1000)
}

function stopMatchTimer() {
  if (matchTimer) { clearInterval(matchTimer); matchTimer = null }
}

// ── API ────────────────────────────────────────────────────────────────────
async function fetchQuestion(): Promise<QuestionPayload> {
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/game/question`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })
    if (!res.ok) throw new Error('fetch failed')
    return await res.json()
  } catch {
    const mocks: QuestionPayload[] = [
      { question_text: 'The scientist made a remarkable ________ that changed medicine forever.', target_word: 'discovery' },
      { question_text: 'She spoke with great ________ when addressing the crowd at the stadium.', target_word: 'confidence' },
      { question_text: 'His ability to ________ complex data in seconds impressed the entire team.', target_word: 'analyze' },
      { question_text: 'The committee reached a unanimous ________ after hours of debate.', target_word: 'decision' },
      { question_text: 'The old map revealed a hidden ________ deep inside the mountain range.', target_word: 'treasure' },
    ]
    return mocks[Math.floor(Math.random() * mocks.length)]
  }
}

// ── Game flow ──────────────────────────────────────────────────────────────
async function loadQuestion() {
  gameState.value    = 'loading'
  typedLetters.value = []
  currentQuestion.value = await fetchQuestion()
  gameState.value = 'playing'
  await nextTick()
  inputRef.value?.focus()
}

function handleKeydown(e: KeyboardEvent) {
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
    // Bonus points scale with remaining time
    pointsEarned.value = 100 + Math.floor(timeLeft.value * 3)
    score.value += pointsEarned.value
    gameState.value = 'correct'
  } else {
    gameState.value = 'wrong'
  }

  // After brief feedback, load next question (timer keeps running)
  setTimeout(() => {
    if (gameState.value !== 'finished') loadQuestion()
  }, FEEDBACK_MS)
}

function endMatch() {
  gameState.value = 'finished'
  stopMatchTimer()
}

function restartMatch() {
  score.value             = 0
  questionsAnswered.value = 0
  timeLeft.value          = MATCH_DURATION
  stopMatchTimer()
  loadQuestion()
  startMatchTimer()
}

function goHome() {
  stopMatchTimer()
  router.push('/home')
}

// ── Dropdown: close on outside click ──────────────────────────────────────
function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

function refocusInput() {
  if (!menuOpen.value && !confirmQuit.value) {
    inputRef.value?.focus()
  }
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(async () => {
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
    linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}

.slot--active  { transform: translateY(-2px); }
.slot--correct { animation: pop 0.2s ease; }
.slot--wrong   { animation: shake 0.3s ease; }

@keyframes pop {
  0%   { transform: scale(1); }
  50%  { transform: scale(1.15); }
  100% { transform: scale(1); }
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.15s, transform 0.15s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; transform: translateY(6px); }

.dropdown-enter-active, .dropdown-leave-active { transition: opacity 0.15s, transform 0.15s; }
.dropdown-enter-from, .dropdown-leave-to       { opacity: 0; transform: translateY(-6px); }

.overlay-enter-active, .overlay-leave-active { transition: opacity 0.2s; }
.overlay-enter-from, .overlay-leave-to       { opacity: 0; }

.sr-only {
  position: absolute; width: 1px; height: 1px;
  padding: 0; overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}
</style>