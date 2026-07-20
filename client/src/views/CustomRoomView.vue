<template>
    <div class="h-screen w-full bg-darkNavy text-white relative flex flex-col items-center justify-center font-sans overflow-hidden">
        <div class="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0"></div>

        <div class="absolute top-8 left-8 z-50 flex flex-col items-start gap-1.5">
            <p class="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">Leave</p>
            <button @click="router.push('/home')"
                class="flex items-center justify-center px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl group hover:bg-hexred/10 hover:border-hexred/50 transition-all duration-300 focus:outline-none"
                title="Abandon Room">
                <svg class="w-6 h-6 text-gray-400 group-hover:text-hexred transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                </svg>
            </button>
        </div>

        <div class="absolute top-8 right-8 z-50 flex flex-col items-end gap-1.5">
            <p class="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">Room Code</p>
            <div
                class="flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-lg shadow-2xl group hover:bg-white/10 transition-all duration-300">
                <span class="text-2xl font-mono font-black text-white tracking-widest drop-shadow-md">
                    {{ roomId }}
                </span>
                <button @click="copyRoomId"
                    class="relative text-gray-400 hover:text-orange transition-colors focus:outline-none p-1"
                    :title="copied ? 'Copied!' : 'Copy to clipboard'">
                    <svg v-if="!copied" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z">
                        </path>
                    </svg>
                    <svg v-else class="w-6 h-6 text-success drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span v-if="copied"
                        class="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-success uppercase tracking-widest whitespace-nowrap animate-fade-up">
                        Copied!
                    </span>
                </button>
            </div>
        </div>

        <!-- Cài đặt phòng ở góc dưới bên trái -->
        <div class="absolute bottom-8 left-8 z-50 flex flex-col items-start gap-1.5">
            <p class="text-[10px] text-gray-400 font-bold tracking-[0.2em] uppercase">Room Settings</p>
            <button @click="isRoomSettingsOpen = true"
                class="flex items-center justify-center px-4 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg shadow-2xl group hover:bg-white/10 transition-all duration-300 focus:outline-none"
                title="Room Settings">
                <svg class="w-6 h-6 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            </button>
        </div>

        <main class="relative z-20 flex flex-col items-center w-full max-w-5xl px-4">
            <h1
                class="text-4xl md:text-5xl font-black italic tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred mb-12 drop-shadow-lg">
                Custom Room
            </h1>

            <div class="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 w-full mb-16">

                <div class="flex flex-col items-center transform transition-transform duration-500 hover:scale-105">
                    <template v-if="player1">
                        <div
                            class="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-2 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
                            <div class="absolute -top-3 -right-3 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider shadow-lg">Host</div>
                            <img :src="player1.avatar" :alt="player1.name"
                                class="w-full h-full rounded-xl object-cover bg-darkNavy" />
                        </div>
                        <p class="mt-6 text-2xl font-black tracking-widest uppercase text-white drop-shadow-md">
                            {{ player1.name }}
                        </p>
                    </template>
                    <template v-else>
                        <div
                            class="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-black/40 backdrop-blur-md border-2 border-dashed border-white/10 flex items-center justify-center p-2 shadow-inner">
                            <svg class="w-12 h-12 text-gray-600 animate-pulse" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                </path>
                            </svg>
                        </div>
                        <p class="mt-6 text-sm font-bold tracking-[0.2em] uppercase text-gray-500 animate-pulse">
                            Loading...
                        </p>
                    </template>
                </div>

                <div class="flex flex-col items-center justify-center relative">
                    <div
                        class="absolute inset-0 bg-gradient-to-r from-orange to-hexred blur-2xl opacity-20 rounded-full">
                    </div>
                    <span
                        class="relative z-10 text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-orange to-hexred drop-shadow-[0_0_15px_rgba(230,57,70,0.5)]">
                        VS
                    </span>
                </div>

                <div class="flex flex-col items-center transform transition-transform duration-500 hover:scale-105">
                    <template v-if="player2">
                        <div
                            class="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-2 shadow-[0_0_30px_rgba(230,57,70,0.15)]">
                            <img :src="player2.avatar" :alt="player2.name"
                                class="w-full h-full rounded-xl object-cover bg-darkNavy" />
                        </div>
                        <p class="mt-6 text-2xl font-black tracking-widest uppercase text-white drop-shadow-md">
                            {{ player2.name }}
                        </p>
                    </template>

                    <template v-else>
                        <div
                            class="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-black/40 backdrop-blur-md border-2 border-dashed border-white/10 flex items-center justify-center p-2 shadow-inner">
                            <svg class="w-12 h-12 text-gray-600 animate-pulse" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z">
                                </path>
                            </svg>
                        </div>
                        <p class="mt-6 text-sm font-bold tracking-[0.2em] uppercase text-gray-500 animate-pulse">
                            Waiting...
                        </p>
                    </template>
                </div>
            </div>

            <div class="mt-4 flex flex-col items-center" v-if="isHost">
                <button 
                    :disabled="!canStartGame"
                    @click="initiateMatch"
                    class="px-10 py-4 bg-gradient-to-r from-orange to-hexred text-white font-black text-xl md:text-2xl tracking-widest uppercase rounded-xl shadow-[0_0_20px_rgba(230,57,70,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 transition-all duration-300 focus:outline-none">
                    Play Game
                </button>
                <p v-if="!canStartGame" class="mt-3 text-sm text-gray-400 uppercase tracking-widest">
                    Waiting for opponent...
                </p>
            </div>
            <div class="mt-4 flex flex-col items-center" v-else>
                <p v-if="canStartGame" class="text-xl font-bold text-orange animate-pulse tracking-widest uppercase">
                    Waiting for host to start...
                </p>
            </div>
        </main>

        <RoomSettingsOverlay 
            :isOpen="isRoomSettingsOpen"
            :metadata="roomMetadata"
            @close="isRoomSettingsOpen = false"
            @save="saveRoomSettings"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { createMatchRoom, joinMatchRoomById, leaveMatchRoom, currentRoom } from '../services/multiplayerService'
