<template>
  <PxDialog
    :visible="show"
    type="success"
    :mask-closable="true"
    :show-cancel="false"
    ok-text="关闭"
    @update:visible="handleVisibleChange"
  >
    <div class="completion-content">
      <PxTextOutline color="#1f1733" :outline-width="2">
        <div class="celebration">完成啦</div>
      </PxTextOutline>
      <p class="message">恭喜完成「{{ levelName }}」关卡</p>
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
.completion-content {
  min-width: 280px;
  padding: 8px 0 4px;
  text-align: center;
}

.celebration {
  color: #fff7c7;
  font-size: 34px;
  font-weight: 900;
  letter-spacing: 2px;
}

.message {
  margin: 18px 0 22px;
  color: #2a2042;
  font-size: 16px;
  line-height: 1.6;
}

.actions {
  width: 100%;
}
</style>
