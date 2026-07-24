<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans selection:bg-orange/40 flex flex-col">
    <!-- Background glows -->
    <div class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center p-8 lg:px-12">
      <div class="flex items-center gap-4 cursor-pointer" @click="router.push('/home'); audioService.playClick()">
        <button @mouseenter="audioService.playHover()" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest text-xs font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to Lobby
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-20 flex-1 flex flex-col items-center px-8 pb-12 overflow-y-auto custom-scrollbar">
      <div class="w-full max-w-4xl flex flex-col gap-8">
        
        <!-- Title -->
        <div>
          <h2 class="text-5xl lg:text-6xl font-black italic uppercase tracking-tighter mb-2">
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue to-lightBlue">Vocabulary</span>
            <span class="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] ml-4">Analytics</span>
          </h2>
          <p class="text-gray-400 text-sm tracking-wider uppercase border-l-2 border-lightBlue pl-4">
            Track your proficiency across different topics. Find your weak spots and master them with AI assistance.
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <svg class="animate-spin w-12 h-12 text-lightBlue" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-xs tracking-[0.2em] uppercase text-gray-400 font-bold animate-pulse">Syncing Database...</span>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-hexred/10 border border-hexred/30 rounded-xl p-6 text-center">
          <p class="text-hexred font-bold tracking-widest uppercase text-sm mb-2">Sync Failed</p>
          <p class="text-gray-300 text-sm">{{ error }}</p>
          <button @click="fetchAnalytics" class="mt-4 px-6 py-2 bg-hexred/20 hover:bg-hexred/40 border border-hexred/50 text-white rounded transition-colors uppercase tracking-widest text-xs font-bold">
            Retry
          </button>
        </div>

        <!-- Empty State -->
        <div v-else-if="analyticsData.length === 0" class="bg-black/30 border border-white/5 rounded-xl p-12 text-center backdrop-blur-sm">
          <p class="text-gray-400 text-sm tracking-widest uppercase mb-4">No data available yet</p>
          <p class="text-gray-500 text-xs">Play some matches to start generating your vocabulary proficiency report.</p>
          <button @click="router.push('/home')" class="mt-8 px-8 py-3 bg-gradient-to-r from-orange to-hexred text-white font-black uppercase tracking-widest text-sm rounded shadow-[0_0_15px_rgba(230,57,70,0.3)] hover:shadow-[0_0_25px_rgba(230,57,70,0.6)] transition-all">
            Play Now
          </button>
        </div>

        <!-- Dashboard Content -->
        <div v-else class="flex flex-col gap-8">

          <!-- AI PERSONAL LEARNING COACH CARD -->
          <div class="relative bg-black/50 backdrop-blur-xl border border-lightBlue/30 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] overflow-hidden transition-all duration-300">
            <!-- Decorative Glow Bar -->
            <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange via-lightBlue to-success"></div>

            <!-- Card Header -->
            <div class="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div class="flex items-center gap-3">
                <!-- AI Avatar Orb -->
                <div class="relative w-11 h-11 rounded-full p-0.5 bg-gradient-to-br from-orange via-lightBlue to-blue flex items-center justify-center shadow-[0_0_15px_rgba(96,165,250,0.4)]">
                  <div class="w-full h-full rounded-full bg-darkNavy flex items-center justify-center">
                    <span class="text-xl">🤖</span>
                  </div>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="font-black text-lg uppercase tracking-wider text-white">Naenra AI Coach</h3>
                    <span class="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-lightBlue/20 border border-lightBlue/40 text-lightBlue">
                      Personal Assistant
                    </span>
                  </div>
                  <p class="text-[10px] text-gray-400 tracking-widest uppercase">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>

              <!-- Question quota counter -->
              <div v-if="aiStarted" class="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Follow-ups:</span>
                <div class="flex gap-1">
                  <span 
                    v-for="n in 5" 
                    :key="n" 
                    class="w-2 h-2 rounded-full transition-all"
                    :class="n <= followUpCount ? 'bg-orange shadow-[0_0_6px_rgba(255,123,0,0.8)]' : 'bg-white/20'"
                  ></span>
                </div>
                <span class="text-xs font-mono font-bold text-lightOrange ml-1">{{ 5 - followUpCount }}/5</span>
              </div>
            </div>

            <!-- AI Coach Body -->
            <div class="mt-5">
              <!-- Initial Call to Action -->
              <div v-if="!aiStarted && !aiLoading" class="flex flex-col items-center justify-center py-6 text-center gap-4">
                <p class="text-gray-300 text-sm max-w-lg">
                  Get instant, personalized feedback on your typing accuracy, weak word patterns, and a custom 3-step action plan generated directly from your match statistics.
                </p>
                <button 
                  @click="generateInitialAnalysis"
                  @mouseenter="audioService.playHover()"
                  class="px-6 py-3 bg-gradient-to-r from-blue to-lightBlue hover:from-lightBlue hover:to-blue text-darkNavy font-black uppercase tracking-widest text-xs rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>✨ Generate AI Learning Report</span>
                </button>
              </div>

              <!-- AI Loading Spinner -->
              <div v-if="aiLoading" class="flex flex-col items-center justify-center py-8 gap-3">
                <div class="relative w-12 h-12 flex items-center justify-center">
                  <div class="absolute inset-0 rounded-full border-2 border-lightBlue/20 animate-ping"></div>
                  <div class="w-10 h-10 rounded-full border-2 border-lightBlue border-t-transparent animate-spin"></div>
                  <span class="absolute text-sm">🤖</span>
                </div>
                <span class="text-xs tracking-[0.2em] uppercase text-lightBlue font-bold animate-pulse">
                  Analyzing vocabulary weak points...
                </span>
              </div>

              <!-- AI Error -->
              <div v-if="aiError" class="bg-hexred/10 border border-hexred/30 rounded-xl p-4 text-center my-3">
                <p class="text-hexred text-xs font-bold uppercase tracking-wider mb-1">AI Coach Error</p>
                <p class="text-gray-300 text-xs">{{ aiError }}</p>
                <button @click="generateInitialAnalysis" class="mt-2 text-[10px] text-lightOrange hover:underline uppercase tracking-widest font-bold">
                  Try Again
                </button>
              </div>

              <!-- AI Report & Conversation Container -->
              <div v-if="aiStarted && !aiLoading" class="flex flex-col gap-4">
                <!-- Initial Analysis Bubble -->
                <div class="bg-white/5 border border-white/10 rounded-xl p-5 text-sm text-gray-200 leading-relaxed shadow-inner">
                  <div class="flex items-center gap-2 text-xs font-bold text-lightBlue uppercase tracking-widest mb-3 border-b border-white/5 pb-2">
                    <span>💡 Personalized Learning Plan</span>
                  </div>
                  <div class="prose prose-invert max-w-none text-xs sm:text-sm" v-html="renderedReport"></div>
                  <!-- Cursor while typing -->
                  <span v-if="isTyping" class="inline-block w-2 h-4 bg-lightBlue animate-pulse ml-1 align-middle"></span>
                </div>

                <!-- Follow-up Conversation Threads -->
                <div v-for="(chat, idx) in chatHistory" :key="idx" class="flex flex-col gap-2">
                  <!-- User Message -->
                  <div v-if="chat.role === 'user'" class="self-end bg-blue-900/40 border border-blue-500/30 rounded-xl rounded-tr-none px-4 py-2.5 max-w-[85%] text-xs text-white shadow-md">
                    <p class="font-bold text-[9px] text-blue-300 uppercase tracking-widest mb-0.5">You</p>
                    <p>{{ chat.message }}</p>
                  </div>
                  <!-- AI Response -->
                  <div v-else class="self-start bg-white/5 border border-white/10 rounded-xl rounded-tl-none px-4 py-3 max-w-[90%] text-xs text-gray-200 shadow-md">
                    <p class="font-bold text-[9px] text-lightBlue uppercase tracking-widest mb-1 flex items-center gap-1">
                      <span>🤖 AI Coach</span>
                    </p>
                    <div class="prose prose-invert max-w-none" v-html="renderMarkdown(chat.message)"></div>
                  </div>
                </div>

                <!-- Follow-up Input Box -->
                <div v-if="!isTyping" class="mt-2 pt-3 border-t border-white/10">
                  <div v-if="followUpCount < 5" class="flex gap-2">
                    <input 
                      v-model="userQuestion"
                      @keyup.enter="sendFollowUp"
                      type="text"
                      placeholder="Ask AI Coach a question (e.g., 'How can I master Science terms?')..."
                      class="flex-1 bg-black/40 border border-white/15 focus:border-lightBlue rounded-xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-colors"
                      :disabled="isSendingFollowUp"
                    />
                    <button 
                      @click="sendFollowUp"
                      @mouseenter="audioService.playHover()"
                      :disabled="!userQuestion.trim() || isSendingFollowUp"
                      class="px-5 py-2.5 bg-lightBlue/20 hover:bg-lightBlue/30 border border-lightBlue/40 disabled:opacity-40 disabled:cursor-not-allowed text-lightBlue font-bold uppercase tracking-widest text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <svg v-if="isSendingFollowUp" class="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{{ isSendingFollowUp ? 'Thinking...' : 'Ask' }}</span>
                    </button>
                  </div>
                  <div v-else class="text-center py-2 bg-white/5 rounded-xl border border-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                    🔒 Maximum follow-up limit (5/5) reached for this session.
                  </div>
                </div>

              </div>
            </div>
          </div>

          <!-- TOPIC CARDS SECTION -->
          <div class="flex flex-col gap-6">
            <h3 class="text-lg font-black uppercase tracking-wider text-gray-300 flex items-center gap-2">
              <span>📊 Topic Performance Overview</span>
            </h3>

            <div v-for="item in analyticsData" :key="item.topic" class="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-lightBlue/30 transition-colors group">
              <div class="flex justify-between items-end mb-4">
                <div>
                  <h3 class="text-xl font-bold uppercase tracking-wider text-white group-hover:text-lightBlue transition-colors flex items-center gap-2">
                    {{ formatTopicName(item.topic) }}
                    <span class="text-[10px] px-2 py-0.5 rounded border uppercase tracking-widest font-black" :class="getMasteryClass(item.accuracy)">
                      {{ getMasteryLabel(item.accuracy) }}
                    </span>
                  </h3>
                  <p class="text-[10px] text-gray-500 tracking-widest uppercase mt-1">
                    {{ item.correctAnswers }} / {{ item.totalQuestions }} Correct • {{ item.uniqueWordsCount || 0 }} Unique Words
                  </p>
                </div>
                <div class="text-right">
                  <span class="text-3xl font-black italic" :class="getAccuracyColorClass(item.accuracy)">{{ item.accuracy }}%</span>
                  <span class="text-[10px] text-gray-500 tracking-widest uppercase block mt-1">Accuracy</span>
                </div>
              </div>
              
              <!-- Progress Bar -->
              <div class="h-3 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
                <div class="absolute top-0 left-0 h-full transition-all duration-1000 ease-out rounded-full"
                     :class="getAccuracyBgClass(item.accuracy)"
                     :style="{ width: `${item.accuracy}%` }">
                     <!-- Inner glow -->
                     <div class="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"></div>
                </div>
              </div>

              <!-- Weakest Words -->
              <div v-if="item.weakestWords && item.weakestWords.length > 0" class="mt-4 pt-4 border-t border-white/5">
                <p class="text-[10px] text-gray-400 tracking-widest uppercase mb-2">Needs Improvement</p>
                <div class="flex flex-wrap gap-2">
                  <div v-for="w in item.weakestWords" :key="w.word" class="px-2 py-1 bg-hexred/10 border border-hexred/30 rounded text-xs text-white uppercase tracking-wider font-bold shadow-[0_0_10px_rgba(230,57,70,0.2)]">
                    {{ w.word }} <span class="text-hexred/80 ml-1 font-mono text-[10px]">{{ w.incorrect }} misses</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { fetchWithAuth } from '../services/api'
