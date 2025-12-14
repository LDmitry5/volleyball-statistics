<script setup lang="ts">
import type { ITableRow } from "@/types/types";
import { computed } from "vue";

const props = defineProps<{
  totalPlusTeam1: number;
  totalMinusTeam1: number;
  totalPlusTeam2: number;
  totalMinusTeam2: number;
  playersTeam1: ITableRow[];
  playersTeam2: ITableRow[];
  titleTableTeam1: string;
  titleTableTeam2: string;
}>();

// Топ‑2 лучших и худших игроков для команды 1
const top2BestTeam1 = computed(() => {
  return [...props.playersTeam1].sort((a, b) => (b.kpd ?? 0) - (a.kpd ?? 0)).slice(0, 2);
});

const top2WorstTeam1 = computed(() => {
  return [...props.playersTeam1]
    .sort((a, b) => (a.kpd ?? 0) - (b.kpd ?? 0))
    .slice(0, 2)
    .sort((a, b) => (a.kpd ?? 0) - (b.kpd ?? 0));
});

// Топ‑2 лучших и худших игроков для команды 2
const top2BestTeam2 = computed(() => {
  return [...props.playersTeam2].sort((a, b) => (b.kpd ?? 0) - (a.kpd ?? 0)).slice(0, 2);
});

const top2WorstTeam2 = computed(() => {
  return [...props.playersTeam2]
    .sort((a, b) => (a.kpd ?? 0) - (b.kpd ?? 0))
    .slice(0, 2)
    .sort((a, b) => (a.kpd ?? 0) - (b.kpd ?? 0));
});

// Общее количество действий команды
const totalActionsTeam1 = computed(() => {
  return props.totalPlusTeam1 + props.totalMinusTeam1;
});
const totalActionsTeam2 = computed(() => {
  return props.totalPlusTeam2 + props.totalMinusTeam2;
});

// Общее количество действий по матчу
const totalActionsOverall = computed(() => {
  return totalActionsTeam1.value + totalActionsTeam2.value;
});

// Эффективность матча
const successRate = computed(() => {
  const total = totalActionsOverall.value;
  const success = props.totalPlusTeam1 + props.totalPlusTeam2;
  return total === 0 ? 0 : Math.round((success / total) * 100);
});

// Общее количество ошибок по матчу
const totalMinusTeams = computed(() => {
  return props.totalMinusTeam1 + props.totalMinusTeam2;
});

// КПД команд
const totalKPDTeam1 = computed(() => {
  return props.totalPlusTeam1 === 0 ? 0 : Math.round((props.totalPlusTeam1 / totalActionsTeam1.value) * 100);
});

const totalKPDTeam2 = computed(() => {
  return props.totalPlusTeam2 === 0 ? 0 : Math.round((props.totalPlusTeam2 / totalActionsTeam2.value) * 100);
});
</script>

