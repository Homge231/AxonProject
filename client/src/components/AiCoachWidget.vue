<template>
  <div class="fixed bottom-6 left-6 z-[9990] flex flex-col items-start font-sans">
    
    <!-- AI Chat Window Overlay -->
    <transition name="chat-pop">
      <div 
        v-if="isOpen" 
        class="mb-3 w-[90vw] max-w-[380px] h-[480px] max-h-[75vh] bg-darkNavy/95 backdrop-blur-2xl border border-lightBlue/30 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden text-white transition-all relative z-[9995]"
      >
        <!-- Top Accent Bar -->
        <div class="h-1 w-full bg-gradient-to-r from-orange via-lightBlue to-success shrink-0"></div>

        <!-- Chat Header -->
        <div class="p-3.5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="relative w-9 h-9 rounded-full p-0.5 bg-gradient-to-br from-orange via-lightBlue to-blue flex items-center justify-center shadow-[0_0_12px_rgba(96,165,250,0.4)]">
              <div class="w-full h-full rounded-full bg-darkNavy flex items-center justify-center">
                <span class="text-base">🤖</span>
              </div>
            </div>
            <div>
              <h3 class="font-black text-sm uppercase tracking-wider text-white flex items-center gap-1.5 leading-none mb-1">
                Naenra AI Coach
                <span class="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded bg-lightBlue/20 border border-lightBlue/40 text-lightBlue">
                  AI
                </span>
              </h3>
              <p class="text-[9px] text-gray-400 tracking-widest uppercase leading-none">Personal Learning Assistant</p>
            </div>
          </div>

          <!-- Close Button -->
          <button 
            @click="isOpen = false; audioService.playClick()" 
            class="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Chat Content Body (Scrollable Area) -->
        <div ref="chatScrollRef" class="flex-1 p-3.5 overflow-y-auto custom-scrollbar flex flex-col gap-3 text-xs leading-relaxed">
          
          <!-- Sync / Loading analytics -->
          <div v-if="loadingAnalytics" class="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
            <svg class="animate-spin w-6 h-6 text-lightBlue" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-[10px] tracking-widest uppercase font-bold animate-pulse">Loading player stats...</span>
          </div>

          <div v-else>
            <!-- Initial prompt button if not started -->
            <div v-if="!aiStarted && !aiLoading" class="flex flex-col items-center text-center p-4 bg-white/5 border border-white/10 rounded-xl gap-3 my-2">
              <span class="text-3xl">✨</span>
              <p class="text-gray-300 text-xs">
                Hi <strong class="text-lightBlue">{{ username }}</strong>! Ready for customized typing feedback and weak-spot analysis?
              </p>
              <button 
                @click="generateInitialAnalysis" 
                @mouseenter="audioService.playHover()"
                class="w-full py-2.5 bg-gradient-to-r from-blue to-lightBlue hover:from-lightBlue hover:to-blue text-darkNavy font-black uppercase tracking-widest text-[11px] rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-[1.02] active:scale-95 transition-all"
              >
                Analyse My Gameplay
              </button>
            </div>

            <!-- Loading AI reply -->
            <div v-if="aiLoading" class="flex flex-col items-center justify-center py-10 gap-2 text-lightBlue">
              <div class="relative w-8 h-8 flex items-center justify-center">
                <div class="absolute inset-0 rounded-full border-2 border-lightBlue/20 animate-ping"></div>
                <div class="w-6 h-6 rounded-full border-2 border-lightBlue border-t-transparent animate-spin"></div>
              </div>
              <span class="text-[10px] tracking-widest uppercase font-bold animate-pulse">Analyzing vocabulary data...</span>
            </div>

            <!-- AI Error -->
            <div v-if="aiError" class="bg-hexred/10 border border-hexred/30 rounded-xl p-3 text-center my-2 text-xs">
              <p class="text-hexred font-bold uppercase text-[10px] mb-1">AI Error</p>
              <p class="text-gray-300 text-[11px]">{{ aiError }}</p>
              <button @click="generateInitialAnalysis" class="mt-2 text-[10px] text-lightOrange hover:underline font-bold uppercase">Retry</button>
            </div>

            <!-- Report + Chat Messages -->
            <div v-if="aiStarted && !aiLoading" class="flex flex-col gap-3">
              <!-- Initial Report Bubble -->
              <div class="bg-white/5 border border-white/10 rounded-xl p-3.5 text-xs text-gray-200 shadow-sm">
                <div class="text-[9px] font-bold text-lightBlue uppercase tracking-widest mb-1.5 border-b border-white/5 pb-1 flex items-center gap-1">
                  <span>💡 Personalized Learning Plan</span>
                </div>
                <div class="prose prose-invert max-w-none text-xs" v-html="renderedReport"></div>
                <span v-if="isTyping" class="inline-block w-1.5 h-3 bg-lightBlue animate-pulse ml-0.5 align-middle"></span>
              </div>

              <!-- Follow-up messages -->
              <div v-for="(chat, idx) in chatHistory" :key="idx" class="flex flex-col gap-1">
                <!-- User Speech Bubble -->
                <div v-if="chat.role === 'user'" class="self-end bg-blue-600/30 border border-blue-400/40 rounded-2xl rounded-tr-none px-3.5 py-2 max-w-[85%] text-xs text-white shadow-sm">
                  <span class="block font-bold text-[9px] text-blue-300 uppercase tracking-widest leading-none mb-1">You</span>
                  <p class="whitespace-pre-wrap break-words text-gray-100 leading-normal">{{ chat.message }}</p>
                </div>
                <!-- AI Speech Bubble -->
                <div v-else class="self-start bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-3.5 py-2.5 max-w-[90%] text-xs text-gray-200 shadow-sm">
                  <span class="block font-bold text-[9px] text-lightBlue uppercase tracking-widest leading-none mb-1.5">🤖 AI Coach</span>
                  <div class="prose prose-invert max-w-none text-xs leading-normal" v-html="renderMarkdown(chat.message)"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Chat Input Footer -->
        <div v-if="aiStarted && !aiLoading && !isTyping" class="p-3 bg-black/50 border-t border-white/10 flex flex-col gap-1.5 shrink-0">
          <div v-if="followUpCount < 5" class="flex gap-2 items-center">
            <input 
              v-model="userQuestion"
              @keyup.enter="sendFollowUp"
              type="text"
              placeholder="Ask AI Coach a question..."
              class="flex-1 bg-black/60 border border-white/15 focus:border-lightBlue rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none transition-colors"
              :disabled="isSendingFollowUp"
            />
            <button 
              @click="sendFollowUp" 
              :disabled="!userQuestion.trim() || isSendingFollowUp"
              class="px-3.5 py-2 bg-lightBlue/20 hover:bg-lightBlue/30 border border-lightBlue/40 disabled:opacity-40 text-lightBlue font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all shrink-0"
            >
              {{ isSendingFollowUp ? '...' : 'Send' }}
            </button>
          </div>
          <div v-else class="text-center py-1 text-[9px] text-gray-400 uppercase font-bold tracking-wider">
            🔒 Limit (5/5) reached for this session
          </div>
        </div>

      </div>
    </transition>

    <!-- Floating Toggle Button -->
    <button 
      @click="toggleWidget"
      @mouseenter="audioService.playHover()"
      class="group relative flex items-center gap-2.5 bg-darkNavy/90 backdrop-blur-xl border border-lightBlue/40 hover:border-lightBlue px-4 py-2.5 rounded-full shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-95 transition-all text-white focus:outline-none z-[9990]"
      title="AI Learning Coach"
    >
      <!-- Glowing Pulse Ring -->
      <span class="absolute -inset-0.5 rounded-full bg-gradient-to-r from-orange to-lightBlue opacity-30 group-hover:opacity-70 blur transition-opacity"></span>

      <div class="relative w-7 h-7 rounded-full bg-gradient-to-br from-orange via-lightBlue to-blue p-0.5 flex items-center justify-center">
        <div class="w-full h-full rounded-full bg-darkNavy flex items-center justify-center text-xs">
          🤖
        </div>
      </div>
      <span class="relative font-black text-xs uppercase tracking-wider text-lightBlue group-hover:text-white transition-colors">
        AI Coach
      </span>
      <span class="relative w-2 h-2 rounded-full bg-success animate-pulse"></span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { fetchWithAuth } from '../services/api'
