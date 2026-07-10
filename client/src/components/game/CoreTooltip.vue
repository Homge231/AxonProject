<script setup lang="ts">
import { computed } from 'vue'
import { getCoreFamily } from '../../game/cores/families'

const props = defineProps<{
  core: {
    id: string
    name: string
    description: string
    flat_buff?: number
    multiplier_buff?: number
    tier?: number
    core_type?: string
    classification?: string
  }
}>()

// Determine core family
const familyName = computed(() => {
  return getCoreFamily(props.core.name) || 'unknown'
})

// Styles based on family name
const FAMILY_CONFIGS: Record<string, {
  color: string
  bg: string
  border: string
  dot: string
  displayName: string
}> = {
  balanced: {
    color: 'text-blue-400',
    bg: 'from-blue-950/90 to-slate-950/90',
    border: 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    dot: 'bg-blue-400',
    displayName: 'Balanced'
  },
  combo: {
    color: 'text-orange-400',
    bg: 'from-orange-950/90 to-slate-950/90',
    border: 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.3)]',
    dot: 'bg-orange-500',
    displayName: 'Combo'
  },
  speedster: {
    color: 'text-cyan-400',
    bg: 'from-cyan-950/90 to-slate-950/90',
    border: 'border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]',
    dot: 'bg-cyan-400',
    displayName: 'Speedster'
  },
  oracle: {
    color: 'text-violet-400',
    bg: 'from-violet-950/90 to-slate-950/90',
    border: 'border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.3)]',
    dot: 'bg-violet-400',
    displayName: 'Oracle'
  },
  mission: {
    color: 'text-amber-400',
    bg: 'from-amber-950/90 to-slate-950/90',
    border: 'border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    dot: 'bg-amber-500',
    displayName: 'Mission'
  },
  aegis: {
    color: 'text-sky-400',
    bg: 'from-sky-950/90 to-slate-950/90',
    border: 'border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.3)]',
    dot: 'bg-sky-400',
    displayName: 'Aegis'
  },
  power: {
    color: 'text-pink-400',
    bg: 'from-pink-950/90 to-slate-950/90',
    border: 'border-pink-500/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]',
    dot: 'bg-pink-400',
    displayName: 'Power'
  },
  pandora: {
    color: 'text-purple-400',
    bg: 'from-purple-950/90 to-slate-950/90',
    border: 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
    dot: 'bg-purple-400',
    displayName: 'Pandora'
  },
  unknown: {
    color: 'text-gray-400',
    bg: 'from-gray-950/90 to-slate-950/90',
    border: 'border-gray-500/50',
    dot: 'bg-gray-400',
    displayName: 'Standard'
  }
}

const currentConfig = computed(() => {
  return FAMILY_CONFIGS[familyName.value] || FAMILY_CONFIGS.unknown
})

// Roman numeral for Tier
const tierRoman = computed(() => {
  const t = props.core.tier ?? 1
  if (t === 2) return 'II'
  if (t === 3) return 'III'
  return 'I'
})

// Advanced stats computation
const stats = computed(() => {
  const nameLower = props.core.name.toLowerCase()
  const m = props.core.multiplier_buff ?? 1.0
  const f = props.core.flat_buff ?? 0

  let multiplierStr = `x${m.toFixed(1)}`
  let flatStr = f > 0 ? `+${f} PTS` : '0'
  let penaltyStr = 'Standard'
  let specialMechanic = ''

  // Custom mechanic details by family
  switch (familyName.value) {
    case 'power':
      penaltyStr = props.core.tier === 3 ? 'Triple (3.0x)' : 'Double (2.0x)'
      specialMechanic = 'Sacrifices stability for raw scoring power. Highly volatile.'
      break
    case 'balanced':
      penaltyStr = 'None (0x)'
      specialMechanic = 'Protects score from dropping. Completely immune to wrong answer penalties.'
      break
    case 'combo':
      specialMechanic = 'Gives cumulative streak bonuses up to +100 points per correct answer.'
      break
    case 'speedster':
      multiplierStr = 'N/A' // Speedster ignores mult/flat DB values
      flatStr = 'Up to +150'
      specialMechanic = 'Adds score bonuses based on how quickly you type the words.'
      break
    case 'oracle':
      penaltyStr = 'High (Cumulative)'
      specialMechanic = 'Gives progressive letter hints but penalizes wrong answers based on hint levels used.'
      break
    case 'aegis':
      specialMechanic = 'Generates shields that absorb mistakes. Shield capacity is tier-dependent.'
      break
    case 'mission':
      specialMechanic = 'Awards massive points once you complete gõ-streak milestones.'
      break
    case 'pandora':
      specialMechanic = 'Randomly shapeshifts into another Tier 1 core every 15-20 seconds during battle.'
      break
  }

  return {
    multiplier: multiplierStr,
    flat: flatStr,
    penalty: penaltyStr,
    mechanic: specialMechanic
  }
})
</script>