<template>
  <div class="stats-container">
    <header class="stats-header">
      <div class="logo-wrapper">
        <i class="pi pi-chart-bar text-4xl text-indigo-600"></i>
      </div>
      <h1 class="title">Аналитика матча</h1>
    </header>

    <!-- Основные метрики -->
    <Fieldset legend="Основные метрики">
      <div class="metric-card">
        <div class="metric-title">Общее количество действий</div>
        <div class="metric-value">{{ totalActionsOverall }}</div>
      </div>
      <div class="metric-card danger">
        <div class="metric-title">Ошибочных</div>
        <div class="metric-value">{{ totalMinusTeams }}</div>
      </div>
      <div class="metric-card success">
        <div class="metric-title">Эффективность</div>
        <div class="metric-value">{{ successRate }}&thinsp;%</div>
      </div>
    </Fieldset>

    <div class="teams-grid">
      <!-- Команда 1 -->
      <Fieldset :legend="titleTableTeam1">
        <div class="team-section">
          <div class="team-stats">
            <div class="stat-item">
              <span>Всего действий:</span>
              <span>{{ totalActionsTeam1 }}</span>
            </div>
            <div class="stat-item success">
              <span>Успешных:</span>
              <span>{{ props.totalPlusTeam1 }}</span>
            </div>
            <div class="stat-item danger">
              <span>Ошибочных:</span>
              <span>{{ props.totalMinusTeam1 }}</span>
            </div>
            <div class="stat-item">
              <span>Эффективность:</span>
              <span>{{ totalKPDTeam1 }}&thinsp;%</span>
            </div>
          </div>

          <!-- Лучшие игроки -->
          <div class="players-group">
            <h3 class="group-title">
              <i class="pi pi-trophy text-yellow-500 mr-2"></i>
              Лучшие игроки
            </h3>
            <div class="player-cards">
              <div v-for="(player, idx) in top2BestTeam1" :key="player.id" class="player-card best">
                <div class="rank">#{{ idx + 1 }}</div>
                <div class="player-info">
                  <div>{{ player.name }}</div>
                  <div>КПД: {{ player.kpd }}&thinsp;%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Худшие игроки -->
          <div class="players-group">
            <h3 class="group-title">
              <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
              Худшие игроки
            </h3>
            <div class="player-cards">
              <div v-for="(player, idx) in top2WorstTeam1" :key="player.id" class="player-card worst">
                <div class="rank">#{{ idx + 1 }}</div>
                <div class="player-info">
                  <div>{{ player.name }}</div>
                  <div>КПД: {{ player.kpd }}&thinsp;%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fieldset>

      <!-- Команда 2 -->
      <Fieldset :legend="titleTableTeam2">
        <div class="team-section">
          <div class="team-stats">
            <div class="stat-item">
              <span>Всего действий:</span>
              <span>{{ totalActionsTeam2 }}</span>
            </div>
            <div class="stat-item success">
              <span>Успешных:</span>
              <span>{{ props.totalPlusTeam2 }}</span>
            </div>
            <div class="stat-item danger">
              <span>Ошибочных:</span>
              <span>{{ props.totalMinusTeam2 }}</span>
            </div>
            <div class="stat-item">
              <span>Эффективность:</span>
              <span>{{ totalKPDTeam2 }}&nbsp;%</span>
            </div>
          </div>

          <!-- Лучшие игроки -->
          <div class="players-group">
            <h3 class="group-title">
              <i class="pi pi-trophy text-yellow-500 mr-2"></i>
              Лучшие игроки
            </h3>
            <div class="player-cards">
              <div v-for="(player, idx) in top2BestTeam2" :key="player.id" class="player-card best">
                <div class="rank">#{{ idx + 1 }}</div>
                <div class="player-info">
                  <div>{{ player.name }}</div>
                  <div>КПД: {{ player.kpd }}&thinsp;%</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Худшие игроки -->
          <div class="players-group">
            <h3 class="group-title">
              <i class="pi pi-exclamation-triangle text-red-500 mr-2"></i>
              Худшие игроки
            </h3>
            <div class="player-cards">
              <div v-for="(player, idx) in top2WorstTeam2" :key="player.id" class="player-card worst">
                <div class="rank">#{{ idx + 1 }}</div>
                <div class="player-info">
                  <div>{{ player.name }}</div>
                  <div>КПД: {{ player.kpd }}&thinsp;%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Fieldset>
    </div>
  </div>
</template>
<style scoped>
.stats-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
  font-family: "Inter", sans-serif;
}

/* Заголовок */
.stats-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-color);
}

.logo-wrapper {
  background-color: var(--body-bg);
  width: 56px;
  height: 56px;
  display: grid;
  place-items: center;
  border-radius: var(--border-radius);
}

:deep(.p-fieldset-content) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  padding: 20px 10px;
}

.metric-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  flex: 1;
  background-color: var(--body-bg);
  border: var(--card-border);
  border-radius: var(--border-radius);
  border-left: 3px solid var(--body-text-color);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.metric-card.success {
  border-left: 3px solid #059669;
}

.metric-card.danger {
  border-left: 3px solid #dc2626;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 600;
}

.metric-card {
  text-align: center;
}

.metric-card:not(:first-child) .metric-title {
  line-height: 2rem;
}

/* Секция команд */
.teams-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
}

.team-section {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  gap: 20px;
}

/* Показатели команды */
.team-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: var(--border-radius);
  background-color: var(--body-bg);
  border-left: 3px solid var(--body-text-color);
}

.stat-item.success {
  border-left: 3px solid #059669;
}

.stat-item.danger {
  border-left: 3px solid #dc2626;
}

/* Группы игроков */
.players-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-title {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 10px 0;
}

.player-cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.player-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--border-radius);
  transition: all 0.3s ease;
  border: var(--card-border);
  background-color: var(--body-bg);
  border-left: 3px solid var(--body-text-color);
}

.player-card:hover {
  transform: translateX(4px);
}

.player-card.best {
  border-left: 3px solid #059669;
}

.player-card.worst {
  border-left: 3px solid #dc2626;
}

.rank {
  min-width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}

.player-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

@media (max-width: 1024px) {
  :deep(.p-fieldset-content) {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .teams-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .team-stats {
    grid-template-columns: 1fr;
  }

  .logo-wrapper {
    width: 48px;
    height: 48px;
  }

  .title {
    font-size: 1.5rem;
  }

  :deep(.p-fieldset-content) {
    gap: 20px;
    padding: 10px 0;
  }

  .metric-card {
    padding: 10px;
    gap: 5px;
  }

  .metric-value {
    font-size: 1.125rem;
    font-weight: 600;
  }
}

@media (max-width: 480px) {
  .logo-wrapper {
    width: 38px;
    height: 38px;
  }

  .title {
    font-size: 1.125rem;
  }

  :deep(.p-fieldset-content) {
    flex-direction: column;
    gap: 10px;
    font-size: 12px;
  }

  .metric-card:not(:first-child) .metric-title {
    line-height: 1rem;
  }

  .metric-card {
    width: 100%;
    gap: 10px;
  }

  .team-section {
    width: 100%;
  }
}
</style>
