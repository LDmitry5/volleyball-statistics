<script setup lang="ts">
import SelectTeam from "@/components/SelectTeam.vue";
import TableTeam from "@/components/TableTeam.vue";
import Statistics from "@/components/Statistics.vue";
import { computed, reactive, ref } from "vue";
import type { ITableRow } from "@/types/types";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Packer,
  AlignmentType,
  WidthType,
  BorderStyle,
  VerticalAlignTable,
} from "docx";

const iconClass = ref("pi pi-moon");

const score = reactive({
  totalTeam1: 0,
  totalTeam2: 0,
  time1Team1: 0,
  time1Team2: 0,
  time2Team1: 0,
  time2Team2: 0,
  time3Team1: 0,
  time3Team2: 0,
  time4Team1: 0,
  time4Team2: 0,
  time5Team1: 0,
  time5Team2: 0,
});

// Заголовки таблиц
const selectValueOneTeam = ref("Команда 1");
const selectValueSecondTeam = ref("Команда 2");

const handleValueOneTeam = (value: string) => {
  selectValueOneTeam.value = value;
};

const handleValueSecondTeam = (value: string) => {
  selectValueSecondTeam.value = value;
};

// Данные по игрокам обеих команд
const allPlayersTeam1 = ref<ITableRow[]>([]);
const allPlayersTeam2 = ref<ITableRow[]>([]);

const allPlayers = computed(() => {
  return [...allPlayersTeam1.value, ...allPlayersTeam2.value];
});

// Обновляем данные по команде 1
const handlePlayersUpdateTeam1 = (updatedPlayers: ITableRow[]) => {
  allPlayersTeam1.value = updatedPlayers;
};

// Обновляем данные по команде 2
const handlePlayersUpdateTeam2 = (updatedPlayers: ITableRow[]) => {
  allPlayersTeam2.value = updatedPlayers;
};

// Общие показатели команды 1
const totalPlusTeam1 = computed(() => {
  return allPlayersTeam1.value.reduce((sum, player) => {
    return (
      sum +
      (player.servePlus ?? 0) +
      (player.attackPlus ?? 0) +
      (player.rebatePlus ?? 0) +
      (player.blockPlus ?? 0) +
      (player.receptionPlus ?? 0)
    );
  }, 0);
});

const totalMinusTeam1 = computed(() => {
  return allPlayersTeam1.value.reduce((sum, player) => {
    return (
      sum +
      (player.serveMinus ?? 0) +
      (player.attackMinus ?? 0) +
      (player.rebateMinus ?? 0) +
      (player.blockMinus ?? 0) +
      (player.receptionMinus ?? 0)
    );
  }, 0);
});

// Общие показатели команды 2
const totalPlusTeam2 = computed(() => {
  return allPlayersTeam2.value.reduce((sum, player) => {
    return (
      sum +
      (player.servePlus ?? 0) +
      (player.attackPlus ?? 0) +
      (player.rebatePlus ?? 0) +
      (player.blockPlus ?? 0) +
      (player.receptionPlus ?? 0)
    );
  }, 0);
});

const totalMinusTeam2 = computed(() => {
  return allPlayersTeam2.value.reduce((sum, player) => {
    return (
      sum +
      (player.serveMinus ?? 0) +
      (player.attackMinus ?? 0) +
      (player.rebateMinus ?? 0) +
      (player.blockMinus ?? 0) +
      (player.receptionMinus ?? 0)
    );
  }, 0);
});

// КПД команд
const totalKPDTeam1 = computed(() => {
  const total = totalPlusTeam1.value + totalMinusTeam1.value;
  return totalPlusTeam1.value === 0 ? 0 : Math.round((totalPlusTeam1.value / total) * 100);
});

const totalKPDTeam2 = computed(() => {
  const total = totalPlusTeam2.value + totalMinusTeam2.value;
  return totalPlusTeam2.value === 0 ? 0 : Math.round((totalPlusTeam2.value / total) * 100);
});

// Dark тема
function onThemeToggler() {
  const root: HTMLHtmlElement | undefined = document.getElementsByTagName("html")[0];

  root?.classList.toggle("p-dark");
  iconClass.value = iconClass.value === "pi pi-moon" ? "pi pi-sun" : "pi pi-moon";
}

