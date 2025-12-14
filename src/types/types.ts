// Интерфейс строки таблицы
export interface ITableRow {
  id: string;
  name: string;
  servePlus: number;
  serveMinus: number;
  attackPlus: number;
  attackMinus: number;
  rebatePlus: number;
  rebateMinus: number;
  blockPlus: number;
  blockMinus: number;
  receptionPlus: number;
  receptionMinus: number;
  total: number;
  kpd: number;
}
