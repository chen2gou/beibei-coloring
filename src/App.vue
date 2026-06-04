<template>
  <PxContainer id="app" class="pixelium app-shell">
    <LevelSelector v-if="!gameStore.currentLevelId" />
    <GameView v-else />
  </PxContainer>
</template>

<script setup>
import { onMounted } from 'vue'
import { useGameStore } from './stores/game'
import LevelSelector from './components/LevelSelector.vue'
import GameView from './components/GameView.vue'

const gameStore = useGameStore()

onMounted(() => {
  gameStore.initProgress()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

html,
body,
#app {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

body {
  font-family: var(--px-font), sans-serif;
}

.app-shell {
  width: 100vw;
  min-height: 100vh;
  min-height: 100dvh;
  padding: var(--safe-top) var(--safe-right) var(--safe-bottom) var(--safe-left);
  background: #1f1733;
}
</style>
