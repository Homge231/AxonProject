<template>
  <div class="absolute inset-0 z-0">
    <div
      class="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-in-out"
      :style="{ backgroundImage: `url(${imageUrl})` }"
    ></div>

    <div class="absolute inset-0 bg-darkNavy/60 backdrop-blur-[2px]"></div>

    <div id="phaser-container" class="absolute inset-0 pointer-events-none"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'

defineProps<{
  imageUrl: string
}>()

let phaserGame: import('phaser').Game | null = null
let cancelled = false

const initPhaser = async () => {
  const Phaser = await import('phaser')
  if (cancelled) return

  class MagicScene extends Phaser.Scene {
    constructor() {
      super('MagicScene')
    }

    create() {
      const g = this.add.graphics()
      g.fillStyle(0xffeeba, 1)
      g.fillCircle(4, 4, 4)
      g.generateTexture('dust-mote', 8, 8)
      g.destroy()

      const width = this.scale.width
      const height = this.scale.height

      this.add.particles(0, 0, 'dust-mote', {
        x: { min: 0, max: width },
        y: { min: 0, max: height },
        lifespan: { min: 5000, max: 10000 },
        speedX: { min: -10, max: 20 },
        speedY: { min: -10, max: 20 },
        scale: { min: 0.1, max: 0.4 },
        alpha: { start: 0.6, end: 0 },
        quantity: 1,
        frequency: 150,
        blendMode: 'SCREEN'
      })
    }
  }

  const config: import('phaser').Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: 'phaser-container',
    width: window.innerWidth,
    height: window.innerHeight,
    transparent: true,
    scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: MagicScene
  }
  phaserGame = new Phaser.Game(config)
}

onMounted(() => {
  initPhaser()
})

onUnmounted(() => {
  cancelled = true
  if (phaserGame) phaserGame.destroy(true)
})
</script>