// Экспорт в Word
const createSinglePageDocument = (): Document => {
  const PAGE_WIDTH_TWIPS = 12240;
  const MARGIN_LEFT_TWIPS = 720;
  const MARGIN_RIGHT_TWIPS = 540;
  const CONTENT_WIDTH_TWIPS = PAGE_WIDTH_TWIPS - MARGIN_LEFT_TWIPS - MARGIN_RIGHT_TWIPS;

  return new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH_TWIPS, height: 15840 },
            margin: { top: 720, right: MARGIN_RIGHT_TWIPS, bottom: 720, left: MARGIN_LEFT_TWIPS },
          },
        },
        children: [
          // Заголовок
          new Paragraph({
            children: [
              new TextRun({
                text: `${selectValueOneTeam.value} vs ${selectValueSecondTeam.value}`,
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),

          createScoreTable(CONTENT_WIDTH_TWIPS),

          // Промежуточный отступ
          new Paragraph({ spacing: { before: 100, after: 100 } }),

          // Таблица игроков
          createPlayersTable(allPlayers.value, CONTENT_WIDTH_TWIPS),

          new Paragraph({
            children: [
              new TextRun({
                text: "Аналитика матча",
                bold: true,
                size: 32,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
          }),

          // Таблица метрик
          createMetricsTable(allPlayers.value, CONTENT_WIDTH_TWIPS),
        ],
      },
    ],
  });
};

// Таблица счёта (общий и по сетам)
const createScoreTable = (maxWidth: number): Table => {
  // Явно перечисляем все возможные ключи
  const setKeys: Array<{ team1: keyof typeof score; team2: keyof typeof score }> = [
    { team1: "time1Team1", team2: "time1Team2" },
    { team1: "time2Team1", team2: "time2Team2" },
    { team1: "time3Team1", team2: "time3Team2" },
    { team1: "time4Team1", team2: "time4Team2" },
    { team1: "time5Team1", team2: "time5Team2" },
  ];

  return new Table({
    rows: [
      // Общий счёт (как выше)
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            shading: { fill: "d9d9d9" },
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: {
              top: 120,
              bottom: 120,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(selectValueOneTeam.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            shading: { fill: "d9d9d9" },
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: {
              left: 100,
              right: 100,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(selectValueSecondTeam.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            shading: { fill: "d9d9d9" },
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: {
              left: 100,
              right: 100,
            },
          }),
        ],
      }),

      // Сеты
      ...setKeys.map(({ team1, team2 }, index) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Сэт ${index + 1}`, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              margins: {
                top: 100,
                bottom: 100,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(score[team1]), size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: String(score[team2]), size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        });
      }),

      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Итог матча", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
            shading: { fill: "d9d9d9" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(score.totalTeam1), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: "d9d9d9" },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(score.totalTeam2), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            shading: { fill: "d9d9d9" },
          }),
        ],
      }),
    ],
    width: { size: 60, type: WidthType.PERCENTAGE },
    borders: {},
    alignment: AlignmentType.CENTER,
  });
};

// Таблица игроков (максимум 15 строк)
const createPlayersTable = (players: ITableRow[], maxWidth: number): Table => {
  const COL_WIDTH = {
    player: 25,
    servePlus: 10,
    serveMinus: 10,
    attackPlus: 10,
    attackMinus: 10,
    rebatePlus: 10,
    rebateMinus: 10,
    blockPlus: 10,
    blockMinus: 10,
    receptionPlus: 10,
    receptionMinus: 10,
    kpd: 20,
  } as const;
  type ColKey = keyof typeof COL_WIDTH;

  return new Table({
    rows: [
      // Шапка
      new TableRow({
        children: Object.entries(COL_WIDTH).map(([key, width]) => {
          const colKey = key as ColKey;
          return new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: getHeaderText(colKey), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
            verticalAlign: VerticalAlignTable.CENTER,
            width: { size: width, type: WidthType.PERCENTAGE },
            shading: { fill: "d9d9d9" },
          });
        }),
      }),

      // Данные (максимум 15 игроков)
      ...players.slice(0, 15).map(
        (player) =>
          new TableRow({
            children: Object.entries(COL_WIDTH).map(([key]) => {
              const colKey = key as ColKey;
              return new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: getCellValue(player, colKey), size: 18 })],
                    alignment: AlignmentType.CENTER,
                  }),
                ],
                margins: {
                  top: 100,
                  bottom: 100,
                  left: 100,
                  right: 100,
                },
                verticalAlign: VerticalAlignTable.CENTER,
                width: { size: COL_WIDTH[colKey], type: WidthType.PERCENTAGE },
              });
            }),
          })
      ),
    ],
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      bottom: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      left: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      right: { style: BorderStyle.SINGLE, size: 8, color: "000000" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 6, color: "cccccc" },
      insideVertical: { style: BorderStyle.SINGLE, size: 6, color: "cccccc" },
    },
    alignment: AlignmentType.CENTER,
  });
};

// Таблица метрик (общая статистика по команде)
const createMetricsTable = (players: ITableRow[], maxWidth: number): Table => {
  const totalActionsTeam1 = totalPlusTeam1.value + totalMinusTeam1.value;
  const totalActionsTeam2 = totalPlusTeam2.value + totalMinusTeam2.value;

  const topBestTeam1 = [...allPlayersTeam1.value].sort((a, b) => (b.kpd ?? 0) - (a.kpd ?? 0)).slice(0, 2);
  const topWorstTeam1 = [...allPlayersTeam1.value].sort((a, b) => (a.kpd ?? 0) - (b.kpd ?? 0)).slice(0, 2);
  const topBestTeam2 = [...allPlayersTeam2.value].sort((a, b) => (b.kpd ?? 0) - (a.kpd ?? 0)).slice(0, 2);
  const topWorstTeam2 = [...allPlayersTeam2.value].sort((a, b) => (a.kpd ?? 0) - (b.kpd ?? 0)).slice(0, 2);
  const allTopBestPlayers = [];
  const allTopWorstPlayers = [];

  for (let index = 0; index < 2; index++) {
    const arr = [];
    arr.push(topBestTeam1[index]);
    arr.push(topBestTeam2[index]);
    allTopBestPlayers.push(arr);
  }
  for (let index = 0; index < 2; index++) {
    const arr = [];
    arr.push(topWorstTeam1[index]);
    arr.push(topWorstTeam2[index]);
    allTopWorstPlayers.push(arr);
  }

  return new Table({
    rows: [
      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Метрики", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            shading: { fill: "d9d9d9" },
            width: { size: 20, type: WidthType.PERCENTAGE },
            margins: {
              top: 120,
              bottom: 120,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(selectValueOneTeam.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            shading: { fill: "d9d9d9" },
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: {
              left: 100,
              right: 100,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(selectValueSecondTeam.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            verticalAlign: VerticalAlignTable.CENTER,
            shading: { fill: "d9d9d9" },
            width: { size: 40, type: WidthType.PERCENTAGE },
            margins: {
              left: 100,
              right: 100,
            },
          }),
        ],
      }),

      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Всего действий", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalActionsTeam1), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalActionsTeam2), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),

      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Успешных", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalPlusTeam1.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalPlusTeam2.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),

      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Ошибочных", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalMinusTeam1.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalMinusTeam2.value), bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),

      new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: "Эффективность", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
            margins: {
              top: 100,
              bottom: 100,
              left: 100,
              right: 100,
            },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalKPDTeam1.value) + " %", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: String(totalKPDTeam2.value) + " %", bold: true, size: 20 })],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),

      // Лучшие игроки
      ...allTopBestPlayers.map((player, index) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Лучший игрок`, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "4cedbb" },
              margins: {
                top: 100,
                bottom: 100,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: player[0] && player[0].name, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: player[1] && player[1].name, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        });
      }),

      // Худшие
      ...allTopWorstPlayers.map((player, index) => {
        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: `Худшие игрок`, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
              shading: { fill: "ed6969" },
              margins: {
                top: 100,
                bottom: 100,
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: player[0] && player[0].name, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: player[1] && player[1].name, size: 18 })],
                  alignment: AlignmentType.CENTER,
                }),
              ],
            }),
          ],
        });
      }),
    ],
    width: { size: 80, type: WidthType.PERCENTAGE },
    borders: {},
    alignment: AlignmentType.CENTER,
  });
};