import { audioService } from '../services/audioService'

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

const authStore = useAuthStore()

const isOpen = ref(false)
const loadingAnalytics = ref(false)
const analyticsData = ref<TopicAnalytics[]>([])
const chatScrollRef = ref<HTMLElement | null>(null)

const aiStarted = ref(false)
const aiLoading = ref(false)
const aiError = ref<string | null>(null)
const displayedReportText = ref('')
const isTyping = ref(false)
let typingTimer: any = null

const userQuestion = ref('')
const isSendingFollowUp = ref(false)
const followUpCount = ref(0)
const chatHistory = ref<ChatMessage[]>([])

const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

const renderedReport = computed(() => renderMarkdown(displayedReportText.value))

function scrollToBottom() {
  nextTick(() => {
    if (chatScrollRef.value) {
      chatScrollRef.value.scrollTop = chatScrollRef.value.scrollHeight
    }
  })
}

function toggleWidget() {
  audioService.playClick()
  isOpen.value = !isOpen.value
  if (isOpen.value && analyticsData.value.length === 0 && !loadingAnalytics.value) {
    loadAnalytics()
  }
}

async function loadAnalytics() {
  loadingAnalytics.value = true
  try {
    const res = await fetchWithAuth('/api/user/analytics')
    if (res.ok) {
      analyticsData.value = await res.json()
    }
  } catch (err) {
    console.error('Failed to load analytics for AI widget:', err)
  } finally {
    loadingAnalytics.value = false
  }
}

