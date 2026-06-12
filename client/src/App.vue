<template>
  <div class="relative w-screen h-screen overflow-hidden bg-background">
    <div id="phaser-container" class="absolute inset-0 z-0" />
    <div class="absolute inset-0 z-10">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Phaser from 'phaser'
import { createPhaserGame } from './game/PhaserGame'

let game: Phaser.Game | null = null

onMounted(() => {
  game = createPhaserGame('phaser-container')
})

onUnmounted(() => {
  game?.destroy(true)
})
</script>