// Вспомогательные функции
const getHeaderText = (key: string): string => {
  const labels: Record<string, string> = {
    player: "Игрок",
    servePlus: "Подача +",
    serveMinus: "Подача -",
    attackPlus: "Нападение +",
    attackMinus: "Нападение -",
    rebatePlus: "Скидка +",
    rebateMinus: "Скидка -",
    blockPlus: "Блок +",
    blockMinus: "Блок -",
    receptionPlus: "Приём +",
    receptionMinus: "Приём -",
    kpd: "КПД",
  };
  return labels[key] || key;
};

const getCellValue = (player: ITableRow, key: string): string => {
  switch (key) {
    case "player":
      return player.name || "Не указано";
    case "servePlus":
      return String(player.servePlus || 0);
    case "serveMinus":
      return String(player.serveMinus || 0);
    case "attackPlus":
      return String(player.attackPlus || 0);
    case "attackMinus":
      return String(player.attackMinus || 0);
    case "rebatePlus":
      return String(player.rebatePlus || 0);
    case "rebateMinus":
      return String(player.rebateMinus || 0);
    case "blockPlus":
      return String(player.blockPlus || 0);
    case "blockMinus":
      return String(player.blockMinus || 0);
    case "receptionPlus":
      return String(player.receptionPlus || 0);
    case "receptionMinus":
      return String(player.receptionMinus || 0);
    case "kpd":
      return String(player.kpd || 0) + " %";
    default:
      return "";
  }
};

