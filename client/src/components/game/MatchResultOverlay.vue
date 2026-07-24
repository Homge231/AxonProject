<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '../../stores/settingsStore'

const props = defineProps<{
  isVisible: boolean
  isVictory: boolean
  // Player data
  playerScore: number
  playerName: string
  playerAvatar: string
  questionsAnswered: number
  matchHistory: Array<{ round: number; submitted: string; correct: string; isCorrect: boolean }>
  matchDurationMs: number
  // Opponent/Comparison data  
  opponentScore: number
  opponentName: string
  opponentAvatar?: string
  // Mode
  isMultiplayer: boolean
}>()

const emit = defineEmits<{
  (e: 'playAgain'): void
  (e: 'goHome'): void
  (e: 'showFeedback'): void
}>()

const settingsStore = useSettingsStore()

const animatedPlayerScore = ref(0)
const animatedOpponentScore = ref(0)

const correctCount = computed(() => props.matchHistory.filter(h => h.isCorrect).length)
const totalCount = computed(() => props.matchHistory.length)
const accuracy = computed(() => totalCount.value > 0 ? ((correctCount.value / totalCount.value) * 100).toFixed(1) : '0.0')

// WPM: (total chars of correct answers / 5) / (match duration in minutes)
// Standard WPM formula uses 5 chars = 1 word
const avgWpm = computed(() => {
  if (totalCount.value === 0) return 0
  const totalCorrectChars = props.matchHistory
    .filter(h => h.isCorrect)
    .reduce((sum, h) => sum + h.submitted.length, 0)
  const durationMinutes = (props.matchDurationMs || 180000) / 60000
  if (durationMinutes <= 0) return 0
  return Math.round((totalCorrectChars / 5) / durationMinutes)
})



let animationFrameId: number
function animateValue(obj: any, start: number, end: number, duration: number) {
  let startTimestamp: number | null = null;
  const step = (timestamp: number) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    const easeOutCubic = 1 - Math.pow(1 - progress, 3);
    obj.value = Math.floor(start + easeOutCubic * (end - start));
    if (progress < 1) {
      animationFrameId = window.requestAnimationFrame(step);
    } else {
      obj.value = end;
    }
  };
  animationFrameId = window.requestAnimationFrame(step);
}

watch(() => props.isVisible, (newVal) => {
  if (newVal) {
    animatedPlayerScore.value = 0
    animatedOpponentScore.value = 0
    
    setTimeout(() => {
      animateValue(animatedPlayerScore, 0, props.playerScore, 1500)
      animateValue(animatedOpponentScore, 0, props.opponentScore, 1500)
    }, 500)
  } else {
    if (animationFrameId) window.cancelAnimationFrame(animationFrameId)
  }
})

// Confetti setup for Victory
const confettiPieces = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  animationDelay: Math.random() * 3,
  animationDuration: 3 + Math.random() * 2,
  color: ['#FFD700', '#FFA500', '#FF8C00', '#F0E68C', '#FFF8DC'][Math.floor(Math.random() * 5)],
  width: 5 + Math.random() * 10,
  height: 5 + Math.random() * 10,
  isCircle: Math.random() > 0.5
}))
</script>

