<script setup lang="ts">
import { ref, watch } from "vue";
import { FilterMatchMode, FilterOperator } from "@primevue/core/api";
import type { ITableRow } from "@/types/types";

const players = ref<ITableRow[]>([]);
const filters = ref();
const props = defineProps<{ sharedRef: string }>();
const tableTitle = ref(props.sharedRef);

const emit = defineEmits<{
  (e: "playersUpdate", players: ITableRow[]): void;
}>();

// Наблюдаем за изменениями внешнего ref
watch(
  () => props.sharedRef,
  (newValue) => {
    tableTitle.value = newValue;
  }
);

// Добавление новой строки
const addPlayer = () => {
  players.value.push({
    id: crypto.randomUUID(),
    name: "",
    servePlus: 0,
    serveMinus: 0,
    attackPlus: 0,
    attackMinus: 0,
    rebatePlus: 0,
    rebateMinus: 0,
    blockPlus: 0,
    blockMinus: 0,
    receptionPlus: 0,
    receptionMinus: 0,
    total: 0,
    kpd: 0,
  });
  emit("playersUpdate", players.value);
};

const initFilters = () => {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
  };
};

initFilters();

const clearFilter = () => {
  initFilters();
};

// Вычисляем total для каждой строки
const calculateTotal = (row: ITableRow): number => {
  const plusSum =
    (row.servePlus ?? 0) +
    (row.attackPlus ?? 0) +
    (row.rebatePlus ?? 0) +
    (row.blockPlus ?? 0) +
    (row.receptionPlus ?? 0);
  const minusSum =
    (row.serveMinus ?? 0) +
    (row.attackMinus ?? 0) +
    (row.rebateMinus ?? 0) +
    (row.blockMinus ?? 0) +
    (row.receptionMinus ?? 0);
  return plusSum - minusSum;
};

// Вычисляем total для каждой строки
const calculateKPD = (row: ITableRow): number => {
  const total =
    (row.servePlus ?? 0) +
    (row.attackPlus ?? 0) +
    (row.rebatePlus ?? 0) +
    (row.blockPlus ?? 0) +
    (row.receptionPlus ?? 0) +
    (row.serveMinus ?? 0) +
    (row.attackMinus ?? 0) +
    (row.rebateMinus ?? 0) +
    (row.blockMinus ?? 0) +
    (row.receptionMinus ?? 0);

  const plusSum =
    (row.servePlus ?? 0) +
    (row.attackPlus ?? 0) +
    (row.rebatePlus ?? 0) +
    (row.blockPlus ?? 0) +
    (row.receptionPlus ?? 0);
  return total === 0 ? 0 : Math.round((plusSum / total) * 100);
};

// Обновляем КПД при изменении любых полей
const updateKPD = (row: ITableRow) => {
  row.total = calculateTotal(row);
  row.kpd = calculateKPD(row);
  emit("playersUpdate", players.value);
};
</script>

