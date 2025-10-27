export interface Welcome {
  status: boolean;
  message: string;
  data: Datum[];
  pending: Pending[];
}

export interface Datum {
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
  week: Week;
}

export interface Week {
  [key: string]: Folio[];
}

export interface Folio {
  id: number;
  date_request: Date;
  hour_request: string;
  expense_type: ExpenseType;
  deductible: number;
  wallet_number: number | null;
  department: string;
  scheduled_payment_date: Date;
  item_list: string;
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

export enum ExpenseType {
  Transferencia = 'Transferencia',
  Traspaso = 'Traspaso',
}

export interface ItemListElement {
  fecha: Date;
  factura: string;
  importe: string;
  concepto: string;
  impuestos: string;
  razonSocial: string;
}

export interface Pending {
  id: number;
  date_request: Date;
  hour_request: string;
  expense_type: ExpenseType;
  deductible: number;
  wallet_number: null;
  department: string;
  scheduled_payment_date: Date | null;
  item_list: string;
  total: string;
  origin_paying: null | string;
  origin_bank_account: null | string;
  destiny_paying: null | string;
  destiny_bank_account: null | string;
  priority_level: PriorityLevel;
  folio: null | string;
  user_id: number;
  created_at: Date;
  updated_at: Date;
  deleted_at: null;
  auth_direction: number;
  auth_finances: number;
  origin_account_id: number | null;
  destiny_account_id: number | null;
  auth_directive: number;
  is_postponed: number;
  weekly_schedule_id: null;
  username: Username;
}

export enum PriorityLevel {
  Low = 'low',
}

export enum Username {
  RootRootRoot = 'ROOT ROOT ROOT',
}

// -----
export interface IFolioByDate {
  [key: string]: IFolioByDateConfig;
}

export interface IFolioByDateConfig {
  initial: number;
  estimate: number;
  final: number;
  folios: Folio[];
}

// Interfaz para los params del endpoint
export interface IParamas {
  week_number: number;
  year: string;
  status?: 'new' | 'in_working' | 'confirmed';
  created_by?: string;
  confirmed_by?: string;
}
