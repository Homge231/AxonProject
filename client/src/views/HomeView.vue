<template>
  <div
    class="h-screen w-full bg-darkNavy text-white overflow-hidden relative font-sans selection:bg-orange/40 flex flex-col">
    <div
      class="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-blue rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0">
    </div>
    <div
      class="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-orange rounded-full mix-blend-screen filter blur-[200px] opacity-15 pointer-events-none z-0">
    </div>

    <div
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[18vw] font-black italic text-white/[0.02] tracking-tighter whitespace-nowrap select-none pointer-events-none z-0 transform -skew-x-12">
      NAENRA
    </div>

    <div class="absolute inset-0 cyber-grid opacity-50 pointer-events-none z-0"></div>

    <header class="relative z-20 flex justify-between items-center p-8 lg:px-12">
      <div class="flex items-center gap-4 group cursor-pointer">
        <div class="w-12 h-12 flex items-center justify-center">
          <svg class="w-full h-full text-orange fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 3 L7 21 L12 21 L12 9 L17 21 L17 3 L12 3 L12 15 L7 3 Z" />
          </svg>
        </div>
        <div class="leading-none">
          <h1
            class="text-3xl font-black mb-1 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred drop-shadow-lg uppercase">
            NAENRA
          </h1>
          <p class="text-[10px] text-lightBlue font-bold tracking-[0.3em] uppercase">
            TYPING ESPORTS ARENA
          </p>
        </div>
      </div>

      <div
        class="flex items-center gap-4 bg-darkNavy/60 backdrop-blur-md border border-white/10 p-2 pr-4 transform -skew-x-12">
        <div class="w-10 h-10 bg-gradient-to-br from-blue to-lightBlue p-0.5 cursor-pointer"
          @click="router.push('/profile')" @mouseenter="audioService.playHover()" title="View Profile">
          <img :src="avatarUrl" :alt="username"
            class="w-full h-full bg-darkNavy object-cover hover:opacity-80 transition-opacity"
            @error="(e) => (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`" />
        </div>
        <div class="transform skew-x-12 text-right hidden md:block">
          <p class="font-bold text-sm text-white tracking-wider">{{ username }}</p>
          <p class="text-[10px] text-lightOrange font-mono font-bold">ELO: {{ elo }}</p>
        </div>
        <div class="w-px h-6 bg-white/20 mx-2 transform skew-x-12"></div>
        <button @click="router.push('/analytics'); audioService.playClick()" @mouseenter="audioService.playHover()"
          class="transform skew-x-12 text-gray-400 hover:text-lightBlue transition-colors mr-2" title="Vocab Analytics">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
            </path>
          </svg>
        </button>
        <button @click="handleLogout" @mouseenter="audioService.playHover()" class="transform skew-x-12 text-gray-400 hover:text-hexred transition-colors"
          title="Disconnect">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
          </svg>
        </button>
      </div>
    </header>

    <main class="relative z-20 flex-1 flex flex-col justify-center px-8 lg:px-20 max-w-[1800px] mx-auto w-full">
      <div class="max-w-3xl flex flex-col items-start">
        <div class="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-8">
          <span class="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          <span class="text-xs font-bold text-lightBlue tracking-[0.2em] uppercase">Season 1 is Live</span>
        </div>

        <h2 class="text-7xl lg:text-[7rem] font-black italic uppercase leading-[0.9] tracking-tighter mb-4">
          <span class="text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500">Ranked</span><br />
          <span class="text-hexred drop-shadow-[0_0_20px_rgba(230,57,70,0.4)]">Clash</span>
        </h2>
        <p class="text-gray-400 font-medium max-w-md text-sm leading-relaxed mb-10 border-l-2 border-orange pl-4">
          The ranked servers are primed and ready. Showcase your speed, enhance your accuracy, and claim your dominance
          on the global leaderboard.
        </p>

        <div class="relative mb-6">
          <button @click="startMatchmaking" @mouseenter="audioService.playHover()" :disabled="isSearching"
            class="group relative w-[320px] h-[80px] bg-darkNavy border border-white/10 overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:border-hexred focus:outline-none">
            <div
              class="absolute inset-0 bg-gradient-to-r from-orange to-hexred translate-x-[-101%] group-hover:translate-x-0 transition-transform duration-500 ease-out z-0">
            </div>
            <div class="absolute inset-0 flex items-center justify-between px-8 z-10">
              <span class="text-2xl font-black italic tracking-widest uppercase transition-colors duration-300"
                :class="isSearching ? 'text-white' : 'text-gray-300 group-hover:text-white'">
                {{ isSearching ? 'INITIALIZING...' : 'FIND MATCH' }}
              </span>
              <svg v-if="!isSearching" class="w-8 h-8 text-hexred group-hover:text-white transition-colors duration-300"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M13 10V3L4 14h7v7l9-11h-7z">
                </path>
              </svg>
              <svg v-else class="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
              </svg>
            </div>
          </button>
          <p v-if="isSearching"
            class="absolute -bottom-6 left-0 text-lightOrange text-xs font-bold tracking-widest uppercase animate-pulse">
            &gt; ETA: 0:15
          </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 w-full max-w-[600px]">
          
          <button @click="goToCustomRoom" @mouseenter="audioService.playHover()" :disabled="isJoiningCustom"
            class="h-12 w-full flex items-center justify-center gap-2 rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-lightBlue hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 font-bold text-sm tracking-widest uppercase disabled:opacity-50 disabled:cursor-not-allowed">
            <svg v-if="isJoiningCustom" class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ isJoiningCustom ? 'CONNECTING...' : 'Create 1v1 Room' }}</span>
          </button>

          <div class="group h-12 w-full flex items-center rounded-md bg-white/10 border border-white/20 hover:border-lightBlue hover:bg-white/20 hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 overflow-hidden focus-within:border-lightBlue focus-within:bg-white/20 focus-within:shadow-[0_0_20px_rgba(59,130,246,0.4)]">
            <input v-model="joinCode" @keyup.enter="joinExistingRoom" type="text" placeholder="ENTER CODE..."
              class="bg-transparent text-white pl-5 pr-2 h-full w-full outline-none uppercase tracking-widest text-sm placeholder:text-gray-400"
              maxlength="12" />
            <button @click="joinExistingRoom" @mouseenter="audioService.playHover()" :disabled="!joinCode || isJoiningCustom"
              class="h-full px-5 text-gray-200 hover:text-white hover:bg-white/20 font-bold text-sm uppercase tracking-widest transition-colors border-l border-white/20 group-hover:border-lightBlue/50 focus-within:border-lightBlue/50 disabled:opacity-50 disabled:cursor-not-allowed">
              Join
            </button>
          </div>

          <button @mouseenter="audioService.playHover()"
            class="h-12 w-full flex items-center justify-center rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-lightBlue hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 font-bold text-sm tracking-widest uppercase">
            Leaderboard
          </button>

          <button @click="startMatchmaking" @mouseenter="audioService.playHover()"
            class="h-12 w-full flex items-center justify-center rounded-md bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-lightBlue hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all duration-300 font-bold text-sm tracking-widest uppercase">
            Single Player 
          </button>

        </div>
      </div>
    </main>

    <div class="relative z-20 h-2 w-full bg-darkNavy flex mt-auto">
      <div class="w-1/3 h-full bg-gradient-to-r from-orange to-hexred"></div>
      <div class="w-px h-full bg-white/20 mx-1"></div>
      <div class="w-16 h-full bg-blue"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { audioService } from '../services/audioService'

