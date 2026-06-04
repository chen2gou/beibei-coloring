/**
 * Canvas 游戏逻辑 Composable
 *
 * @author chengao
 * @date 2026年6月3日
 */

import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useGameStore } from '../stores/game'
import { colors } from '../data/levels'

export function useCanvas(canvasRef) {
  const gameStore = useGameStore()

  const CANVAS_RENDER_SCALE = window.devicePixelRatio || 1

  // Canvas 状态
  const ctx = ref(null)
  const scale = ref(1)
  const offsetX = ref(0)
  const offsetY = ref(0)
  const canvasWidth = ref(0)
  const canvasHeight = ref(0)

  // 拖拽状态
  const isDragging = ref(false)
  const hasDragged = ref(false)
  const lastX = ref(0)
  const lastY = ref(0)
  const dragStartX = ref(0)
  const dragStartY = ref(0)

  // 双指缩放状态
  const isPinching = ref(false)
  const pinchStartDistance = ref(0)
  const pinchStartScale = ref(1)
  const pinchStartOffsetX = ref(0)
  const pinchStartOffsetY = ref(0)
  const pinchCenterX = ref(0)
  const pinchCenterY = ref(0)

  // 长按拖拽填色状态
  const isLongPressMode = ref(false)
  const longPressTimer = ref(null)
  const paintedCells = ref(new Set())
  const brushX = ref(0)
  const brushY = ref(0)
  const brushRadius = ref(25)

  // 完成回调
  let completionCallback = null

  function getTouchDistance(touches) {
    const dx = touches[0].clientX - touches[1].clientX
    const dy = touches[0].clientY - touches[1].clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  function getTouchCenter(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    }
  }

  function getTouchCenterInContainer(touches) {
    const center = getTouchCenter(touches)
    const container = canvasRef.value?.parentElement
    if (!container) return center

    const rect = container.getBoundingClientRect()
    return {
      x: center.x - rect.left,
      y: center.y - rect.top
    }
  }

  function clearLongPressTimer() {
    if (longPressTimer.value) {
      clearTimeout(longPressTimer.value)
      longPressTimer.value = null
    }
  }

  // 设置完成回调
  function setCompletionCallback(callback) {
    completionCallback = callback
  }

  // 初始化 Canvas
  function initCanvas() {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    const level = gameStore.currentLevel
    if (!level) return

    canvasWidth.value = level.size * 40
    canvasHeight.value = level.data.length * 40
    canvas.width = canvasWidth.value * CANVAS_RENDER_SCALE
    canvas.height = canvasHeight.value * CANVAS_RENDER_SCALE
    canvas.style.width = `${canvasWidth.value}px`
    canvas.style.height = `${canvasHeight.value}px`
    ctx.value = canvas.getContext('2d')
    ctx.value.setTransform(CANVAS_RENDER_SCALE, 0, 0, CANVAS_RENDER_SCALE, 0, 0)

    resetZoom()
    drawGrid()
  }

  // 绘制网格
  function drawGrid() {
    if (!ctx.value || !canvasRef.value) return

    const canvas = canvasRef.value
    ctx.value.clearRect(0, 0, canvasWidth.value, canvasHeight.value)

    gameStore.grid.forEach((cell) => {
      if (cell.filled) {
        // 已填充的格子
        ctx.value.fillStyle = colors[cell.number - 1]
        ctx.value.fillRect(cell.x, cell.y, cell.size, cell.size)
      } else {
        // 未填充的格子
        // 当前数字的格子使用浅灰色背景
        if (cell.number === gameStore.currentNumber) {
          ctx.value.fillStyle = '#f0f0f0'
        } else {
          ctx.value.fillStyle = '#ffffff'
        }
        ctx.value.fillRect(cell.x, cell.y, cell.size, cell.size)

        // 绘制数字
        ctx.value.fillStyle = '#999'
        ctx.value.font = 'bold 16px Arial'
        ctx.value.textAlign = 'center'
        ctx.value.textBaseline = 'middle'
        ctx.value.fillText(
          cell.number,
          cell.x + cell.size / 2,
          cell.y + cell.size / 2
        )
      }

      // 绘制边框
      ctx.value.strokeStyle = '#ddd'
      ctx.value.lineWidth = 1
      ctx.value.strokeRect(cell.x, cell.y, cell.size, cell.size)
    })
  }

  // 处理点击/触摸
  function handleCellClick(e) {
    e.preventDefault()

    let clientX, clientY
    if (e.type.startsWith('touch')) {
      if (e.touches.length > 1) return
      const touch = e.touches[0] || e.changedTouches[0]
      clientX = touch.clientX
      clientY = touch.clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const canvas = canvasRef.value
    const rect = canvas.getBoundingClientRect()
    const x = (clientX - rect.left) / scale.value
    const y = (clientY - rect.top) / scale.value

    // 查找点击的格子
    const clickedCell = gameStore.grid.find(cell =>
      x >= cell.x && x < cell.x + cell.size &&
      y >= cell.y && y < cell.y + cell.size &&
      !cell.filled
    )

    if (clickedCell && clickedCell.number === gameStore.currentNumber) {
      clickedCell.filled = true
      gameStore.filledCells.add(clickedCell)
      drawGrid()
      checkProgress()
    }
  }

  // 检查进度
  function checkProgress() {
    const totalCurrent = gameStore.grid.filter(c => c.number === gameStore.currentNumber).length
    const filledCurrent = gameStore.grid.filter(c => c.number === gameStore.currentNumber && c.filled).length

    // 当前数字填完，自动切换到下一个
    if (filledCurrent === totalCurrent) {
      if (gameStore.currentNumber < gameStore.currentLevel.maxNumber) {
        setTimeout(() => {
          gameStore.currentNumber++
          drawGrid()
        }, 500)
      } else {
        // 全部完成
        setTimeout(() => {
          gameStore.completeLevel(gameStore.currentLevel.id)
          if (completionCallback) {
            completionCallback()
          }
        }, 500)
      }
    }
  }

  // 缩放功能
  function zoomIn() {
    scale.value = Math.min(scale.value * 1.2, 5)
    updateTransform()
  }

  function zoomOut() {
    scale.value = Math.max(scale.value / 1.2, 0.5)
    updateTransform()
  }

  function fitCanvasToContainer() {
    if (!canvasRef.value) return

    const canvas = canvasRef.value
    const container = canvas.parentElement
    if (!container) return

    const padding = 32
    const containerWidth = Math.max(container.clientWidth - padding * 2, 0)
    const containerHeight = Math.max(container.clientHeight - padding * 2, 0)
    const fitScale = Math.min(
      containerWidth / canvasWidth.value,
      containerHeight / canvasHeight.value,
      1
    )

    scale.value = Math.max(fitScale, 0.35)
    offsetX.value = Math.round((container.clientWidth - canvasWidth.value * scale.value) / 2)
    offsetY.value = Math.round((container.clientHeight - canvasHeight.value * scale.value) / 2)
    updateTransform()
  }

  function resetZoom() {
    fitCanvasToContainer()
  }

  function updateTransform() {
    if (!canvasRef.value) return

    const displayWidth = canvasWidth.value * scale.value
    const displayHeight = canvasHeight.value * scale.value
    canvasRef.value.width = displayWidth * CANVAS_RENDER_SCALE
    canvasRef.value.height = displayHeight * CANVAS_RENDER_SCALE
    canvasRef.value.style.width = `${displayWidth}px`
    canvasRef.value.style.height = `${displayHeight}px`
    canvasRef.value.style.transform = `translate(${offsetX.value}px, ${offsetY.value}px)`
    ctx.value = canvasRef.value.getContext('2d')
    ctx.value.setTransform(scale.value * CANVAS_RENDER_SCALE, 0, 0, scale.value * CANVAS_RENDER_SCALE, 0, 0)
    drawGrid()
  }

  // 拖拽功能
  function handleDragStart(e) {
    if (e.type === 'touchstart' && e.touches.length >= 2) {
      e.preventDefault()
      clearLongPressTimer()

      const center = getTouchCenterInContainer(e.touches)
      isPinching.value = true
      isDragging.value = false
      hasDragged.value = true
      isLongPressMode.value = false
      paintedCells.value.clear()
      pinchStartDistance.value = getTouchDistance(e.touches)
      pinchStartScale.value = scale.value
      pinchStartOffsetX.value = offsetX.value
      pinchStartOffsetY.value = offsetY.value
      pinchCenterX.value = center.x
      pinchCenterY.value = center.y
      return
    }

    if (e.type === 'touchstart' && e.touches.length > 1) return

    isDragging.value = true
    hasDragged.value = false
    isLongPressMode.value = false
    paintedCells.value.clear()

    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY
    lastX.value = clientX
    lastY.value = clientY
    dragStartX.value = clientX
    dragStartY.value = clientY

    // 300ms 长按检测
    longPressTimer.value = setTimeout(() => {
      if (isDragging.value && !hasDragged.value) {
        isLongPressMode.value = true
        // 震动反馈
        if (navigator.vibrate) {
          navigator.vibrate(50)
        }
        // 初始化画笔位置
        updateBrushPosition(clientX, clientY)
        if (canvasRef.value) {
          canvasRef.value.style.cursor = 'crosshair'
        }
      }
    }, 300)
  }

  function handleDragMove(e) {
    if (e.type.startsWith('touch') && e.touches.length >= 2) {
      e.preventDefault()
      if (!isPinching.value || !pinchStartDistance.value) return

      const center = getTouchCenterInContainer(e.touches)
      const nextScale = Math.max(
        0.35,
        Math.min(pinchStartScale.value * (getTouchDistance(e.touches) / pinchStartDistance.value), 5)
      )
      const canvasX = (pinchCenterX.value - pinchStartOffsetX.value) / pinchStartScale.value
      const canvasY = (pinchCenterY.value - pinchStartOffsetY.value) / pinchStartScale.value

      scale.value = nextScale
      offsetX.value = center.x - canvasX * nextScale
      offsetY.value = center.y - canvasY * nextScale
      updateTransform()
      return
    }

    if (!isDragging.value) return

    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX
    const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY

    // 计算移动距离
    const deltaX = clientX - dragStartX.value
    const deltaY = clientY - dragStartY.value
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 移动超过 5 像素
    if (distance > 5) {
      hasDragged.value = true
      e.preventDefault()

      if (isLongPressMode.value) {
        // 长按填色模式
        updateBrushPosition(clientX, clientY)
        fillCellsUnderBrush()
        drawGrid()
        drawBrushCursor()
      } else {
        // 短按拖动模式：移动画布
        offsetX.value += clientX - lastX.value
        offsetY.value += clientY - lastY.value
        updateTransform()
      }

      lastX.value = clientX
      lastY.value = clientY
    } else if (isLongPressMode.value) {
      // 长按但未移动，也显示画笔
      e.preventDefault()
      updateBrushPosition(clientX, clientY)
      drawBrushCursor()
    }
  }

  function handleDragEnd() {
    if (isPinching.value) {
      isPinching.value = false
      isDragging.value = false
      isLongPressMode.value = false
      paintedCells.value.clear()
      clearLongPressTimer()
      if (canvasRef.value) {
        canvasRef.value.style.cursor = 'pointer'
      }
      setTimeout(() => {
        hasDragged.value = false
      }, 50)
      return
    }

    clearLongPressTimer()

    // 如果在填色模式，清除画笔光标
    if (isLongPressMode.value) {
      drawGrid()
      checkProgress()
    }

    isDragging.value = false
    isLongPressMode.value = false
    paintedCells.value.clear()
    if (canvasRef.value) {
      canvasRef.value.style.cursor = 'pointer'
    }

    // 延迟重置
    setTimeout(() => {
      hasDragged.value = false
    }, 50)
  }

  // 更新画笔位置
  function updateBrushPosition(clientX, clientY) {
    if (!canvasRef.value) return
    const rect = canvasRef.value.getBoundingClientRect()
    brushX.value = (clientX - rect.left) / scale.value
    brushY.value = (clientY - rect.top) / scale.value
  }

  // 绘制画笔光标
  function drawBrushCursor() {
    if (!isLongPressMode.value || !ctx.value) return

    ctx.value.save()
    ctx.value.strokeStyle = colors[gameStore.currentNumber - 1]
    ctx.value.fillStyle = colors[gameStore.currentNumber - 1] + '33'
    ctx.value.lineWidth = 3

    ctx.value.beginPath()
    ctx.value.arc(brushX.value, brushY.value, brushRadius.value, 0, Math.PI * 2)
    ctx.value.fill()
    ctx.value.stroke()

    ctx.value.restore()
  }

  // 填充画笔圈内的格子
  function fillCellsUnderBrush() {
    gameStore.grid.forEach((cell, index) => {
      if (cell.filled || paintedCells.value.has(index)) return
      if (cell.number !== gameStore.currentNumber) return

      const cellCenterX = cell.x + cell.size / 2
      const cellCenterY = cell.y + cell.size / 2

      const dx = cellCenterX - brushX.value
      const dy = cellCenterY - brushY.value
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= brushRadius.value) {
        cell.filled = true
        gameStore.filledCells.add(cell)
        paintedCells.value.add(index)
      }
    })
  }

  function handleResize() {
    if (canvasRef.value) {
      fitCanvasToContainer()
    }
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('orientationchange', handleResize)
  })

  // 监听当前数字变化，重绘网格
  watch(() => gameStore.currentNumber, () => {
    drawGrid()
  })

  return {
    initCanvas,
    drawGrid,
    handleCellClick,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
    zoomIn,
    zoomOut,
    resetZoom,
    fitCanvasToContainer,
    isPinching,
    hasDragged,
    checkProgress,
    setCompletionCallback
  }
}
