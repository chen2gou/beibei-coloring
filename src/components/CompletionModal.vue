<template>
  <PxDialog
    :visible="show"
    type="success"
    :mask-closable="true"
    :show-cancel="false"
    ok-text="关闭"
    @update:visible="handleVisibleChange"
  >
    <div class="fireworks" aria-hidden="true">
      <span class="spark spark-1"></span>
      <span class="spark spark-2"></span>
      <span class="spark spark-3"></span>
      <span class="spark spark-4"></span>
      <span class="spark spark-5"></span>
      <span class="spark spark-6"></span>
      <span class="spark spark-7"></span>
      <span class="spark spark-8"></span>
      <span class="spark spark-9"></span>
      <span class="spark spark-10"></span>
      <span class="spark spark-11"></span>
      <span class="spark spark-12"></span>
    </div>

    <div class="completion-content">
      <div class="victory-badge">CLEAR</div>
      <PxTextOutline color="#1f1733" :outline-width="3">
        <div class="celebration">过关成功</div>
      </PxTextOutline>
      <div class="level-chip">{{ levelName }}</div>
      <p class="message">太棒了，整幅图案已经填色完成！</p>
      <PxSpace margin="medium" direction="vertical" align="stretch" class="actions">
        <PxButton v-if="hasNextLevel" theme="success" variant="plain" block @click="handleNextLevel">
          下一关 →
        </PxButton>
        <PxButton variant="outline" block @click="handleBackToLevels">
          返回关卡选择
        </PxButton>
      </PxSpace>
    </div>
  </PxDialog>
</template>

<script setup>
defineProps({
  show: Boolean,
  levelName: String,
  hasNextLevel: Boolean
})

const emit = defineEmits(['close', 'nextLevel', 'backToLevels'])

function handleVisibleChange(visible) {
  if (!visible) {
    emit('close')
  }
}

function handleNextLevel() {
  emit('nextLevel')
}

function handleBackToLevels() {
  emit('backToLevels')
}
</script>

<style scoped>
.fireworks {
  position: fixed;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.spark {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #ffd93d;
  box-shadow:
    0 -34px 0 #ff6b6b,
    24px -24px 0 #6bcf7f,
    34px 0 0 #4d96ff,
    24px 24px 0 #ff85b3,
    0 34px 0 #ffd93d,
    -24px 24px 0 #00c2a8,
    -34px 0 0 #9d4edd,
    -24px -24px 0 #f687b3;
  animation: pixel-firework 1.2s steps(4) infinite;
}

.spark-1 { left: 18%; top: 18%; animation-delay: 0s; }
.spark-2 { left: 78%; top: 16%; animation-delay: 0.15s; }
.spark-3 { left: 12%; top: 62%; animation-delay: 0.3s; }
.spark-4 { left: 84%; top: 64%; animation-delay: 0.45s; }
.spark-5 { left: 50%; top: 12%; animation-delay: 0.6s; }
.spark-6 { left: 52%; top: 76%; animation-delay: 0.75s; }
.spark-7 { left: 30%; top: 36%; animation-delay: 0.2s; }
.spark-8 { left: 68%; top: 38%; animation-delay: 0.4s; }
.spark-9 { left: 24%; top: 82%; animation-delay: 0.55s; }
.spark-10 { left: 74%; top: 84%; animation-delay: 0.7s; }
.spark-11 { left: 8%; top: 34%; animation-delay: 0.85s; }
.spark-12 { left: 92%; top: 34%; animation-delay: 1s; }

.completion-content {
  position: relative;
  z-index: 2;
  min-width: 320px;
  padding: 18px 0 6px;
  text-align: center;
}

.victory-badge {
  display: inline-block;
  margin-bottom: 14px;
  padding: 8px 16px;
  border: 4px solid #1f1733;
  background: #ffd93d;
  color: #1f1733;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: 3px;
  box-shadow: 6px 6px 0 #00c2a8;
  animation: badge-pop 0.7s steps(4) both;
}

.celebration {
  color: #fff7c7;
  font-size: 42px;
  font-weight: 900;
  letter-spacing: 4px;
  line-height: 1.1;
  animation: title-pulse 1s steps(2) infinite;
}

.level-chip {
  display: inline-block;
  margin-top: 16px;
  padding: 8px 14px;
  border: 3px solid #2a2042;
  background: #fbb6ce;
  color: #2a2042;
  font-size: 18px;
  font-weight: 800;
  box-shadow: 4px 4px 0 #d6b84a;
}

.message {
  margin: 18px 0 24px;
  color: #2a2042;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.6;
}

.actions {
  width: 100%;
}

@keyframes pixel-firework {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(0deg);
  }
  30% {
    opacity: 1;
    transform: scale(0.8) rotate(0deg);
  }
  70% {
    opacity: 1;
    transform: scale(1.3) rotate(90deg);
  }
  100% {
    opacity: 0;
    transform: scale(1.6) rotate(90deg);
  }
}

@keyframes badge-pop {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.7);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes title-pulse {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .spark,
  .victory-badge,
  .celebration {
    animation: none;
  }
}

@media (max-width: 768px) {
  .completion-content {
    min-width: 280px;
  }

  .celebration {
    font-size: 32px;
  }

  .message {
    font-size: 16px;
  }
}
</style>
