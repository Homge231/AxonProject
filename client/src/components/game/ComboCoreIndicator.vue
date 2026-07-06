<template>
  <div class="flex items-center gap-3 bg-darkNavy/40 backdrop-blur-md border border-lightOrange/30 px-5 py-2 rounded-2xl shadow-[0_0_15px_rgba(255,165,0,0.2)]">
    <span class="text-xs font-bold text-lightOrange/80 tracking-[0.2em] uppercase">🔥 Combo</span> 
    <span class="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-lightOrange drop-shadow-md tabular-nums">
      x{{ currentCombo }}
    </span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  currentCombo: number
}>()
</script>
