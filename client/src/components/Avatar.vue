<template>
  <div
    v-if="src"
    class="fixed bottom-8 left-8 lg:left-12 z-20 pointer-events-none"
  >
    <div class="w-14 h-14 rounded-full bg-gradient-to-br from-blue to-lightBlue p-0.5 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
      <img
        :src="src"
        :alt="alt"
        class="w-full h-full rounded-full object-cover bg-darkNavy"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
}>()
</script>