import { audioService } from '../services/audioService'

const router = useRouter()
const authStore = useAuthStore()

interface TopicAnalytics {
  topic: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
  uniqueWordsCount: number
  weakestWords: { word: string; incorrect: number }[]
}

interface ChatMessage {
  role: 'user' | 'model'
  message: string
}

const loading = ref(true)
const error = ref<string | null>(null)
const analyticsData = ref<TopicAnalytics[]>([])

// --- AI COACH STATE ---
const aiStarted = ref(false)
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const rawReportText = ref('')
const displayedReportText = ref('')
const isTyping = ref(false)
let typingTimer: any = null

const userQuestion = ref('')
const isSendingFollowUp = ref(false)
const followUpCount = ref(0)
const chatHistory = ref<ChatMessage[]>([])

const renderedReport = computed(() => renderMarkdown(displayedReportText.value))

async function fetchAnalytics() {
  loading.value = true
  error.value = null
  try {
    const res = await fetchWithAuth('/api/user/analytics')
    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to fetch analytics')
    }
    analyticsData.value = await res.json()
  } catch (err: any) {
    console.error('Failed to fetch vocab analytics:', err)
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function generateInitialAnalysis() {
  audioService.playClick()
  aiStarted.value = true
  aiLoading.value = true
  aiError.value = null
  displayedReportText.value = ''
  rawReportText.value = ''

  try {
    const res = await fetchWithAuth('/api/user/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyticsData: analyticsData.value })
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Failed to get AI Coach report')
    }

    const data = await res.json()
    rawReportText.value = data.analysis || ''
    startTypewriter(rawReportText.value)
  } catch (err: any) {
    console.error('AI Coach Error:', err)
    aiError.value = err.message || 'AI Coach service unavailable'
  } finally {
    aiLoading.value = false
  }
}

function startTypewriter(fullText: string) {
  if (typingTimer) clearInterval(typingTimer)
  isTyping.value = true
  displayedReportText.value = ''

  let idx = 0
  const speedMs = 18 // Typewriter speed

  typingTimer = setInterval(() => {
    if (idx < fullText.length) {
      displayedReportText.value += fullText.charAt(idx)
      idx++
    } else {
      clearInterval(typingTimer)
      typingTimer = null
      isTyping.value = false
    }
  }, speedMs)
}

async function sendFollowUp() {
  const query = userQuestion.value.trim()
  if (!query || isSendingFollowUp.value || followUpCount.value >= 5) return

  audioService.playClick()
  isSendingFollowUp.value = true
  userQuestion.value = ''

  // Add user query to chat UI
  chatHistory.value.push({ role: 'user', message: query })
  followUpCount.value++

  try {
    const res = await fetchWithAuth('/api/user/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        analyticsData: analyticsData.value,
        message: query,
        history: chatHistory.value
      })
    })

    if (!res.ok) {
      throw new Error('Failed to get response from AI Coach')
    }

    const data = await res.json()
    chatHistory.value.push({ role: 'model', message: data.analysis })
  } catch (err: any) {
    chatHistory.value.push({ role: 'model', message: '⚠️ Sorry, I encountered an issue answering your question. Please try again.' })
  } finally {
    isSendingFollowUp.value = false
  }
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-lightBlue font-bold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-orange px-1.5 py-0.5 rounded font-mono text-xs">$1</code>')
    .replace(/^### (.*$)/gim, '<h4 class="text-sm font-bold text-white mt-3 mb-1 uppercase tracking-wider">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-base font-bold text-white mt-3 mb-1 uppercase tracking-wider">$1</h3>')
    .replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-gray-300 my-1">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-gray-300 my-1">$1</li>')
    .replace(/\n/g, '<br/>')
  return html
}

