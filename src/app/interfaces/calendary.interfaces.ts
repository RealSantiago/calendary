export interface ITitleWeek {
  week: string;
  year: string;
  month: string;
  weekNumber: number;
  arrayOfDays: Date[];
}

// INTERFAZ DONDE ALMACENA LOS DIA EL COMPONENTE
export interface IDaysWeek {
  day: Date;
  inicial: number;
  estimate: number;
  confirmado: number;
  finalEstimado: number;
  finalReal: number;
  finalDia: number;
  idWeek: number | undefined;
  folios: any[];
  status: 'new' | 'in_working' | 'confirmed' | undefined;
  selection: string;
}
