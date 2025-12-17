<script setup lang="ts">
import { ref } from "vue";

const teamValue = ref("");
const emit = defineEmits<{ (e: "updateValue", value: string): void }>();
const teamsSelect = ref([
  "Строитель (г. Гулькевичи)",
  "Сокол (с. Соколовское)",
  "Урожай (ст. Скобелевская)",
  "Школьники (п. Комсомольский)",
  "Смена (с. Новоукраинское)",
  "Вершина (ст. Казанская)",
  "Кропоткин-Юг (г. Кропоткин)",
]);

function sendValue() {
  emit("updateValue", teamValue.value);
}
</script>

<template>
  <FloatLabel class="selectTeam" variant="on">
    <Select v-model="teamValue" @change="sendValue" :options="teamsSelect" class="w-full" size="large" fluid />
    <label>
      <slot></slot>
    </label>
  </FloatLabel>
</template>

<style scoped>
.selectTeam {
  width: 50%;
}

@media (max-width: 480px) {
  .selectTeam {
    width: 100%;
  }
}
</style>