async function generateInitialAnalysis() {
  audioService.playClick()
  aiStarted.value = true
  aiLoading.value = true
  aiError.value = null
  displayedReportText.value = ''

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
    startTypewriter(data.analysis || '')
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
  const speedMs = 16

  typingTimer = setInterval(() => {
    if (idx < fullText.length) {
      displayedReportText.value += fullText.charAt(idx)
      idx++
      scrollToBottom()
    } else {
      clearInterval(typingTimer)
      typingTimer = null
      isTyping.value = false
      scrollToBottom()
    }
  }, speedMs)
}

async function sendFollowUp() {
  const query = userQuestion.value.trim()
  if (!query || isSendingFollowUp.value || followUpCount.value >= 5) return

  audioService.playClick()
  isSendingFollowUp.value = true
  userQuestion.value = ''

  chatHistory.value.push({ role: 'user', message: query })
  followUpCount.value++
  scrollToBottom()

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
    scrollToBottom()
  } catch (err: any) {
    chatHistory.value.push({ role: 'model', message: '⚠️ Issue connecting to AI Coach. Try again.' })
    scrollToBottom()
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
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 text-orange px-1 py-0.5 rounded font-mono text-[10px]">$1</code>')
    .replace(/^### (.*$)/gim, '<h4 class="text-xs font-bold text-white mt-2 mb-1 uppercase tracking-wider">$1</h4>')
    .replace(/^## (.*$)/gim, '<h3 class="text-xs font-bold text-white mt-2 mb-1 uppercase tracking-wider">$1</h3>')
    .replace(/^- (.*$)/gim, '<li class="ml-3 list-disc text-gray-300 my-0.5">$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-3 list-decimal text-gray-300 my-0.5">$1</li>')
    .replace(/\n/g, '<br/>')
  return html
}
</script>

<style scoped>
.chat-pop-enter-active,
.chat-pop-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.chat-pop-enter-from,
.chat-pop-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
}
</style>