// Экспорт документа в формате Word
const exportToWord = async (): Promise<void> => {
  try {
    const doc = createSinglePageDocument();
    const blob = await Packer.toBlob(doc);

    // Создание ссылки для скачивания
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Аналитика матча.docx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка при экспорте в Word:", error);
    alert("Не удалось создать документ. Проверьте данные и повторите попытку.");
  }
};
</script>

<template>
  <header class="header">
    <h1 class="header__h1">Статистика игроков Чемпионата МО Гулькевичского района по волейболу</h1>
    <p class="header__p">Среди мужских команд</p>
  </header>

  <main class="main">
    <div class="card">
      <div class="groupSelectTeam">
        <SelectTeam @updateValue="handleValueOneTeam">Команда 1</SelectTeam>
        <SelectTeam @updateValue="handleValueSecondTeam">Команда 2</SelectTeam>
      </div>
      <div class="score">
        <span class="score-check">счет</span>
        <div class="score-total">
          <div class="score-total-item">
            <InputNumber
              v-model="score.totalTeam1"
              showButtons
              buttonLayout="horizontal"
              :step="1"
              :min="0"
              :max="9"
              size="large"
              fluid>
              <template #incrementicon>
                <span class="pi pi-plus" />
              </template>
              <template #decrementicon>
                <span class="pi pi-minus" />
              </template>
            </InputNumber>
          </div>
          <span class="score-separator"><i class="pi pi-minus"></i></span>
          <div class="score-total-item">
            <InputNumber
              v-model="score.totalTeam2"
              showButtons
              buttonLayout="horizontal"
              :step="1"
              :min="0"
              :max="9"
              size="large"
              fluid>
              <template #incrementicon>
                <span class="pi pi-plus" />
              </template>
              <template #decrementicon>
                <span class="pi pi-minus" />
              </template>
            </InputNumber>
          </div>
        </div>
        <span class="score-check">сет</span>
        <div class="score-set">
          <div class="score-left">
            <div :style="score.time1Team1 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time1Team1"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time2Team1 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time2Team1"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time3Team1 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time3Team1"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time4Team1 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time4Team1"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time5Team1 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time5Team1"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div style="width: 86px"></div>
          </div>
          <div class="score-separators">
            <span class="score-separator" style="height: 30px">1</span>
            <span class="score-separator" style="height: 30px">2</span>
            <span class="score-separator" style="height: 30px">3</span>
            <span class="score-separator" style="height: 30px">4</span>
            <span class="score-separator" style="height: 30px">5</span>
            <span style="width: 30px"></span>
          </div>
          <div class="score-right">
            <div :style="score.time1Team2 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time1Team2"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time2Team2 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time2Team2"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time3Team2 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time3Team2"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time4Team2 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time4Team2"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div :style="score.time5Team2 > 9 ? { width: '86px' } : { width: '80px' }">
              <InputNumber
                v-model="score.time5Team2"
                showButtons
                buttonLayout="horizontal"
                :step="1"
                :min="0"
                :max="100"
                size="small"
                fluid>
                <template #incrementicon>
                  <span class="pi pi-plus" />
                </template>
                <template #decrementicon>
                  <span class="pi pi-minus" />
                </template>
              </InputNumber>
            </div>
            <div style="width: 86px"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="card">
      <div class="groupButtons">
        <Button icon="pi pi-download" variant="outlined" @click="exportToWord" />
        <Button :icon="iconClass" variant="outlined" @click="onThemeToggler" aria-label="Переключить тему" />
      </div>
      <TableTeam :sharedRef="selectValueOneTeam" @playersUpdate="handlePlayersUpdateTeam1" />
      <TableTeam :sharedRef="selectValueSecondTeam" @playersUpdate="handlePlayersUpdateTeam2" />
    </div>
    <div class="card">
      <Statistics
        :totalPlusTeam1="totalPlusTeam1"
        :totalMinusTeam1="totalMinusTeam1"
        :totalPlusTeam2="totalPlusTeam2"
        :totalMinusTeam2="totalMinusTeam2"
        :playersTeam1="allPlayersTeam1"
        :playersTeam2="allPlayersTeam2"
        :titleTableTeam1="selectValueOneTeam"
        :titleTableTeam2="selectValueSecondTeam" />
    </div>
  </main>

  <footer class="footer">
    <p>Чемпионат МО Гулькевичского района по волейболу · Сезон 2025–2026</p>
  </footer>