<template>
  <!-- Table -->
  <DataTable
    ref="dt"
    v-model:filters="filters"
    :value="players"
    showGridlines
    dataKey="id"
    stripedRows
    :globalFilterFields="['name']">
    <template #header>
      <div class="title-wrapper">
        {{ tableTitle }}
      </div>
      <div class="button-group">
        <Button icon="pi pi-plus" variant="outlined" class="button-sm" @click="addPlayer" />
        <div class="search-player">
          <Button type="button" icon="pi pi-filter-slash" class="button-sm" variant="outlined" @click="clearFilter" />
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="filters['global'].value" class="inputtext-sm" placeholder="Поиск игрока по фамилии" />
          </IconField>
        </div>
      </div>
    </template>
    <template style="text-align: start" #empty>Игроки не добавлены</template>
    <ColumnGroup type="header">
      <Row>
        <Column header="Имя" :rowspan="2" />
        <Column header="Подача" :colspan="2" />
        <Column header="Нападение" :colspan="2" />
        <Column header="Скидка" :colspan="2" />
        <Column header="Блок" :colspan="2" />
        <Column header="Приём" :colspan="2" />
        <Column header="КПД" :rowspan="2" />
      </Row>
      <Row>
        <Column header="+" />
        <Column header="-" />
        <Column header="+" />
        <Column header="-" />
        <Column header="+" />
        <Column header="-" />
        <Column header="+" />
        <Column header="-" />
        <Column header="+" />
        <Column header="-" />
      </Row>
    </ColumnGroup>
    <Column field="name">
      <template #body="{ data }">
        <InputText style="min-width: 150px; width: 100%" v-model="data.name" />
      </template>
    </Column>

    <!-- Подача -->
    <Column field="servePlus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.servePlus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.servePlus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>
    <Column field="serveMinus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.serveMinus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.serveMinus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>

    <!-- Нападение -->
    <Column field="attackPlus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.attackPlus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.attackPlus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>
    <Column field="attackMinus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.attackMinus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.attackMinus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>

    <!-- Скидка -->
    <Column field="receivePlus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.rebatePlus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.rebatePlus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>
    <Column field="receiveMinus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.rebateMinus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.rebateMinus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>

    <!-- Блок -->
    <Column field="blockPlus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.blockPlus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.blockPlus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>
    <Column field="blockMinus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.blockMinus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.blockMinus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>

    <!-- Прием -->
    <Column field="receptionPlus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.receptionPlus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.receptionPlus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>
    <Column field="receptionMinus">
      <template #body="{ data }">
        <div class="cell-width" :style="data.receptionMinus > 9 ? { width: '80px' } : { width: '72px' }">
          <InputNumber
            v-model="data.receptionMinus"
            showButtons
            buttonLayout="horizontal"
            :step="1"
            :min="0"
            :max="99"
            @update:modelValue="updateKPD(data)"
            fluid>
            <template #incrementicon>
              <span class="pi pi-plus" />
            </template>
            <template #decrementicon>
              <span class="pi pi-minus" />
            </template>
          </InputNumber>
        </div>
      </template>
    </Column>

    <!-- КПД -->
    <Column field="kpd">
      <template #body="{ data }">
        <div class="kpd-cell">{{ data.kpd ?? 0 }}&thinsp;%</div>
      </template>
    </Column>
  </DataTable>
</template>

<style scoped>
.title-wrapper,
:deep(.p-datatable-header) {
  border-radius: 10px 10px 0 0;
}

:deep(.p-datatable-column-header-content) {
  justify-content: center;
}

:deep(.p-datatable-tbody > tr:last-child > td:first-child) {
  border-bottom-left-radius: 10px;
}

:deep(.p-datatable-tbody > tr:last-child > td:last-child) {
  border-bottom-right-radius: 10px;
}

:deep(.p-datatable-tbody > tr > td) {
  padding: 8px;
  text-align: center;
  text-align: -webkit-center;
}

:deep(.p-inputnumber-horizontal .p-inputnumber-decrement-button),
:deep(.p-inputnumber-horizontal .p-inputnumber-increment-button) {
  width: 25px;
}

:deep(.p-inputnumber-fluid .p-inputnumber-input) {
  font-size: 14px;
  padding-block: 6px;
  padding-inline: 6px;
}

.button-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
}

.search-player {
  display: flex;
  gap: 12px;
}

:deep(.p-datatable-header) {
  padding: 0;
}

.title-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  background-color: var(--body-bg);
  padding: 24px;
}

.kpd-cell {
  text-align: center;
  font-weight: 500;
  min-width: 30px;
}

:deep(.p-datatable-empty-message) > td:last-child {
  text-align: start;
}

@media (max-width: 768px) {
  .button-sm {
    width: var(--p-button-sm-icon-only-width);
    font-size: var(--p-button-sm-font-size);
    padding: var(--p-button-sm-padding-y) var(--p-button-sm-padding-x);
  }
  .inputtext-sm {
    font-size: var(--p-inputtext-sm-font-size);
    padding-block: 8px 6px;
    padding-inline: var(--p-inputtext-sm-padding-x);
  }
  .title-wrapper {
    font-size: 20px;
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .title-wrapper {
    font-size: 16px;
    padding: 10px;
  }

  .search-player {
    display: none;
  }
}
</style>