import RoomSettingsOverlay from '../components/game/RoomSettingsOverlay.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const navigatingToGame = ref(false)

const roomId = ref(route.query.id as string || 'Loading...')
const copied = ref(false)
const isRoomSettingsOpen = ref(false)
const roomMetadata = ref({
    vocabularyLevel: 'Normal',
    difficulty: 'Standard',
    topic: 'Any'
})

const saveRoomSettings = (newMetadata: { vocabularyLevel: string, difficulty: string, topic: string }) => {
    if (currentRoom) {
        currentRoom.send('updateMetadata', newMetadata)
    }
}

// Track the current user's ID securely to determine host status later
const currentUserId = computed(() => authStore.user?.id || authStore.profile?.id)

const copyRoomId = async () => {
    try {
        await navigator.clipboard.writeText(roomId.value)
        copied.value = true
        setTimeout(() => copied.value = false, 2000)
    } catch (err) {
        console.error('Failed to copy room ID: ', err)
    }
}

const participants = ref<{ id: string, name: string, avatar: string }[]>([])
const roomHostId = ref<string>('')

const player1 = computed(() => participants.value[0] || null)
const player2 = computed(() => participants.value[1] || null)

// --- NEW COMPUTED PROPERTIES FOR US-43 ---
// Determine if the current user is the host
const isHost = computed(() => {
    return roomHostId.value === currentUserId.value && roomHostId.value !== ''
})

// Sub-task: FE Button Conditional Lock
const canStartGame = computed(() => {
    return participants.value.length === 2
})

// Sub-task: FE Match Start Event
const initiateMatch = () => {
    if (currentRoom && canStartGame.value) {
        // Emit an execution signal up to the WebSocket channel
        currentRoom.send('start_match')
    }
}

onMounted(async () => {
    // Wait for the auth store to finish loading the profile.
    // On first mount after OAuth redirect, profile is fetched async and may
    // still be null here — using it immediately produces a GUEST join.
    while (authStore.loading) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }

    // For Google OAuth users: exchangeTokenAfterOAuth() sets the arena_token
    // asynchronously. If we have a Supabase session but no arena_token yet,
    // wait briefly for it to be populated to avoid joining as a Guest.
    const maxWaitMs = 3000
    const startTime = Date.now()
    while (!localStorage.getItem('arena_token') && authStore.isLoggedIn && Date.now() - startTime < maxWaitMs) {
        await new Promise(resolve => setTimeout(resolve, 50))
    }

    const options = {
        token: localStorage.getItem('arena_token'),
        id: currentUserId.value,
        name: authStore.profile?.username || 'Guest',
        avatar: authStore.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=Guest`
    }

    try {
        if (route.query.id) {
            // Join existing room
            await joinMatchRoomById(route.query.id as string, options)
        } else {
            // Create new room
            const room = await createMatchRoom(options)
            roomId.value = room.roomId
            router.replace({ query: { id: room.roomId } })
        }

        if (currentRoom) {
            // 1. Listen for standard state changes
            currentRoom.onStateChange((state: any) => {
                try {
                    const newParticipants: { id: string, name: string, avatar: string }[] = []
                    const playersObj = state.toJSON().players || {}
                    Object.values(playersObj).forEach((player: any) => {
                        if (player && player.name) {
                            newParticipants.push({
                                id: player.id,
                                name: player.name,
                                avatar: player.avatar
                            })
                        }
                    })
                    // Sort participants so that the host is always player1
                    const hostId = state.hostId || state.toJSON().hostId
                    if (hostId) {
                        roomHostId.value = hostId
                        newParticipants.sort((a, b) => {
                            if (a.id === hostId) return -1
                            if (b.id === hostId) return 1
                            return 0
                        })
                    }

                    participants.value = newParticipants
                    
                    const meta = state.toJSON().metadata
                    if (meta) {
                        roomMetadata.value = {
                            vocabularyLevel: meta.vocabularyLevel || 'Normal',
                            difficulty: meta.difficulty || 'Standard',
                            topic: meta.topic || 'Any'
                        }
                    }
                } catch (e) {
                    console.error("Error parsing room state:", e)
                }
            })

            // 2. Listen for the server broadcast that the match has officially started
            // This ensures BOTH players are pushed to GameplayView simultaneously.
            currentRoom.onMessage('match_started', () => {
                navigatingToGame.value = true
                router.push('/core/multiplayer')
            })
        }
    } catch (err: any) {
        console.error("Failed to join or create room:", err)
        alert("Could not connect to the room! Error: " + (err.message || err))
        router.push('/home')
    }
})

onUnmounted(() => {
    if (!navigatingToGame.value) {
        leaveMatchRoom()
    }
})
</script>

<style scoped>
.cyber-grid {
    background-image: linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 64px 64px;
}

.text-success {
    color: #22c55e;
}

.animate-fade-up {
    animation: fadeUp 0.3s ease-out forwards;
}

@keyframes fadeUp {
    from {
        opacity: 0;
        transform: translate(-50%, 5px);
    }

    to {
        opacity: 1;
        transform: translate(-50%, 0);
    }
}
</style>