</template>

<style scoped>
.header {
  position: relative;
  text-align: center;
  background-color: var(--card-bg);
  border: var(--card-border);
  color: var(--body-text-color);
  padding: 2rem;
  border-radius: var(--border-radius);
}

.header__h1 {
  font-size: 2rem;
  font-weight: 700;
}

.header__p {
  font-size: 1.2rem;
  margin-top: 8px;
}

.header__btn {
  padding: 5px;
  background-color: transparent;
  border: 1px solid #333;
  border-radius: 6px;
  cursor: pointer;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.card {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--card-bg);
  border: var(--card-border);
  padding: 1.5rem;
  border-radius: var(--border-radius);
  width: 100%;
}

.groupButtons {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 10px;
}

.groupSelectTeam {
  display: flex;
  align-items: center;
  justify-content: space-around;
  gap: 50px;
}

.groupSelectTeam__one,
.groupSelectTeam__second {
  width: 50%;
}

.score {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 0 auto;
}

.score-total {
  display: flex;
  gap: 100px;
}

.score-total .score-separator {
  height: 71px;
}

.score-total :deep(.p-inputnumber-button) {
  width: 60px;
}

.score-total :deep(.p-inputtext-lg) {
  font-size: 52px;
  padding-block: 5px;
  padding-inline: 20px;
}

.score-total-item {
  width: 188px;
}

.score-left,
.score-separators,
.score-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-left {
  align-items: end;
}

.score-set {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.score-set :deep(.p-inputnumber-button) {
  width: 25px;
}

.score-separators {
  align-items: center;
}

.score-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
}

.score-right {
  align-items: start;
}

.score-check {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  text-transform: uppercase;
  font-size: 24px;
}

.footer {
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  :deep(.p-select-lg .p-select-label) {
    font-size: 1rem;
    padding-block: 8px;
  }

  .main {
    gap: 12px;
  }

  .groupSelectTeam {
    gap: 25px;
  }

  .score-check {
    font-size: 20px;
  }

  .score-total {
    gap: 70px;
  }

  .score-total .score-separator {
    height: 53px;
  }

  .score-total-item {
    width: 154px;
  }

  .score-total :deep(.p-inputtext-lg) {
    font-size: 40px;
    padding-block: 2px;
    padding-inline: 16px;
  }

  .score-total :deep(.p-inputnumber-button) {
    width: 50px;
  }

  .header {
    padding: 1rem;
  }

  .header__h1 {
    font-size: 1.625rem;
    font-weight: 600;
  }

  .header__p {
    font-size: 1.125rem;
  }

  .footer {
    font-size: 1rem;
  }

  @media (max-width: 480px) {
    .header__h1 {
      font-size: 1.25rem;
      font-weight: 600;
    }

    .header__p {
      font-size: 1rem;
    }

    .groupSelectTeam {
      flex-direction: column;
    }

    .score-total {
      gap: 15px;
    }

    .score-total .score-separator {
      height: 38px;
    }

    .score-total-item {
      width: 110px;
    }

    .score-total :deep(.p-inputtext-lg) {
      font-size: 28px;
      padding-inline: 12px;
    }

    .score-total :deep(.p-inputnumber-button) {
      width: 35px;
    }

    .footer {
      font-size: 0.625rem;
    }
  }

  @media (max-width: 375px) {
    .score-total {
      gap: 10px;
    }

    .score-total-item {
      width: 100px;
    }

    .score-total :deep(.p-inputtext-lg) {
      padding-inline: 10px;
    }

    .score-total :deep(.p-inputnumber-button) {
      width: 32px;
    }
  }
}
</style>
