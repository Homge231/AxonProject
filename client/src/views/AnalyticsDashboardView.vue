<template>
  <div class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans selection:bg-orange/40 flex flex-col">
    <!-- Background glows -->
    <div class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0"></div>
    <div class="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0"></div>
    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <!-- Header -->
    <header class="relative z-20 flex justify-between items-center p-8 lg:px-12">
      <div class="flex items-center gap-4 cursor-pointer" @click="router.push('/home')">
        <button class="text-gray-400 hover:text-white transition-colors flex items-center gap-2 uppercase tracking-widest text-xs font-bold bg-white/5 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/10">
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
            Track your proficiency across different topics. Find your weak spots and master them.
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

        <!-- Dashboard -->
        <div v-else class="flex flex-col gap-6">
          <div v-for="item in analyticsData" :key="item.topic" class="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 hover:border-lightBlue/30 transition-colors group">
            <div class="flex justify-between items-end mb-4">
              <div>
                <h3 class="text-xl font-bold uppercase tracking-wider text-white group-hover:text-lightBlue transition-colors">{{ formatTopicName(item.topic) }}</h3>
                <p class="text-[10px] text-gray-500 tracking-widest uppercase mt-1">{{ item.correctAnswers }} / {{ item.totalQuestions }} Correct</p>
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
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

interface TopicAnalytics {
  topic: string
  accuracy: number
  totalQuestions: number
  correctAnswers: number
}

const loading = ref(true)
const error = ref<string | null>(null)
const analyticsData = ref<TopicAnalytics[]>([])

async function fetchAnalytics() {
  loading.value = true
  error.value = null
  try {
    const token = localStorage.getItem('arena_token')
    const res = await fetch(`${SERVER_URL}/api/user/analytics`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
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

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  fetchAnalytics()
})
</script>
