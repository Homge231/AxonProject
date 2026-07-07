<template>
  <div class="h-screen w-full overflow-hidden relative font-sans flex flex-col select-none text-white transition-all duration-75"
    :class="{ 'sepia hue-rotate-[180deg] blur-[2px] scale-[1.02] saturate-200 contrast-150 animate-pulse': isShifting }"
    @click="refocusInput">
    <PhaserBackground :image-url="currentBgImage" />

    <div class="absolute inset-0 cyber-grid opacity-20 pointer-events-none z-0"></div>

    <!-- Floating points popup container -->
    <div class="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      <transition-group name="float-pts" tag="div">
        <div v-for="popup in pointPopups" :key="popup.id"
          class="float-pts-item absolute font-black tracking-widest drop-shadow-lg" :class="{
            'text-2xl text-success': popup.type === 'correct',
            'text-2xl text-hexred': popup.type === 'wrong',
            'text-2xl text-yellow-400': popup.type === 'typo',
            'text-2xl text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]': popup.type === 'shield_blocked',
            'speedster-popup': popup.type === 'speedster'
          }" :style="{ left: popup.x + 'px', top: popup.y + 'px' }">
          <template v-if="popup.type === 'speedster'">
            <span class="speedster-fast-text">+{{ popup.value }} FAST!</span>
          </template>
          <template v-else-if="popup.type === 'shield_blocked'">
            BLOCKED!
          </template>
          <template v-else>
            {{ popup.type === 'correct' ? '+' : '-' }}{{ popup.value }}{{ popup.type === 'typo' ? ' (Typo)' : ' PTS' }}
          </template>
        </div>
      </transition-group>
    </div>

    <!-- Persistent Pandora Mode Indicator -->
    <div v-if="isPandoraMode" class="absolute top-[90px] left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
      <div class="px-5 py-2 rounded-full bg-purple-900/60 border border-purple-500/50 backdrop-blur-md text-xs font-bold text-purple-200 uppercase tracking-widest shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center gap-2">
        <span class="animate-pulse">Pandora's Box:</span>
        <span class="text-white drop-shadow-md text-sm">{{ gameStore.activeCoreName }}</span>
      </div>
    </div>

    <!-- Flashy Announcement -->
    <transition name="fade">
      <div v-if="shiftAnnouncement" class="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">
        <h2 class="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 tracking-widest drop-shadow-[0_0_20px_rgba(168,85,247,0.8)] uppercase animate-pulse text-center leading-tight">
          PANDORA SHIFTS TO<br>
          <span class="text-white text-5xl md:text-6xl drop-shadow-[0_0_25px_rgba(255,255,255,1)] block mt-2">{{ shiftAnnouncement }}</span>
        </h2>
      </div>
    </transition>

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
              }}</span>
              </p>
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
          <span class="text-xs font-bold text-orange tracking-[0.2em] uppercase">Score</span>
          <span class="text-xl font-black text-white tabular-nums">{{ score }}</span>
        </div>

        <div
          class="flex items-center gap-3 bg-black/30 backdrop-blur-md border border-white/10 px-5 py-2 rounded-lg shadow-inner">
          <span class="text-xs font-bold text-lightBlue tracking-[0.2em] uppercase">Q</span>
          <span class="text-xl font-black text-white">{{ questionsAnswered }}</span>
        </div>

        <div class="flex items-center gap-2" :class="timeLeft <= 10 ? 'text-hexred' : activeCoreModule.timerColor">
          <svg class="w-5 h-5 drop-shadow-md" :class="activeCoreModule.timerIconClass || undefined" fill="none"
            stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="font-mono font-black text-3xl tabular-nums drop-shadow-lg" :class="[
            timeLeft <= 10 ? 'animate-pulse' : '',
            activeCoreModule.timerClass || ''
          ]">
            {{ String(timeLeft).padStart(2, '0') }}
          </span>
          <!-- Round Indicator Preparation -->
          <div class="absolute -bottom-6 w-full text-center whitespace-nowrap">
            <span class="text-[9px] font-bold text-gray-500 uppercase tracking-widest bg-darkBlue/50 px-2 py-0.5 rounded-full border border-white/5">
              Round {{ matchStore.currentRound }}/{{ matchStore.maxRounds }}
            </span>
          </div>
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
            <div :key="currentQuestion.id" class="w-full flex flex-col items-center gap-10">

              <div v-if="currentQuestion.hint"
                class="relative overflow-hidden bg-blue/10 backdrop-blur-xl border border-blue/30 rounded-2xl p-6 md:p-8 shadow-[0_10px_30px_rgba(59,130,246,0.15)] text-center w-full transition-all duration-300 transform hover:-translate-y-1">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue to-transparent">
                </div>
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

              <!-- Oracle: Click-to-reveal hint button (only for Oracle core) -->
              <OracleCoreIndicator
                v-if="isOracleCore && gameState === 'playing'"
                :oracle-reveal-level="oracleRevealLevel"
                :oracle-max-allowed="oracleMaxAllowed"
                :oracle-hint-text="oracleHintText"
                :oracle-next-cost="oracleNextCost"
                @use-hint="useOracleHint"
              />

              <div
                class="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl flex flex-col items-center text-center w-full transition-all duration-300"
                :class="{ 'burning-edge-active': isBurningComboActive }">
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

              <!-- Letter slots (anchor for popup position) -->
              <div class="w-full flex flex-col items-center gap-3 overflow-hidden" ref="letterSlotsRef">

                <!-- Speedster wind streak overlay -->
                <transition name="wind-fade">
                  <div v-if="activeCoreModule.showWindOverlay && gameState === 'playing'"
                    class="speedster-wind-container" aria-hidden="true">
                    <span class="wind-streak ws1"></span>
                    <span class="wind-streak ws2"></span>
                    <span class="wind-streak ws3"></span>
                    <span class="wind-streak ws4"></span>
                    <span class="wind-streak ws5"></span>
                    <span class="wind-streak ws6"></span>
                  </div>
                </transition>

                <div
                  class="flex flex-nowrap items-center justify-center gap-2 md:gap-3 w-full overflow-x-auto pb-3 scrollbar-none"
                  :class="{ 'speedster-slots-glow': isSpeedsterCore && gameState === 'playing' }">
                  <div v-for="(_, idx) in currentQuestion.target_length" :key="idx" class="flex-shrink-0">
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
                  ({{ currentQuestion.target_length }} letters)
                </div>
              </div>

              <transition name="fade">
                <div v-if="gameState === 'correct' || gameState === 'wrong'"
                  class="relative z-10 flex items-center gap-3 px-8 py-3.5 border font-bold text-sm tracking-widest uppercase rounded-full shadow-2xl mx-auto w-fit backdrop-blur-lg"
                  :class="{
                    'border-success/50 bg-success/20 text-green-300': gameState === 'correct',
                    'border-hexred/50 bg-hexred/20 text-red-300': gameState === 'wrong',
                  }">
                  <span v-if="gameState === 'correct'">★ Brilliant! +{{ pointsEarned }} pts</span>
                  <span v-else>
                    <span v-if="currentQuestion.correct_word">
                      ✗ Correct word:
                      <span class="uppercase text-white ml-1 font-black">{{ currentQuestion.correct_word }}</span>
                      <span class="ml-3 text-hexred font-black">-{{ pointsDeducted }} pts</span>
                    </span>
                    <span v-else class="animate-pulse">
                      ✗ Checking...
                    </span>
                  </span>
                </div>
              </transition>

            </div>
          </transition>
        </template>

      </section>
    </main>

    <!-- Timer progress bar -->
    <div class="relative z-20 h-2 w-full flex bg-black/50">
      <div class="h-full rounded-r-full shadow-[0_0_10px_rgba(255,165,0,0.8)]" :class="[
        timeLeft <= 10 ? 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.8)]' : 'bg-gradient-to-r from-blue to-lightBlue'
      ]" :style="{ width: `${timerProgressPercent}%` }">
      </div>
    </div>

    <!-- Combo indicator: only visible when active core is the Combo Core -->
    <transition name="fade-scale">
      <div v-if="isComboCore" class="absolute top-28 right-8 z-20 flex justify-end transition-all duration-300">
        <ComboCoreIndicator :current-combo="currentCombo" />
      </div>
    </transition>

    <!-- Aegis Shield Mode Indicator -->
    <transition name="fade-scale">
      <div v-if="isAegisMode" class="absolute top-28 right-8 z-20 flex justify-end transition-all duration-300">
        <AegisShieldIndicator :count="aegisShieldCount" :shattering="isShattering" />
      </div>
    </transition>

    <!-- Mission Tracker UI: only visible when active core is the Mission Core -->
    <transition name="fade-scale">
      <div v-if="isMissionCore" class="absolute top-28 left-8 z-20 flex transition-all duration-300">
        <MissionCoreIndicator 
          :mission-progress="missionProgress" 
          :show-celebration="showMissionCelebration" 
        />
      </div>
    </transition>

    <!-- Player Avatar -->

    <Avatar :src="playerAvatarUrl" alt="Player Avatar" />

    <transition name="timeout-overlay">
      <div v-if="gameState === 'timeout'" class="absolute inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-darkNavy/80 backdrop-blur-xl"></div>
        <div
          class="relative border border-hexred/50 bg-darkNavy/90 p-12 max-w-2xl w-full mx-4 text-center timeout-panel rounded-2xl shadow-[0_0_50px_rgba(230,57,70,0.2)] flex flex-col max-h-[90vh]">
          <p class="text-xs font-bold text-hexred tracking-[0.4em] uppercase mb-4 drop-shadow-md">Match Ended</p>
          <h2
            class="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_rgba(230,57,70,0.8)] mb-2 timeout-glitch">
            TIME OUT
          </h2>
          <div class="w-20 h-1 bg-gradient-to-r from-transparent via-hexred to-transparent mx-auto mb-10 mt-6"></div>

          <div class="flex justify-center gap-12 mb-6 bg-black/30 py-4 rounded-xl border border-white/5 flex-shrink-0">
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Final Score</p>
              <p class="text-4xl font-black text-orange drop-shadow-md">{{ score }}</p>
            </div>
            <div class="w-px bg-white/10"></div>
            <div>
              <p class="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Questions</p>
              <p class="text-4xl font-black text-lightBlue drop-shadow-md">{{ questionsAnswered }}</p>
            </div>
          </div>

          <!-- Recap Table -->
          <div v-if="matchHistory.length > 0" class="mb-6 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex-1 overflow-y-auto custom-scrollbar">
            <table class="w-full text-left text-sm text-gray-300">
              <thead class="bg-black/60 text-xs uppercase text-gray-500 sticky top-0 z-10">
                <tr>
                  <th class="px-6 py-4 font-bold tracking-widest">Your Answer</th>
                  <th class="px-6 py-4 font-bold tracking-widest border-l border-white/5">Correct Answer</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="(item, idx) in matchHistory" :key="idx" class="hover:bg-white/5 transition-colors">
                  <td class="px-6 py-3 font-medium uppercase tracking-wider" :class="item.isCorrect ? 'text-green bg-green/10' : 'text-hexred bg-hexred/10'">
                    {{ item.submitted }}
                  </td>
                  <td class="px-6 py-3 font-medium text-white uppercase tracking-wider border-l border-white/5">
                    {{ item.correct }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-if="savingSession" class="text-xs text-gray-400 uppercase tracking-widest mb-6 animate-pulse flex-shrink-0">
            <span class="inline-block w-2 h-2 bg-lightBlue rounded-full mr-2"></span>
            Syncing results...
          </p>

          <div class="flex gap-4 justify-center flex-shrink-0 mt-auto">
            <button @click="router.push('/home')"
              class="flex-1 px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white font-bold text-sm tracking-widest uppercase transition-colors rounded-lg">Home</button>
            <button @click="restartMatch"
              class="flex-1 group relative px-6 py-4 bg-gradient-to-r from-orange to-hexred overflow-hidden font-black text-sm tracking-widest uppercase rounded-lg shadow-lg hover:shadow-[0_0_20px_rgba(230,57,70,0.5)] transition-shadow">
              <div
                class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              </div>
              <span class="relative z-10 text-white">Next Round ({{ timeoutCountdown }}s)</span>
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
import AegisShieldIndicator from '../components/game/AegisShieldIndicator.vue'
import ComboCoreIndicator from '../components/game/ComboCoreIndicator.vue'
import MissionCoreIndicator from '../components/game/MissionCoreIndicator.vue'
import OracleCoreIndicator from '../components/game/OracleCoreIndicator.vue'
import PhaserBackground from '../components/game/PhaserBackground.vue'
import Avatar from '../components/Avatar.vue'
import { useGameStore } from '../stores/gameStore'
import { useMatchStore } from '../stores/matchStore'
import { getCoreModule } from '../game/cores/registry'
import { fetchWithAuth } from '../services/api'
const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()
const matchStore = useMatchStore()

interface QuestionPayload {
  id: string
  question_text: string
  target_length: number
  target_hash: string
  oracle_hints: string[]
  hint?: string
  correct_word?: string
}

interface PointPopup {
  id: number
  value: number
  type: 'correct' | 'wrong' | 'typo' | 'speedster' | 'shield_blocked'
  x: number
  y: number
}

type GameState = 'loading' | 'playing' | 'correct' | 'wrong' | 'timeout'
type ScoreFlash = 'correct' | 'wrong' | null

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'
const MATCH_DURATION = 100
const FEEDBACK_MS = 1000
const REFETCH_THRESHOLD = 5
const SCORE_BAR_MAX = 2000

const THEME_MAP: Record<string, string> = {
  'daily-life': '/bg-daily-life.png',
  'cafe': '/bg-cafe.png',
  'travel': '/bg-travel.png'
}

// ── State ──────────────────────────────────────────────────────────────────
const gameState = ref<GameState>('loading')
const timeLeft = ref(MATCH_DURATION)
const timerProgressPercent = ref(100)
const score = ref(0)
const scoreFlash = ref<ScoreFlash>(null)
const questionsAnswered = ref(0)
const pointsEarned = ref(0)
const pointsDeducted = ref(0)
const typedLetters = ref<string[]>([])
const inputRef = ref<HTMLInputElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const letterSlotsRef = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const confirmQuit = ref(false)
const savingSession = ref(false)
const sessionId = ref<string | null>(null)
const currentBgImage = ref('/bg-daily-life.png')
const currentCombo = ref(0)
const isBurningComboActive = computed(() => isComboCore.value && currentCombo.value >= 3)
const missionProgress = ref(0)
const AEGIS_CORE_ID = '00000000-0000-0000-0000-000000000011'
const isAegisMode = computed(() => activeCoreId.value === AEGIS_CORE_ID)
// Aegis Shield State
const aegisShieldCount = ref(0)
const isShattering = ref(false)
const showMissionCelebration = ref(false)

// active_core_id / name sourced from gameStore (set in CoreSelectionView)
const activeCoreId = computed<string | null>({
  get: () => gameStore.activeCoreId,
  set: (val) => { gameStore.activeCoreId = val }
})

// ── Core registry ──────────────────────────────────────────────────────────
// Single source of truth for all core-specific UI behaviour.
// To add a new core: edit client/src/game/cores/registry.ts only.
const activeCoreModule = computed(() => getCoreModule(gameStore.activeCoreId))

// Convenience booleans — still used by Oracle-specific template logic
const isComboCore = computed(() => gameStore.activeCoreName?.toLowerCase() === 'combo core')
const isOracleCore = computed(() => gameStore.activeCoreName?.toLowerCase() === 'oracle core')
const isSpeedsterCore = computed(() => gameStore.activeCoreName?.toLowerCase() === 'speedster')
const isMissionCore = computed(() => gameStore.activeCoreName?.toLowerCase() === 'mission core')

// ── Pandora's Box Logic ──────────────────────────────────────────────────
const PANDORA_CORE_ID = '00000000-0000-0000-0000-000000000010'
const isPandoraMode = ref(false)
const isShifting = ref(false)
const shiftAnnouncement = ref('')
const pandoraPool = ref<any[]>([])

async function fetchPandoraPool() {
  try {
    const res = await fetchWithAuth(`/api/game/cores`)
    if (!res.ok) return
    const data = await res.json()
    // Pandora shifts into anything except itself
    pandoraPool.value = (data.cores || []).filter((c: any) => c.id !== PANDORA_CORE_ID)
  } catch (err) {
    console.error('Failed to fetch cores for Pandora', err)
  }
}

function triggerShapeshift() {
  if (pandoraPool.value.length === 0) return
  isShifting.value = true
  
  const randomCore = pandoraPool.value[Math.floor(Math.random() * pandoraPool.value.length)]
  
  setTimeout(() => {
    activeCoreId.value = randomCore.id
    gameStore.activeCoreName = randomCore.name
    shiftAnnouncement.value = randomCore.name
    isShifting.value = false

    // Clear flashy text after 2s
    setTimeout(() => {
      shiftAnnouncement.value = ''
    }, 2000)
  }, 400) // 400ms glitch duration
}
// Oracle progressive reveal: 3 levels, increasing cost
const ORACLE_MAX_LEVEL = 3
const ORACLE_COSTS = [10, 20, 30] // cost per level: -10, -20, -30
const oracleRevealLevel = ref(0)
const oracleTotalPenalty = ref(0)

const oracleNextCost = computed(() => ORACLE_COSTS[oracleRevealLevel.value] ?? 0)

const oracleHintText = computed(() => {
  const level = oracleRevealLevel.value
  if (level === 0) return ''
  return currentQuestion.value.oracle_hints?.[level - 1] || ''
})
// ── Skip Question Logic  ───────────────────────────────────────────


function useOracleHint() {
  if (oracleRevealLevel.value >= oracleMaxAllowed.value) return
  if (gameState.value !== 'playing') return

  const cost = ORACLE_COSTS[oracleRevealLevel.value]
  oracleRevealLevel.value++
  oracleTotalPenalty.value += cost

  // Score bar will update when submit-answer responds (server is source of truth).
  // Oracle cost is shown on the hint button label — no separate popup needed.

  // Re-focus the hidden input so the player can continue typing without clicking the screen
  inputRef.value?.focus()
}
const oracleMaxAllowed = computed(() => {
  const len = currentQuestion.value.target_length
  if (len <= 5) return 2
  return ORACLE_MAX_LEVEL
})



// Floating point popups
const pointPopups = ref<PointPopup[]>([])
let popupIdCounter = 0
let submitAnswerSeq = 0   // increments per answer submitted; used to discard out-of-order responses

const playerAvatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authStore.profile?.username || 'Player')}`
)

// Removed unused scoreBar derived state

// ── Question queue ────────────────────────────────────────────────────────
const questionQueue = ref<QuestionPayload[]>([])
const isFetchingBatch = ref(false)
const currentQuestion = ref<QuestionPayload>({ id: '', question_text: '', target_length: 0, target_hash: '', oracle_hints: ['', '', ''] })
const matchHistory = ref<{ submitted: string, correct: string, isCorrect: boolean }[]>([])

let flashTimer: ReturnType<typeof setTimeout> | null = null

// ── Score flash helper ────────────────────────────────────────────────────
function triggerScoreFlash(type: ScoreFlash) {
  if (flashTimer) clearTimeout(flashTimer)
  scoreFlash.value = type
  flashTimer = setTimeout(() => { scoreFlash.value = null }, 400)
}

// ── Floating popup helper ─────────────────────────────────────────────────
function spawnPointPopup(value: number, type: 'correct' | 'wrong' | 'typo' | 'speedster' | 'shield_blocked') {
  let x = window.innerWidth / 2 - 50
  let y = window.innerHeight / 2 - 60
  if (letterSlotsRef.value) {
    const rect = letterSlotsRef.value.getBoundingClientRect()
    x = rect.left + rect.width / 2 - 50
    y = rect.top - 10
  }

  const id = popupIdCounter++
  pointPopups.value.push({ id, value, type, x, y })
  const duration = type === 'speedster' ? 1800 : 1200
  setTimeout(() => {
    pointPopups.value = pointPopups.value.filter(p => p.id !== id)
  }, duration)
}

// ── Question start-time tracking (for Speedster time_taken) ───────────────
const questionStartTime = ref<number>(Date.now())

// ── Timer ──────────────────────────────────────────────────────────────────
let matchTimerFrame: number | null = null
let matchStartTime = 0

const timeoutCountdown = ref(15)
let timeoutInterval: ReturnType<typeof setInterval> | null = null

function stopTimeoutInterval() {
  if (timeoutInterval) {
    clearInterval(timeoutInterval)
    timeoutInterval = null
  }
}

function startMatchTimer() {
  if (matchTimerFrame) return
  matchStartTime = Date.now()
  let lastShiftTime = matchStartTime - 25000 // Trigger first shift immediately

  const tick = () => {
    const elapsed = Date.now() - matchStartTime
    const remainingMs = Math.max(0, (MATCH_DURATION * 1000) - elapsed)

    timerProgressPercent.value = (remainingMs / (MATCH_DURATION * 1000)) * 100
    timeLeft.value = Math.ceil(remainingMs / 1000)

    // Shapeshifter trigger every 25s
    if (isPandoraMode.value && pandoraPool.value.length > 0) {
      if (Date.now() - lastShiftTime >= 25000) {
        lastShiftTime = Date.now()
        triggerShapeshift()
      }
    }

    if (remainingMs > 0) {
      matchTimerFrame = requestAnimationFrame(tick)
    } else {
      matchTimerFrame = null
      timeLeft.value = 0
      triggerTimeout()
    }
  }

  matchTimerFrame = requestAnimationFrame(tick)
}

function stopMatchTimer() {
  if (matchTimerFrame) { cancelAnimationFrame(matchTimerFrame); matchTimerFrame = null }
}

function getBackgroundImage(themeKey: string) {
  return THEME_MAP[themeKey] || '/bg-daily-life.png'
}

// ── Session API ────────────────────────────────────────────────────────────
async function createSession() {
  try {
    const res = await fetchWithAuth(`/api/game/session`, {
      method: 'POST',
      body: JSON.stringify({ active_core_id: activeCoreId.value })
    })
    if (!res.ok) return
    const data = await res.json()
    sessionId.value = data.session_id
    if (data.active_core?.id) activeCoreId.value = data.active_core.id
    if (data.active_core?.name) gameStore.activeCoreName = data.active_core.name
    if (data.theme) currentBgImage.value = getBackgroundImage(data.theme)
    if (data.aegis_shield_count !== undefined) aegisShieldCount.value = data.aegis_shield_count
    
    if (activeCoreId.value === PANDORA_CORE_ID) {
      isPandoraMode.value = true
      fetchPandoraPool()
    }
  } catch (err) {
    console.error(err)
  }
}

async function callTimeoutEndpoint(sid: string, coreId: string, oracleLvl: number) {
  savingSession.value = true
  try {
    const res = await fetchWithAuth(`/api/game/timeout`, {
      method: 'POST',
      body: JSON.stringify({
        session_id: sid,
        active_core_id: coreId,
        oracle_reveal_level: oracleLvl
      })
    })
    if (res.ok) {
      const data = await res.json()
      score.value = data.score ?? score.value
      questionsAnswered.value = data.questions_answered ?? questionsAnswered.value
    }
  } catch (err) {
    console.error(err)
  } finally {
    savingSession.value = false
  }
}

// ── Batch fetching ─────────────────────────────────────────────────────────
const MOCK_QUESTIONS: QuestionPayload[] = [
  { id: 'm1', question_text: 'The scientist made a remarkable ________ that changed medicine forever.', target_length: 9, target_hash: '', oracle_hints: ['D·······Y', 'D·S···E·Y', 'D·S·O·E·Y'], hint: 'The act of finding something new' },
  { id: 'm2', question_text: 'She spoke with great ________ when addressing the crowd at the stadium.', target_length: 10, target_hash: '', oracle_hints: ['C········E', 'C·N····C·E', 'C·N·I·E·C·E'], hint: 'A feeling of self-assurance' },
  { id: 'm3', question_text: 'His ability to ________ complex data in seconds impressed the entire team.', target_length: 7, target_hash: '', oracle_hints: ['A·····E', 'A·A··Z·E', 'A·A·Y·Z·E'], hint: 'Examine methodically and in detail' },
  { id: 'm4', question_text: 'The team celebrated their ________ after months of hard work.', target_length: 7, target_hash: '', oracle_hints: ['V·····Y', 'V·C··R·Y', 'V·C·O·R·Y'], hint: 'Winning a competition' },
  { id: 'm5', question_text: 'She showed great ________ in the face of adversity.', target_length: 10, target_hash: '', oracle_hints: ['R········E', 'R·S····N·E', 'R·S·L·E·N·E'], hint: 'Ability to recover quickly' },
]

async function fetchBatch(): Promise<void> {
  if (isFetchingBatch.value || gameState.value === 'timeout') return
  isFetchingBatch.value = true
  try {
    const res = await fetchWithAuth(`/api/game/questions`)
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

// ── Question loading ──────────────────────────────────────────────────────
async function loadQuestion() {
  gameState.value = 'loading'
  typedLetters.value = []
  oracleRevealLevel.value = 0
  oracleTotalPenalty.value = 0

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

  // Reset per-question start time for Speedster time_taken calculation
  questionStartTime.value = Date.now()

  gameState.value = 'playing'
  await nextTick()
  inputRef.value?.focus()
}

// ── Skip Question Logic (Enter key) ───────────────────────────────────────
async function skipQuestion() {
  if (gameState.value !== 'playing') return
  if (!sessionId.value || !currentQuestion.value.id) {
    // No session (guest/mock): deduct locally only
    if (isAegisMode.value && aegisShieldCount.value > 0) {
      aegisShieldCount.value--
      spawnPointPopup(0, 'shield_blocked')
    } else {
      score.value = Math.max(0, score.value - 10)
      spawnPointPopup(10, 'wrong')
    }
    currentCombo.value = 0
    if (isMissionCore.value) missionProgress.value = 0
    typedLetters.value = []
    triggerScoreFlash('wrong')
    loadQuestion()
    return
  }

  // Capture state before reset
  const questionId = currentQuestion.value.id
  const capturedOracleLevel = oracleRevealLevel.value
  const capturedCombo = currentCombo.value

  // Immediate local feedback
  gameState.value = 'wrong'
  currentCombo.value = 0
  if (isMissionCore.value) missionProgress.value = 0
  if (isAegisMode.value) aegisShieldCount.value = Math.max(0, aegisShieldCount.value - 1)
  typedLetters.value = []
  triggerScoreFlash('wrong')

  // Advance immediately (skip = instant move to next)
  loadQuestion()

  // Notify server: send empty string as answer (server treats it as a full skip/wrong)
  const timeTaken = Date.now() - questionStartTime.value
  const mySeq = ++submitAnswerSeq
    ; (async () => {
      try {
        const res = await fetchWithAuth(`/api/game/submit-answer`, {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId.value,
            question_id: questionId,
            answer: '',            // empty = full skip
            current_combo: capturedCombo,
            active_core_id: activeCoreId.value,
            oracle_reveal_level: capturedOracleLevel,
            time_taken: timeTaken
          })
        })
        if (res.ok) {
          const data = await res.json()
          
          score.value = data.new_total_score ?? score.value
          questionsAnswered.value = data.questions_answered ?? questionsAnswered.value
          
          // Only show popup if it's the latest question to avoid spam, but ALWAYS update history
          if (mySeq === submitAnswerSeq) {
            if (data.breakdown?.shield_blocked) {
              spawnPointPopup(0, 'shield_blocked')
            } else {
              spawnPointPopup(data.points_deducted, 'wrong')
            }
          }
            
          matchHistory.value.push({
            submitted: '(Skipped)',
            correct: data.correct_word || '???',
            isCorrect: false
          })
        }
      } catch (err) {
        console.error('Failed to sync skip:', err)
      }
    })()
}

// ── Input handling ────────────────────────────────────────────────────────
function handleKeydown(e: KeyboardEvent) {
  if (gameState.value === 'timeout') return
  if (gameState.value !== 'playing') return
  if (menuOpen.value || confirmQuit.value) return

  // Skip question when Enter is pressed
  if (e.key === 'Enter') {
    skipQuestion()
    return
  }

  if (e.key === 'Backspace') {
    typedLetters.value = typedLetters.value.slice(0, -1)
    return
  }

  if (/^[a-zA-Z]$/.test(e.key)) {
    const maxLen = currentQuestion.value.target_length
    if (typedLetters.value.length >= maxLen) return

    typedLetters.value = [...typedLetters.value, e.key.toLowerCase()]
    if (typedLetters.value.length === maxLen) checkAnswer()
  }
}
async function sha256(message: string) {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

async function checkAnswer() {
  const maxLen = currentQuestion.value.target_length
  if (typedLetters.value.length < maxLen) return

  const typed = typedLetters.value.join('')

  const questionId = currentQuestion.value.id
  const capturedOracleLevel = oracleRevealLevel.value
  const capturedCombo = currentCombo.value

  const hashVal = await sha256(typed)
  const isCorrectLocal = hashVal === currentQuestion.value.target_hash

  if (isCorrectLocal) {
    gameState.value = 'correct'
    currentCombo.value++
    if (isMissionCore.value) {
      missionProgress.value = (missionProgress.value + 1)
      if (missionProgress.value > 5) missionProgress.value = 1
    }
    if (isAegisMode.value) {
      aegisShieldCount.value = Math.min(3, aegisShieldCount.value + 1)
    }
    triggerScoreFlash('correct')
  } else {
    gameState.value = 'wrong'
    currentCombo.value = 0
    if (isMissionCore.value) missionProgress.value = 0
    if (isAegisMode.value) aegisShieldCount.value = Math.max(0, aegisShieldCount.value - 1)
    triggerScoreFlash('wrong')
  }

  if (!sessionId.value || !questionId) {
    setTimeout(() => {
      if (gameState.value !== 'timeout') loadQuestion()
    }, FEEDBACK_MS)
    return
  }

  const timeTaken = Date.now() - questionStartTime.value
  const mySeq = ++submitAnswerSeq

  // If local check is correct, transition to next question immediately after FEEDBACK_MS
  if (isCorrectLocal) {
    setTimeout(() => {
      if (gameState.value !== 'timeout' && mySeq === submitAnswerSeq) loadQuestion()
    }, FEEDBACK_MS)
  }

    ; (async () => {
      try {
        const res = await fetchWithAuth(`/api/game/submit-answer`, {
          method: 'POST',
          body: JSON.stringify({
            session_id: sessionId.value,
            question_id: questionId,
            answer: typed,
            current_combo: capturedCombo,
            active_core_id: activeCoreId.value,
            oracle_reveal_level: capturedOracleLevel,
            time_taken: timeTaken
          })
        })

        if (res.ok) {
          const data = await res.json()

          const startScore = score.value
          const targetScore = data.new_total_score ?? score.value
          const duration = 500
          const startTime = performance.now()

          function animateScore(currentTime: number) {
            const elapsed = currentTime - startTime
            const progress = Math.min(elapsed / duration, 1)
            score.value = Math.floor(startScore + (targetScore - startScore) * progress)
            if (progress < 1) requestAnimationFrame(animateScore)
          }
          requestAnimationFrame(animateScore)

          questionsAnswered.value = data.questions_answered ?? questionsAnswered.value
          pointsEarned.value = data.points_earned ?? pointsEarned.value
          pointsDeducted.value = data.points_deducted ?? pointsDeducted.value

          if (mySeq === submitAnswerSeq && !data.correct && data.correct_word) {
            currentQuestion.value.correct_word = data.correct_word
          }

          matchHistory.value.push({
            submitted: typed,
            correct: data.correct ? typed : (data.correct_word || '???'),
            isCorrect: data.correct
          })

          if (mySeq === submitAnswerSeq) {
            if (data.breakdown?.mission_completed === 1) {
              showMissionCelebration.value = true
              setTimeout(() => {
                showMissionCelebration.value = false
                missionProgress.value = 0
              }, 2000)
            }

            if (data.breakdown?.shield_blocked) {
              spawnPointPopup(0, 'shield_blocked')
            } else if (data.correct && isSpeedsterCore.value) {
              spawnPointPopup(data.points_earned, 'speedster')
            } else {
              const popupType: 'correct' | 'wrong' | 'typo' = data.correct
                ? 'correct'
                : (data.penalty_type === 'typo' ? 'typo' : 'wrong')
              spawnPointPopup(
                data.correct ? data.points_earned : data.points_deducted,
                popupType
              )
            }
          }

        }
      } catch (err) {
        console.error('Failed to sync answer:', err)
      } finally {
        if (!isCorrectLocal && mySeq === submitAnswerSeq) {
          setTimeout(() => {
            if (gameState.value !== 'timeout') loadQuestion()
          }, FEEDBACK_MS)
        }
      }
    })()
}

function resetTypingBoard() {
  gameState.value = 'timeout'
  matchHistory.value = []
  stopTimeoutInterval()
  // NOTE: intentionally NOT resetting score, questionsAnswered, pointsEarned, pointsDeducted
  timeLeft.value = MATCH_DURATION
  timerProgressPercent.value = 100
  typedLetters.value = []
  currentCombo.value = 0
  missionProgress.value = 0
  aegisShieldCount.value = 0
  scoreFlash.value = null
  pointPopups.value = []
  oracleRevealLevel.value = 0
  questionQueue.value = []
}

function triggerTimeout() {
  gameState.value = 'timeout'
  inputRef.value?.blur()
  
  timeoutCountdown.value = 15
  stopTimeoutInterval()
  timeoutInterval = setInterval(() => {
    timeoutCountdown.value--
    if (timeoutCountdown.value <= 0) {
      stopTimeoutInterval()
      restartMatch()
    }
  }, 1000)

  // Only tell the backend the session is over if it's the final round!
  // Otherwise, we keep the session alive to retain score and anti-cheat tracking.
  const sid = sessionId.value
  const coreId = activeCoreId.value
  const oracleLvl = oracleRevealLevel.value
  
  if (sid && matchStore.isFinalRound()) {
    setTimeout(() => callTimeoutEndpoint(sid, coreId, oracleLvl), 300)
  }
}

// ── Match control ──────────────────────────────────────────────────────────
async function restartMatch() {
  if (matchStore.isFinalRound()) {
    // Match Over! Transition to End Screen
    console.log('Match Over! Proceeding to results...')
    router.push('/match-end')
    return
  }

  // Next Round
  matchStore.incrementRound()
  resetTypingBoard()
  
  // Transition to loading and fetch next batch
  // Note: We DO NOT call createSession() here so the backend continues the same session!
  gameState.value = 'loading'
  await fetchBatch(3)
  
  if (questionQueue.value.length > 0) {
    await loadQuestion()
    gameState.value = 'playing'
    startMatchTimer()
  } else {
    // Fallback if fetch completely failed
    gameState.value = 'playing'
    startMatchTimer()
  }
}

function goHome() {
  stopMatchTimer()
  stopTimeoutInterval()
  abandonCurrentSession()
  router.push('/home')
}

async function abandonCurrentSession() {
  if (!sessionId.value || gameState.value === 'timeout') return
  try {
    await fetchWithAuth(`/api/game/abandon`, {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId.value })
    })
  } catch (err) {
    console.error('Failed to abandon session:', err)
  }
}

// ── Misc ───────────────────────────────────────────────────────────────────
function handleOutsideClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

function refocusInput() {
  if (gameState.value === 'timeout') return
  if (!menuOpen.value && !confirmQuit.value) inputRef.value?.focus()
}

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  if (gameState.value === 'playing') {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(async () => {
  if (!activeCoreId.value) {
    router.replace('/core-selection')
    return
  }

  await createSession()
  await fetchBatch()
  await loadQuestion()
  startMatchTimer()
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  stopMatchTimer()
  stopTimeoutInterval()
  if (flashTimer) clearTimeout(flashTimer)
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.cyber-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 64px 64px;
}

.score-bar-fill {
  transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.float-pts-item {
  text-shadow: 0 0 12px currentColor;
  white-space: nowrap;
}

.float-pts-enter-active {
  animation: floatUp 1.2s ease-out forwards;
}

.mission-celebration-enter-active {
  animation: missionCelebIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
}
.mission-celebration-leave-active {
  transition: opacity 0.3s ease-in;
}
.mission-celebration-enter-from,
.mission-celebration-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

@keyframes missionCelebIn {
  0% {
    opacity: 0;
    transform: scale(0.5);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.float-pts-leave-active {
  display: none;
}

@keyframes floatUp {
  0% {
    opacity: 1;
    transform: translateY(0) scale(1.2);
  }

  20% {
    opacity: 1;
    transform: translateY(-16px) scale(1.35);
  }

  80% {
    opacity: 0.7;
    transform: translateY(-56px) scale(1);
  }

  100% {
    opacity: 0;
    transform: translateY(-80px) scale(0.85);
  }
}

/* ── Speedster FAST! popup ──────────────────────────────────────────────── */
.speedster-popup {
  animation: fastPopup 1.8s cubic-bezier(0.22, 1, 0.36, 1) forwards !important;
}

.speedster-fast-text {
  display: inline-block;
  font-size: 2rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(90deg, #67e8f9, #06b6d4, #ffffff, #06b6d4, #67e8f9);
  background-size: 200% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 24px rgba(103, 232, 249, 0.6));
  animation: shimmerFast 0.6s linear infinite;
}

@keyframes shimmerFast {
  to {
    background-position: 200% center;
  }
}

@keyframes fastPopup {
  0% {
    opacity: 0;
    transform: translateY(10px) scale(0.6) skewX(-8deg);
  }

  10% {
    opacity: 1;
    transform: translateY(-10px) scale(1.5) skewX(4deg);
  }

  25% {
    opacity: 1;
    transform: translateY(-30px) scale(1.2) skewX(-2deg);
  }

  70% {
    opacity: 0.9;
    transform: translateY(-80px) scale(1.05) skewX(0deg);
  }

  100% {
    opacity: 0;
    transform: translateY(-120px) scale(0.8) skewX(0deg);
  }
}

/* ── Speedster timer glow ───────────────────────────────────────────────── */
.speedster-timer-glow {
  animation: speedTimerPulse 0.8s ease-in-out infinite;
  color: #67e8f9;
}

.speedster-timer-icon {
  animation: speedTimerPulse 0.8s ease-in-out infinite;
  color: #67e8f9;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.8));
}

@keyframes speedTimerPulse {

  0%,
  100% {
    text-shadow: 0 0 8px rgba(6, 182, 212, 0.6), 0 0 16px rgba(103, 232, 249, 0.3);
    filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.8));
  }

  50% {
    text-shadow: 0 0 20px rgba(6, 182, 212, 1), 0 0 40px rgba(103, 232, 249, 0.8), 0 0 60px rgba(255, 255, 255, 0.3);
    filter: drop-shadow(0 0 14px rgba(6, 182, 212, 1)) drop-shadow(0 0 28px rgba(103, 232, 249, 0.6));
  }
}

/* ── Speedster wind streaks ─────────────────────────────────────────────── */
.speedster-wind-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
}

.wind-streak {
  position: absolute;
  left: -160px;
  height: 2px;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.7), rgba(255, 255, 255, 0.9), transparent);
  animation: windMove 0.9s linear infinite;
  filter: blur(1px);
  opacity: 0;
}

.ws1 {
  top: 18%;
  width: 160px;
  animation-delay: 0s;
  animation-duration: 0.75s;
}

.ws2 {
  top: 35%;
  width: 220px;
  animation-delay: 0.15s;
  animation-duration: 0.90s;
}

.ws3 {
  top: 50%;
  width: 140px;
  animation-delay: 0.05s;
  animation-duration: 0.65s;
}

.ws4 {
  top: 62%;
  width: 200px;
  animation-delay: 0.30s;
  animation-duration: 0.80s;
}

.ws5 {
  top: 28%;
  width: 100px;
  animation-delay: 0.42s;
  animation-duration: 0.70s;
}

.ws6 {
  top: 75%;
  width: 180px;
  animation-delay: 0.22s;
  animation-duration: 0.95s;
}

@keyframes windMove {
  0% {
    transform: translateX(0);
    opacity: 0;
  }

  15% {
    opacity: 0.9;
  }

  80% {
    opacity: 0.6;
  }

  100% {
    transform: translateX(calc(100vw + 260px));
    opacity: 0;
  }
}

.speedster-slots-glow {
  filter: drop-shadow(0 0 8px rgba(6, 182, 212, 0.35));
  transition: filter 0.3s ease;
}

.wind-fade-enter-active {
  transition: opacity 0.4s ease;
}

.wind-fade-leave-active {
  transition: opacity 0.4s ease;
}

.wind-fade-enter-from {
  opacity: 0;
}

.wind-fade-leave-to {
  opacity: 0;
}

.score-pop-correct {
  animation: scoreScaleCorrect 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.score-pop-wrong {
  animation: scoreScaleWrong 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

@keyframes scoreScaleCorrect {
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

@keyframes scoreScaleWrong {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.4);
    text-shadow: 0 0 15px rgba(230, 57, 70, 0.9);
  }

  100% {
    transform: scale(1);
  }
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
  animation: panel-in 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
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
  transition: opacity 0.3s;
}

.timeout-overlay-enter-from,
.timeout-overlay-leave-to {
  opacity: 0;
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

.card-flip-enter-active,
.card-flip-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.card-flip-enter-from {
  opacity: 0;
  transform: rotateX(-90deg) scale(0.9);
}

.card-flip-leave-to {
  opacity: 0;
  transform: rotateX(90deg) scale(0.9);
}

.glow-sweep {
  animation: sweepWave 1s ease-in-out infinite;
  display: inline-block;
}

@keyframes sweepWave {

  0%,
  100% {
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


/* ── INTENSE WILDFIRE EFFECT (Thuần CSS) ────────────────────────────── */
.burning-edge-active {
  position: relative;
  border-color: rgba(255, 69, 0, 0.8) !important;
  box-shadow: inset 0 0 40px rgba(255, 69, 0, 0.6) !important;
}

/* Layer lửa bốc rộng ra xung quanh */
.burning-edge-active::before,
.burning-edge-active::after {
  content: '';
  position: absolute;
  /* Kéo dài lửa ra khỏi viền 50px */
  inset: -50px;
  border-radius: 40px;
  z-index: -1;
  pointer-events: none;
  mix-blend-mode: screen;
  filter: blur(15px);
}

/* Lớp lửa màu đỏ/cam chớp nháy dưới nền */
.burning-edge-active::before {
  background:
    radial-gradient(circle at 20% 100%, rgba(255, 0, 0, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 80% 100%, rgba(255, 69, 0, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 50% -20%, rgba(255, 140, 0, 0.6) 0%, transparent 60%);
  animation: wildFireBase 0.3s infinite alternate ease-in-out;
}

/* Lớp lửa màu vàng rực bốc cao lên trên */
/* ── BURNING EDGE (Box nằm im, Lửa chỉ cháy bên ngoài) ───────────────── */

.burning-edge-active {
  position: relative;
  /* Đổi màu viền box thành cam cho đồng bộ với lửa */
  border-color: rgba(255, 100, 0, 0.8) !important;
  /* KHÔNG có transform rung lắc, KHÔNG có inset shadow để bên trong sạch sẽ */
}

/* Layer lửa bám sát vòng quanh mép ngoài của box */
.burning-edge-active::before {
  content: '';
  position: absolute;
  /* inset: 0 giúp layer này to đúng bằng cái box, không tràn vào trong */
  inset: 0;
  border-radius: inherit;
  z-index: -1;
  /* Nằm dưới cái box */
  pointer-events: none;

  /* Hiệu ứng ngọn lửa chỉ tỏa ra ngoài */
  animation: outerFlames 0.4s infinite alternate ease-in-out;
}

@keyframes outerFlames {
  0% {
    box-shadow:
      0 -10px 15px rgba(255, 165, 0, 0.6),
      /* Lửa trên */
      0 10px 15px rgba(255, 69, 0, 0.5),
      /* Lửa dưới */
      10px 0 15px rgba(255, 69, 0, 0.5),
      /* Lửa phải */
      -10px 0 15px rgba(255, 165, 0, 0.5);
    /* Lửa trái */
  }

  100% {
    box-shadow:
      0 -40px 45px rgba(255, 100, 0, 0.9),
      /* Lửa bốc cao mạnh lên phía trên */
      0 20px 30px rgba(255, 0, 0, 0.7),
      /* Lửa dưới tỏa ra */
      25px 0 35px rgba(255, 100, 0, 0.8),
      /* Lửa hắt sang 2 bên */
      -25px 0 35px rgba(255, 0, 0, 0.8),
      0 0 20px rgba(255, 255, 255, 0.3);
    /* Lõi sáng chớp nhẹ ở mép */
  }
}
</style>