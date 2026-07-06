<template>
  <div class="w-full flex flex-col items-center gap-3">
    <!-- Revealed hint box (shown after first click) -->
    <transition name="fade">
      <div v-if="oracleRevealLevel > 0"
        class="oracle-hint-box relative overflow-hidden bg-purple-500/10 backdrop-blur-xl border border-purple-400/40 rounded-2xl p-5 text-center w-full shadow-[0_0_30px_rgba(168,85,247,0.25)]">
        <div class="oracle-glow-ring"></div>
        <div class="flex items-center justify-center gap-1.5 mb-2 opacity-90">
          <svg class="w-4 h-4 text-purple-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fill-rule="evenodd"
              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z"
              clip-rule="evenodd" />
          </svg>
          <span class="text-[10px] font-bold text-purple-300 tracking-[0.25em] uppercase">Oracle Vision ·
            Lv{{ oracleRevealLevel }}</span>
        </div>
        <p class="text-3xl font-black text-purple-200 tracking-[0.5em] font-mono">
          {{ oracleHintText }}
        </p>
      </div>
    </transition>

    <!-- Reveal button (hidden when max level reached) -->
    <button v-if="oracleRevealLevel < oracleMaxAllowed" @click.stop="$emit('use-hint')"
      class="oracle-reveal-btn group relative flex items-center gap-2 px-5 py-2.5 bg-purple-500/15 hover:bg-purple-500/25 backdrop-blur-md border border-purple-400/30 hover:border-purple-400/60 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)] hover:shadow-[0_0_25px_rgba(168,85,247,0.3)]">
      <svg class="w-4 h-4 text-purple-300 group-hover:text-purple-200 transition-colors" fill="currentColor"
        viewBox="0 0 20 20">
        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
        <path fill-rule="evenodd"
          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z"
          clip-rule="evenodd" />
      </svg>
      <span
        class="text-xs font-bold text-purple-300 group-hover:text-purple-200 tracking-widest uppercase transition-colors">
        {{ oracleRevealLevel === 0 ? 'Use Oracle' : 'Reveal More' }}
      </span>
      <span class="text-[10px] font-mono text-purple-400/80 bg-purple-500/20 px-2 py-0.5 rounded-full">
        -{{ oracleNextCost }} pts
      </span>
    </button>
    <span v-else class="text-[10px] font-bold text-purple-400/60 tracking-widest uppercase">Max vision
      reached</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  oracleRevealLevel: number
  oracleMaxAllowed: number
  oracleHintText: string
  oracleNextCost: number
}>()

defineEmits<{
  (e: 'use-hint'): void
}>()
</script>

<style scoped>
.oracle-hint-box {
  animation: oracleBreath 3s ease-in-out infinite;
}

.oracle-glow-ring {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  background: conic-gradient(from 0deg, transparent, rgba(168, 85, 247, 0.4), transparent, rgba(139, 92, 246, 0.3), transparent);
  animation: oracleRotate 4s linear infinite;
  z-index: -1;
  filter: blur(8px);
}

@keyframes oracleBreath {
  0%, 100% {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.15), inset 0 0 20px rgba(168, 85, 247, 0.05);
  }
  50% {
    box-shadow: 0 0 40px rgba(168, 85, 247, 0.35), inset 0 0 30px rgba(168, 85, 247, 0.1);
  }
}

@keyframes oracleRotate {
  to {
    transform: rotate(360deg);
  }
}
</style>
