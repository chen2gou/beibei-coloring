<template>
  <PxContainer class="game-view">
    <PxHeader bordered dark class="game-header">
      <div class="header-actions">
        <PxButton variant="outline" size="medium" @click="backToLevelSelector">
          ← 返回
        </PxButton>

        <PxButton theme="danger" variant="outline" size="medium" @click="resetLevel()">
          重置
        </PxButton>
      </div>

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
        <PxButton
          shape="circle"
          size="large"
          variant="plain"
          :aria-label="bgm.enabled.value ? '关闭背景音乐' : '开启背景音乐'"
          @click="bgm.toggleBgm()"
        >
          <template #icon>
            <IconSoundOn v-if="bgm.enabled.value" />
            <IconSoundMute v-else />
          </template>
        </PxButton>
        <PxButton shape="circle" size="large" variant="plain" aria-label="放大图案" @click="canvasLogic.zoomIn()">
          <template #icon><IconPlus /></template>
        </PxButton>
        <PxButton shape="circle" size="large" variant="plain" aria-label="缩小图案" @click="canvasLogic.zoomOut()">
          <template #icon><IconMinus /></template>
        </PxButton>
        <PxButton shape="circle" size="large" variant="plain" aria-label="重置视图" @click="canvasLogic.resetZoom()">
          <template #icon><IconRefresh /></template>
        </PxButton>
      </PxSpace>
    </PxMain>

    <CompletionModal
      :show="showCompletionModal"
      :levelName="gameStore.currentLevel?.name"
      :hasNextLevel="hasNextLevel"
      @close="showCompletionModal = false"
      @nextLevel="handleNextLevel"
      @backToLevels="backToLevelSelector"
    />
  </PxContainer>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, inject } from 'vue'
import { IconMinus, IconPlus, IconRefresh, IconSoundMute, IconSoundOn } from '@pixelium/web-vue/icon-hn/es'
import { useGameStore } from '../stores/game'
import { useCanvas } from '../composables/useCanvas'
import { colors } from '../data/levels'
import { levels } from '../data/levels'
import CompletionModal from './CompletionModal.vue'

const gameStore = useGameStore()
const bgm = inject('bgm')
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
  if (!canvasLogic.hasDragged.value) {
    canvasLogic.handleCellClick(e)
  }
  canvasLogic.handleDragEnd()
}

function handleTouchStart(e) {
  canvasLogic.handleDragStart(e)
}

function handleTouchEnd(e) {
  if (!canvasLogic.hasDragged.value && !canvasLogic.isPinching.value) {
    canvasLogic.handleCellClick(e)
  }
  canvasLogic.handleDragEnd()
}

function backToLevelSelector() {
  bgm.stopBgm()
  gameStore.backToLevelSelector()
}

function resetLevel() {
  if (confirm('确定要重置当前关卡吗？')) {
    gameStore.clearLevelProgress(gameStore.currentLevelId)
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

onMounted(async () => {
  canvasLogic.initCanvas()
  canvasLogic.setCompletionCallback(showCompletion)
  await nextTick()
  canvasLogic.fitCanvasToContainer()
})

watch(() => gameStore.currentLevelId, async () => {
  if (gameStore.currentLevelId) {
    canvasLogic.initCanvas()
    await nextTick()
    canvasLogic.fitCanvasToContainer()
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
  flex-direction: column;
  align-items: stretch;
  gap: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.current-color {
  align-self: center;
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
  height: calc(100dvh - 88px);
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
    min-height: 168px;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .current-color {
    min-width: 100%;
    justify-content: center;
    flex-wrap: wrap;
  }

  .canvas-container {
    height: calc(100vh - 168px);
    height: calc(100dvh - 168px);
  }
}
</style>