<template>
  <div 
    class="absolute z-[100] bottom-full left-1/2 -translate-x-1/2 mb-6 w-80 p-5 rounded-2xl border backdrop-blur-md text-left flex flex-col gap-4 shadow-2xl transition-all duration-300 pointer-events-none select-none bg-gradient-to-br"
    :class="[currentConfig.bg, currentConfig.border]"
  >
    <!-- Header -->
    <div class="flex items-start justify-between border-b border-white/10 pb-3">
      <div class="flex flex-col gap-0.5">
        <h4 class="text-white text-base font-black tracking-wide uppercase">
          {{ core.name }}
        </h4>
        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Tier {{ tierRoman }} Core
        </span>
      </div>
      <!-- Family Badge -->
      <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest text-gray-300">
        <span class="w-1.5 h-1.5 rounded-full" :class="currentConfig.dot"></span>
        {{ currentConfig.displayName }}
      </span>
    </div>

    <!-- Advanced Stats Grid -->
    <div class="grid grid-cols-3 gap-2 py-1">
      <div class="flex flex-col gap-0.5 bg-black/35 px-3 py-2 rounded-lg border border-white/5">
        <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Multiplier</span>
        <span class="text-sm font-black text-white font-mono">{{ stats.multiplier }}</span>
      </div>
      <div class="flex flex-col gap-0.5 bg-black/35 px-3 py-2 rounded-lg border border-white/5">
        <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Flat Buff</span>
        <span class="text-sm font-black text-white font-mono">{{ stats.flat }}</span>
      </div>
      <div class="flex flex-col gap-0.5 bg-black/35 px-3 py-2 rounded-lg border border-white/5">
        <span class="text-[8px] font-bold text-gray-500 uppercase tracking-wider">Mistakes</span>
        <span class="text-xs font-black font-mono truncate" :class="stats.penalty !== 'Standard' ? 'text-orange-400' : 'text-gray-300'">
          {{ stats.penalty }}
        </span>
      </div>
    </div>

    <!-- Details -->
    <div class="flex flex-col gap-1.5 text-xs text-gray-300/90 leading-relaxed">
      <p class="font-bold text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Tactical Description</p>
      <p class="italic text-gray-400 mb-1">
        "{{ core.description }}"
      </p>
      <div v-if="stats.mechanic" class="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] leading-relaxed text-lightBlue">
        {{ stats.mechanic }}
      </div>
    </div>

    <!-- Speech bubble pointer arrow -->
    <div 
      class="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]"
      :class="familyName === 'unknown' ? 'border-t-gray-500/50' : `border-t-${familyName === 'balanced' ? 'blue' : (familyName === 'combo' ? 'orange' : (familyName === 'speedster' ? 'cyan' : (familyName === 'oracle' ? 'violet' : (familyName === 'mission' ? 'amber' : (familyName === 'aegis' ? 'sky' : (familyName === 'power' ? 'pink' : 'purple'))))))}-500/50`"
      style="border-top-color: inherit;"
    ></div>
  </div>
</template>
