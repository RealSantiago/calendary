export interface IWeek {
  week: IWeekDays;
  status: 'new' | 'in_working' | 'confirmed';
}

export interface IWeekDays {
  [key: string]: IWeekDayDetails;
}

export interface IWeekDayDetails {
  inicial: number;
  estimado: number;
  final: number;
  folios: any[];
}