function formatTopicName(topic: string): string {
  if (!topic) return 'Unknown'
  return topic.replace(/-/g, ' ')
}

function getAccuracyColorClass(accuracy: number): string {
  if (accuracy >= 80) return 'text-success drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]'
  if (accuracy >= 50) return 'text-orange drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]'
  return 'text-hexred drop-shadow-[0_0_8px_rgba(230,57,70,0.5)]'
}

function getAccuracyBgClass(accuracy: number): string {
  if (accuracy >= 80) return 'bg-success shadow-[0_0_15px_rgba(16,185,129,0.5)]'
  if (accuracy >= 50) return 'bg-orange shadow-[0_0_15px_rgba(251,146,60,0.5)]'
  return 'bg-hexred shadow-[0_0_15px_rgba(230,57,70,0.5)]'
}

function getMasteryLabel(accuracy: number): string {
  if (accuracy >= 80) return 'Master'
  if (accuracy >= 50) return 'Proficient'
  return 'Novice'
}

function getMasteryClass(accuracy: number): string {
  if (accuracy >= 80) return 'text-success border-success/30 bg-success/10'
  if (accuracy >= 50) return 'text-orange border-orange/30 bg-orange/10'
  return 'text-hexred border-hexred/30 bg-hexred/10'
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchAnalytics()
})
</script>