<template>
  <transition name="result-overlay">
    <div v-if="isVisible" 
         class="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-xl transition-all duration-700"
         :class="{'vignette-defeat': !isVictory && settingsStore.vfxEnabled}">
      
      <!-- Confetti Layer -->
      <div v-if="isVictory && settingsStore.vfxEnabled" class="fixed inset-0 overflow-hidden pointer-events-none">
        <div v-for="piece in confettiPieces" :key="piece.id" class="absolute top-[-100px] confetti-piece"
             :style="{ 
               left: piece.left + '%', 
               animationDelay: piece.animationDelay + 's', 
               animationDuration: piece.animationDuration + 's',
               backgroundColor: piece.color,
               width: piece.width + 'px',
               height: piece.height + 'px',
               borderRadius: piece.isCircle ? '50%' : '0'
             }">
        </div>
      </div>
      
      <!-- Main Panel -->
      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-darkNavy/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 cyber-grid flex flex-col items-center result-panel"
           :class="[
             isVictory && settingsStore.vfxEnabled ? 'border-yellow-500/30 shadow-[0_0_40px_rgba(255,215,0,0.15)]' : '',
             !isVictory && settingsStore.vfxEnabled ? 'border-red-500/30 shadow-[0_0_30px_rgba(220,38,38,0.1)]' : ''
           ]">
           
        <!-- Header -->
        <div class="text-center mb-10 flex flex-col items-center">
          <div class="text-6xl mb-2">{{ isVictory ? '🏆' : '💀' }}</div>
          <h1 class="text-7xl font-black italic tracking-widest uppercase text-transparent bg-clip-text"
              :class="[
                isVictory ? 'bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500' : 'bg-gradient-to-r from-red-400 via-red-600 to-red-800',
                settingsStore.vfxEnabled && isVictory ? 'drop-shadow-[0_0_40px_rgba(255,215,0,0.6)]' : '',
                settingsStore.vfxEnabled && !isVictory ? 'drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]' : ''
              ]">
            {{ isVictory ? 'VICTORY!' : 'DEFEAT' }}
          </h1>
        </div>

        <!-- Score Comparison -->
        <div class="flex w-full justify-between items-center mb-10 gap-4">
          <!-- Player Score Panel -->
          <div class="flex-1 flex flex-col items-center p-6 rounded-xl border border-white/5 bg-black/40"
               :class="[isVictory && settingsStore.vfxEnabled ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : '']">
            <img v-if="playerAvatar" :src="playerAvatar" class="w-16 h-16 rounded-full mb-3 border-2 border-white/20" alt="Player Avatar" />
            <div class="text-[10px] tracking-widest uppercase text-white/50 mb-1">{{ playerName }}</div>
            <div class="text-5xl font-black" :class="isVictory ? 'text-green-400' : 'text-white'">
              {{ animatedPlayerScore }}
            </div>
          </div>

          <div class="text-3xl font-black text-white/20 px-4 italic">VS</div>

          <!-- Opponent Score Panel -->
          <div class="flex-1 flex flex-col items-center p-6 rounded-xl border border-white/5 bg-black/40"
               :class="[!isVictory && settingsStore.vfxEnabled ? 'border-green-500/30 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : '']">
            <template v-if="opponentAvatar">
              <img :src="opponentAvatar" class="w-16 h-16 rounded-full mb-3 border-2 border-white/20" alt="Opponent Avatar" />
            </template>
            <template v-else>
              <div class="w-16 h-16 rounded-full mb-3 border-2 border-white/20 bg-white/5 flex items-center justify-center text-3xl">🎯</div>
            </template>
            <div class="text-[10px] tracking-widest uppercase text-white/50 mb-1">{{ opponentName }}</div>
            <div class="text-5xl font-black" :class="!isVictory ? 'text-green-400' : 'text-white'">
              {{ animatedOpponentScore }}
            </div>
          </div>
        </div>

        <!-- Stats Breakdown Grid -->
        <div class="w-full grid grid-cols-3 gap-4 mb-10">
          <div class="stat-row bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center" style="animation-delay: 0.1s">
            <span class="text-[10px] tracking-widest uppercase text-white/50 mb-1">Avg WPM</span>
            <span class="text-3xl font-black text-orange">{{ avgWpm }}</span>
          </div>
          <div class="stat-row bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center" style="animation-delay: 0.2s">
            <span class="text-[10px] tracking-widest uppercase text-white/50 mb-1">Accuracy</span>
            <span class="text-3xl font-black text-lightBlue">{{ accuracy }}%</span>
          </div>
          <div class="stat-row bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center" style="animation-delay: 0.3s">
            <span class="text-[10px] tracking-widest uppercase text-white/50 mb-1">Questions</span>
            <span class="text-3xl font-black text-white">
              <span class="text-success">{{ correctCount }}</span>
              <span class="text-white/30 text-xl mx-1">/</span>
              <span class="text-hexred">{{ totalCount - correctCount }}</span>
            </span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex justify-center gap-4 w-full">
          <button @click="emit('goHome')" class="px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
            Home
          </button>
          <button @click="emit('showFeedback')" class="px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 transition-all text-white shadow-lg">
            Feedback
          </button>
          <button @click="emit('playAgain')" class="px-8 py-3 rounded-lg font-bold uppercase tracking-widest text-sm bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all text-white shadow-lg"
                  :class="{'animate-pulse': settingsStore.vfxEnabled}">
            Play Again
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.cyber-grid {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Transitions */
.result-overlay-enter-active,
.result-overlay-leave-active {
  transition: opacity 0.6s ease-out;
}
.result-overlay-enter-active .result-panel {
  transition: transform 0.6s ease-out;
}
.result-overlay-enter-from,
.result-overlay-leave-to {
  opacity: 0;
}
.result-overlay-enter-from .result-panel {
  transform: scale(0.85);
}

.vignette-defeat {
  background: radial-gradient(circle, rgba(0,0,0,0.85) 40%, rgba(120,0,0,0.3) 100%);
}

/* Animations */
@keyframes slideInUp {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

.stat-row {
  opacity: 0;
  animation: slideInUp 0.5s ease-out forwards;
}

@keyframes confettiFall {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
}

.confetti-piece {
  animation-name: confettiFall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
</style>
