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

// ---- DATA QUE RECIBO DE LA API
export interface IRequest {
  status: boolean;
  message: string;
  data: IData[];
}

export interface IData {
  id: number;
  year: number;
  week_number: number;
  start_date: Date;
  end_date: Date;
  created_by: null;
  confirmed_by: null;
  initial_amount: string;
  final_amount: string;
  status: string;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  programmed: Programmed;
  payments: any[];
}

export interface Programmed {
  [key: string]: IFolio[];
}

export interface IFolio {
  id: number;
  date_request: Date;
  hour_request: string;
  expense_type: string;
  deductible: number;
  wallet_number: number | null;
  department: string;
  scheduled_payment_date: Date;
  item_list: ItemListItemList[] | string;
  total: string;
  origin_paying: string;
  origin_bank_account: string;
  destiny_paying: string;
  destiny_bank_account: string;
  priority_level: string;
  folio: string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  auth_direction: number;
  auth_finances: number;
  origin_account_id: number;
  destiny_account_id: number;
  auth_directive: number;
  is_postponed: number;
  weekly_schedule_id: null;
  username: string;
}

export interface ItemListItemList {
  fecha: Date;
  factura: string;
  importe: string;
  concepto: string;
  impuestos: string;
  razonSocial: string;
}
