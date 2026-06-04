/**
 * 游戏状态管理 Store
 *
 * @author chengao
 * @date 2026年6月3日
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { levels } from '../data/levels'

export const useGameStore = defineStore('game', () => {
  // 当前关卡
  const currentLevelId = ref(null)
  const currentLevel = computed(() => {
    return levels.find(l => l.id === currentLevelId.value)
  })

  // 已完成的关卡 ID 列表
  const completedLevels = ref([])

  // 当前游戏状态
  const currentNumber = ref(1)
  const grid = ref([])
  const filledCells = ref(new Set())

  // 初始化游戏进度（从 localStorage 加载）
  function initProgress() {
    const saved = localStorage.getItem('paint-by-numbers-progress')
    if (saved) {
      try {
        const data = JSON.parse(saved)
        completedLevels.value = data.completedLevels || []
      } catch (e) {
        console.error('加载进度失败:', e)
      }
    }
  }

  // 保存进度到 localStorage
  function saveProgress() {
    const data = {
      completedLevels: completedLevels.value
    }
    localStorage.setItem('paint-by-numbers-progress', JSON.stringify(data))
  }

  // 选择关卡
  function selectLevel(levelId) {
    currentLevelId.value = levelId
    initLevel()
  }

  // 初始化关卡
  function initLevel() {
    if (!currentLevel.value) return

    const level = currentLevel.value
    const cellSize = 40

    // 转换图案数据为网格
    grid.value = []
    for (let row = 0; row < level.data.length; row++) {
      for (let col = 0; col < level.size; col++) {
        const num = level.data[row][col]
        if (num > 0) {
          grid.value.push({
            x: col * cellSize,
            y: row * cellSize,
            size: cellSize,
            number: num,
            filled: false
          })
        }
      }
    }

    currentNumber.value = 1
    filledCells.value = new Set()
  }

  // 检查关卡是否解锁
  function isLevelUnlocked(levelId) {
    if (levelId === 1) return true
    return completedLevels.value.includes(levelId - 1)
  }

  // 检查关卡是否完成
  function isLevelCompleted(levelId) {
    return completedLevels.value.includes(levelId)
  }

  // 标记关卡完成
  function completeLevel(levelId) {
    if (!completedLevels.value.includes(levelId)) {
      completedLevels.value.push(levelId)
      saveProgress()
    }
  }

  // 重置游戏
  function resetGame() {
    if (confirm('确定要重置所有进度吗？')) {
      completedLevels.value = []
      currentLevelId.value = null
      localStorage.removeItem('paint-by-numbers-progress')
    }
  }

  // 返回关卡选择界面
  function backToLevelSelector() {
    currentLevelId.value = null
  }

  return {
    currentLevelId,
    currentLevel,
    currentNumber,
    grid,
    filledCells,
    completedLevels,
    initProgress,
    selectLevel,
    initLevel,
    isLevelUnlocked,
    isLevelCompleted,
    completeLevel,
    resetGame,
    backToLevelSelector
  }
})
