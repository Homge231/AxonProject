<template>
  <transition name="wind-fade">
    <div class="speedster-wind-container pointer-events-none" style="border: 4px solid red; background: rgba(255,0,0,0.1);">
      <span class="wind-streak ws1"></span>
      <span class="wind-streak ws2"></span>
      <span class="wind-streak ws3"></span>
      <span class="wind-streak ws4"></span>
      <span class="wind-streak ws5"></span>
      <span class="wind-streak ws6"></span>
    </div>
  </transition>
</template>

<script setup lang="ts">
defineProps<{
  active: boolean
  playing: boolean
}>()
</script>

<style scoped>
.speedster-wind-container {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
  border-radius: inherit;
}

.wind-streak {
  position: absolute;
  left: -160px;
  height: 2px;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.7), rgba(255, 255, 255, 0.9), transparent);
  animation: windMove 0.9s linear infinite;
  filter: blur(1px);
  opacity: 0;
}

.ws1 {
  top: 18%;
  width: 160px;
  animation-delay: 0s;
  animation-duration: 0.75s;
}

.ws2 {
  top: 35%;
  width: 220px;
  animation-delay: 0.15s;
  animation-duration: 0.90s;
}

.ws3 {
  top: 50%;
  width: 140px;
  animation-delay: 0.05s;
  animation-duration: 0.65s;
}

.ws4 {
  top: 62%;
  width: 200px;
  animation-delay: 0.30s;
  animation-duration: 0.80s;
}

.ws5 {
  top: 28%;
  width: 100px;
  animation-delay: 0.42s;
  animation-duration: 0.70s;
}

.ws6 {
  top: 75%;
  width: 180px;
  animation-delay: 0.22s;
  animation-duration: 0.95s;
}

@keyframes windMove {
  0% {
    transform: translateX(0);
    opacity: 0;
  }
  15% {
    opacity: 0.9;
  }
  80% {
    opacity: 0.6;
  }
  100% {
    transform: translateX(calc(100vw + 260px));
    opacity: 0;
  }
}

.wind-fade-enter-active,
.wind-fade-leave-active {
  transition: opacity 0.4s ease;
}

.wind-fade-enter-from,
.wind-fade-leave-to {
  opacity: 0;
}
</style>
