<template>
  <PxContainer class="level-selector">
    <PxHeader bordered dark class="selector-header">
      <div class="title-wrap">
        <PxTextOutline color="#1f1733" :outline-width="2">
          <h1 class="title">贝贝填色</h1>
        </PxTextOutline>
        <PxTag theme="sakura" variant="plain" size="small">Pixel Color Quest</PxTag>
      </div>

      <PxButton theme="danger" variant="outline" size="medium" @click="gameStore.resetGame()">
        重置进度
      </PxButton>
    </PxHeader>

    <PxMain soft class="selector-main">
      <PxAlert type="info" variant="plain" :show-icon="false" class="intro-card">
        选择已解锁关卡，按数字填入对应颜色。完成上一关即可解锁下一关。
      </PxAlert>

      <PxGrid :column="24" :gutter="{ xs: 12, sm: 16, md: 20, lg: 24 }" class="levels-grid">
        <PxGridItem
          v-for="level in levels"
          :key="level.id"
          :span="{ xs: 24, sm: 12, md: 8, lg: 6, xl: 6, xxl: 4 }"
        >
          <button
            class="level-card"
            :class="{
              locked: !gameStore.isLevelUnlocked(level.id),
              completed: gameStore.isLevelCompleted(level.id)
            }"
            :disabled="!gameStore.isLevelUnlocked(level.id)"
            @click="handleLevelClick(level)"
          >
            <div class="card-topline">
              <PxTag theme="primary" variant="plain" size="small">LEVEL {{ level.id }}</PxTag>
              <PxTag
                v-if="gameStore.isLevelCompleted(level.id)"
                theme="success"
                variant="plain"
                shape="round"
                size="small"
              >
                已完成
              </PxTag>
              <PxTag
                v-else-if="!gameStore.isLevelUnlocked(level.id)"
                theme="info"
                variant="outline"
                shape="round"
                size="small"
              >
                未解锁
              </PxTag>
            </div>

            <div class="level-number">{{ level.id }}</div>
            <div class="level-name">{{ level.name }}</div>

            <PxSpace margin="small" justify="center" :wrap="true" class="level-meta">
              <PxTag :theme="level.difficulty === 'easy' ? 'success' : 'warning'" variant="outline" size="small">
                {{ level.difficulty === 'easy' ? '简单' : '中等' }}
              </PxTag>
              <PxTag theme="info" variant="outline" size="small">{{ level.colors }} 色</PxTag>
            </PxSpace>
          </button>
        </PxGridItem>
      </PxGrid>
    </PxMain>
  </PxContainer>
</template>

<script setup>
import { useGameStore } from '../stores/game'
import { levels } from '../data/levels'

const gameStore = useGameStore()

function handleLevelClick(level) {
  if (gameStore.isLevelUnlocked(level.id)) {
    gameStore.selectLevel(level.id)
  }
}
</script>

<style scoped>
.level-selector {
  min-height: 100vh;
  min-height: 100dvh;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
    linear-gradient(135deg, #332056 0%, #1b1430 100%);
  background-size: 24px 24px, 24px 24px, 100% 100%;
}

.selector-header {
  min-height: 88px;
  padding: 18px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.title-wrap {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.title {
  margin: 0;
  color: #fff7c7;
  font-size: 32px;
  letter-spacing: 2px;
  line-height: 1;
}

.selector-main {
  height: calc(100vh - 88px);
  overflow: auto;
  padding: 24px;
}

.intro-card {
  max-width: 960px;
  margin: 0 auto 24px;
}

.levels-grid {
  max-width: 1200px;
  margin: 0 auto;
}

.level-card {
  width: 100%;
  min-height: 220px;
  padding: 16px;
  border: 4px solid #2a2042;
  background: #fff8d8;
  color: #2a2042;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-shadow: 8px 8px 0 #100b1d;
  transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.12s ease;
  font-family: inherit;
}

.level-card:not(.locked):hover {
  transform: translate(-3px, -3px);
  box-shadow: 11px 11px 0 #100b1d;
}

.level-card:not(.locked):active {
  transform: translate(3px, 3px);
  box-shadow: 5px 5px 0 #100b1d;
}

.level-card.completed {
  border-color: #2fbf71;
}

.level-card.locked {
  opacity: 0.48;
  cursor: not-allowed;
  filter: grayscale(0.6);
}

.card-topline {
  width: 100%;
  min-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.level-number {
  font-size: 56px;
  font-weight: 900;
  line-height: 1;
  color: #6b45ff;
  text-shadow: 4px 4px 0 #f0cf5a;
}

.level-name {
  font-size: 22px;
  font-weight: 800;
}

.level-meta {
  min-height: 32px;
}

@media (max-width: 768px) {
  .selector-header {
    align-items: stretch;
  }

  .title {
    font-size: 24px;
  }

  .selector-main {
    height: calc(100vh - 120px);
    padding: 16px;
  }

  .level-card {
    min-height: 190px;
  }
}
</style>