const router = useRouter()
const authStore = useAuthStore()
const isSearching = ref(false)
const joinCode = ref('')

function joinExistingRoom() {
  if (!joinCode.value) return
  audioService.playClick()
  isJoiningCustom.value = true
  setTimeout(() => {
    let code = joinCode.value.trim()
    // Colyseus IDs are case-sensitive, do not use toUpperCase()

    router.push(`/room/custom?id=${code}`).finally(() => {
      isJoiningCustom.value = false
      joinCode.value = '' 
    })
  }, 600)
}

const username = computed(() =>
  authStore.profile?.username ||
  authStore.user?.user_metadata?.full_name ||
  'Player'
)

const avatarUrl = computed(() =>
  authStore.profile?.avatar_url ||
  authStore.user?.user_metadata?.avatar_url ||
  `https://api.dicebear.com/7.x/avataaars/svg?seed=${username.value}`
)

const elo = computed(() => authStore.profile?.elo ?? 0)
const isJoiningCustom = ref(false)
function goToCustomRoom() {
  audioService.playClick()
  isJoiningCustom.value = true


  setTimeout(() => {
    router.push('/room/custom').finally(() => {
      isJoiningCustom.value = false
    })
  }, 600)
}
function handleLogout() {
  audioService.playClick()
  authStore.logout()
  router.push('/')
}

function startMatchmaking() {
  audioService.playClick()
  isSearching.value = true
  setTimeout(() => {
    isSearching.value = false
    router.push('/core')
  }, 3000)
}

onMounted(() => {
  // Bắt đầu phát BGM cho Home
  audioService.playBGM('/audio/daily_life.mp3')
})
</script>

<style scoped>
.cyber-grid {
  background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 64px 64px;
}
</style>