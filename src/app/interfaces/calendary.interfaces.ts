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
  folios: any[];
  inicial: number;
  estimate: number;
  final: number;
  status: 'new' | 'in_working' | 'confirmed';
}
