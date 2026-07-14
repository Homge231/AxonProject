<template>
    <div
        class="h-screen w-full bg-darkNavy text-white relative flex flex-col items-center justify-center font-sans overflow-hidden">
        <div class="absolute inset-0 cyber-grid opacity-30 pointer-events-none z-0"></div>

        <!-- NEW: Nút Icon Abandon Room ở góc trên bên trái -->
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

        <!-- Room Code ở góc trên bên phải -->
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

        <main class="relative z-20 flex flex-col items-center w-full max-w-5xl px-4">
            <h1
                class="text-4xl md:text-5xl font-black italic tracking-widest uppercase text-transparent bg-clip-text bg-gradient-to-r from-orange to-hexred mb-12 drop-shadow-lg">
                Custom Room
            </h1>

            <!-- Khu vực 2 thẻ Avatar đã được giải phóng khỏi nút Abandon -->
            <div class="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20 w-full mb-16">

                <div class="flex flex-col items-center transform transition-transform duration-500 hover:scale-105">
                    <div
                        class="w-32 h-32 md:w-44 md:h-44 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/20 p-2 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                        <img :src="player1?.avatar" :alt="player1?.name"
                            class="w-full h-full rounded-xl object-cover bg-darkNavy" />
                    </div>
                    <p class="mt-6 text-2xl font-black tracking-widest uppercase text-white drop-shadow-md">
                        {{ player1?.name }}
                    </p>
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
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const generateRandomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    for (let i = 0; i < 4; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return `NRA-${result}`
}

const roomId = ref((route.query.id as string) || generateRandomId())
const copied = ref(false)

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

const player1 = computed(() => participants.value[0] || null)
const player2 = computed(() => participants.value[1] || null)

onMounted(() => {
    if (!route.query.id) {
        router.replace({ query: { id: roomId.value } })
    }

    participants.value = [
        {
            id: 'usr_123',
            name: authStore.profile?.username || 'You',
            avatar: authStore.profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=Host`
        }
    ]
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