<template>
  <div class="flex items-center gap-3 px-5 py-2.5 rounded-full bg-cyan-900/40 border border-cyan-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(34,211,238,0.3)]">
    <svg class="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    <div class="flex items-center gap-1.5 relative">
      <!-- 3 Shields max -->
      <div v-for="i in 3" :key="i"
        class="w-4 h-4 rounded-full transition-all duration-300 relative"
        :class="[
          i <= count 
            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-110' 
            : 'bg-cyan-900/50 border border-cyan-500/30',
          (shattering && i === count + 1) ? 'animate-shatter' : ''
        ]">
        <!-- Shatter particles, only visible when this specific node is shattering -->
        <template v-if="shattering && i === count + 1">
          <div class="absolute inset-0 shatter-particle p1"></div>
          <div class="absolute inset-0 shatter-particle p2"></div>
          <div class="absolute inset-0 shatter-particle p3"></div>
          <div class="absolute inset-0 shatter-particle p4"></div>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'

const props = defineProps<{
  count: number
  shattering: boolean
}>()

// Procedural sound effect for shield deflect/shatter
const playDeflectSound = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContext) return
    
    const ctx = new AudioContext()
    
    // Create oscillator for the impact "tink"
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    // Create noise for the shattering "glass"
    const bufferSize = ctx.sampleRate * 0.5 // 0.5 seconds of noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    
    const noise = ctx.createBufferSource()
    noise.buffer = buffer
    
    // Filter the noise to sound high-pitched like glass
    const noiseFilter = ctx.createBiquadFilter()
    noiseFilter.type = 'highpass'
    noiseFilter.frequency.value = 5000
    
    const noiseGain = ctx.createGain()
    
    // Connect tink
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1)
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
    
    osc.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    // Connect shatter noise
    noiseGain.gain.setValueAtTime(0, ctx.currentTime)
    noiseGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4)
    
    noise.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)
    
    // Start audio
    osc.start(ctx.currentTime)
    noise.start(ctx.currentTime)
    
    osc.stop(ctx.currentTime + 0.2)
    noise.stop(ctx.currentTime + 0.5)
  } catch (e) {
    console.error('Web Audio API not supported or failed', e)
  }
}

watch(() => props.shattering, (isShattering) => {
  if (isShattering) {
    playDeflectSound()
  }
})
</script>

<style scoped>
/* Core shatter animation applied to the node itself */
.animate-shatter {
  animation: shatter-base 0.4s ease-out forwards;
}

@keyframes shatter-base {
  0% { transform: scale(1.1); background-color: rgba(34,211,238, 1); opacity: 1; }
  50% { transform: scale(1.5); background-color: rgba(255,255,255, 1); opacity: 0.8; }
  100% { transform: scale(0); opacity: 0; }
}

/* Individual flying glass particles */
.shatter-particle {
  border-radius: 50%;
  background-color: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  opacity: 0;
}

.animate-shatter .shatter-particle {
  animation: fly-out 0.4s ease-out forwards;
}

.p1 { animation-delay: 0.02s; }
.p2 { animation-delay: 0.04s; }
.p3 { animation-delay: 0.01s; }
.p4 { animation-delay: 0.05s; }

@keyframes fly-out {
  0% {
    transform: translate(0, 0) scale(1);
    opacity: 1;
  }
  100% {
    /* Random directions baked into CSS using fixed translates for simplicity */
    transform: translate(var(--tx, 15px), var(--ty, -15px)) scale(0);
    opacity: 0;
  }
}

.p1 { --tx: -20px; --ty: -20px; }
.p2 { --tx: 20px;  --ty: -15px; }
.p3 { --tx: 15px;  --ty: 20px; }
.p4 { --tx: -15px; --ty: 15px; }
</style>
