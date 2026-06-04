<template>
  <PxContainer class="game-view">
    <PxHeader bordered dark class="game-header">
      <PxButton variant="outline" size="medium" @click="gameStore.backToLevelSelector()">
        ← 返回
      </PxButton>

      <div class="current-color">
        <PxTag theme="primary" variant="plain">当前数字</PxTag>
        <div class="color-number">{{ gameStore.currentNumber }}</div>
        <div
          class="color-preview"
          :style="{ backgroundColor: colors[gameStore.currentNumber - 1] }"
        ></div>
        <div class="progress-wrap">
          <PxProgress
            :percentage="currentPercentage"
            theme="success"
            variant="primary"
            size="small"
            indicator-placement="inside"
          />
          <span class="progress-text">{{ filledCurrent }}/{{ totalCurrent }}</span>
        </div>
      </div>

      <PxButton theme="danger" variant="outline" size="medium" @click="resetLevel()">
        重置
      </PxButton>
    </PxHeader>

    <PxMain class="canvas-container" ref="containerRef">
      <canvas
        ref="canvasRef"
        @mousedown="handleMouseDown"
        @mousemove="canvasLogic.handleDragMove"
        @mouseup="handleMouseUp"
        @mouseleave="canvasLogic.handleDragEnd"
        @touchstart="handleTouchStart"
        @touchmove="canvasLogic.handleDragMove"
        @touchend="handleTouchEnd"
      ></canvas>

      <PxSpace margin="small" direction="vertical" class="zoom-controls">
        <PxButton shape="circle" size="large" variant="plain" @click="canvasLogic.zoomIn()">+</PxButton>
        <PxButton shape="circle" size="large" variant="plain" @click="canvasLogic.zoomOut()">−</PxButton>
        <PxButton shape="circle" size="large" variant="plain" @click="canvasLogic.resetZoom()">⟲</PxButton>
      </PxSpace>
    </PxMain>

    <CompletionModal
      :show="showCompletionModal"
      :levelName="gameStore.currentLevel?.name"
      :hasNextLevel="hasNextLevel"
      @close="showCompletionModal = false"
      @nextLevel="handleNextLevel"
      @backToLevels="gameStore.backToLevelSelector()"
    />
  </PxContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useGameStore } from '../stores/game'
import { useCanvas } from '../composables/useCanvas'
import { colors } from '../data/levels'
import { levels } from '../data/levels'
import CompletionModal from './CompletionModal.vue'

const gameStore = useGameStore()
const canvasRef = ref(null)
const containerRef = ref(null)
const showCompletionModal = ref(false)

const canvasLogic = useCanvas(canvasRef)

const totalCurrent = computed(() => {
  return gameStore.grid.filter(c => c.number === gameStore.currentNumber).length
})

const filledCurrent = computed(() => {
  return gameStore.grid.filter(c => c.number === gameStore.currentNumber && c.filled).length
})

const currentPercentage = computed(() => {
  if (!totalCurrent.value) return 0
  return Math.round((filledCurrent.value / totalCurrent.value) * 100)
})

const hasNextLevel = computed(() => {
  return gameStore.currentLevelId < levels.length
})

function handleMouseDown(e) {
  canvasLogic.handleDragStart(e)
}

function handleMouseUp(e) {
  if (!canvasLogic.hasDragged) {
    canvasLogic.handleCellClick(e)
  }
  canvasLogic.handleDragEnd()
}

function handleTouchStart(e) {
  canvasLogic.handleDragStart(e)
}

function handleTouchEnd(e) {
  if (!canvasLogic.hasDragged) {
    canvasLogic.handleCellClick(e)
  }
  canvasLogic.handleDragEnd()
}

function resetLevel() {
  if (confirm('确定要重置当前关卡吗？')) {
    gameStore.initLevel()
    canvasLogic.drawGrid()
  }
}

function handleNextLevel() {
  showCompletionModal.value = false
  if (hasNextLevel.value) {
    gameStore.selectLevel(gameStore.currentLevelId + 1)
  }
}

function showCompletion() {
  showCompletionModal.value = true
}

onMounted(() => {
  canvasLogic.initCanvas()
  canvasLogic.setCompletionCallback(showCompletion)
})

watch(() => gameStore.currentLevelId, () => {
  if (gameStore.currentLevelId) {
    canvasLogic.initCanvas()
  }
})
</script>

<style scoped>
.game-view {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    #1f1733;
  background-size: 24px 24px, 24px 24px, 100% 100%;
}

.game-header {
  min-height: 88px;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.current-color {
  min-width: 360px;
  padding: 10px 14px;
  border: 4px solid #2a2042;
  background: #fff8d8;
  color: #2a2042;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 6px 6px 0 #100b1d;
}

.color-number {
  min-width: 42px;
  text-align: center;
  font-size: 36px;
  font-weight: 900;
  color: #6b45ff;
  line-height: 1;
}

.color-preview {
  width: 44px;
  height: 44px;
  border: 4px solid #2a2042;
  box-shadow: 4px 4px 0 #d6b84a;
}

.progress-wrap {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.progress-text {
  font-size: 12px;
  text-align: center;
  color: #594d73;
}

.canvas-container {
  height: calc(100vh - 88px);
  position: relative;
  overflow: hidden;
  background: #f7f1dc;
  touch-action: none;
}

canvas {
  position: absolute;
  cursor: pointer;
  transform-origin: 0 0;
  image-rendering: pixelated;
}

.zoom-controls {
  position: absolute;
  right: 20px;
  bottom: 20px;
  z-index: 10;
}

@media (max-width: 768px) {
  .game-header {
    align-items: stretch;
  }

  .current-color {
    min-width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .canvas-container {
    height: calc(100vh - 180px);
  }
}
</style>
