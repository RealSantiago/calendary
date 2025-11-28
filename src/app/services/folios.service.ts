import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import {
  IData,
  IFolio,
  IRequest,
  IWeekDayDetails,
  IWeekDays,
  Programmed,
} from '../interfaces/folios.interfaces';
import { ITitleWeek } from '../interfaces/calendary.interfaces';

@Injectable({
  providedIn: 'root',
})
export class FoliosService {
  constructor(private http: HttpClient) { }


  // FOLIOS PENDIENTES
  private _folios$ = new BehaviorSubject<any[]>([]);
  public folios$ = this._folios$.asObservable();

  // FOLIOS CON FECHA DE SEMANA
  private _foliosByDate$ = new BehaviorSubject<IWeekDays>({});
  public foliosByDate$ = this._foliosByDate$.asObservable();

  setFoliosPending(folios: any[]): void {
    this._folios$.next([...folios]);
  }

  setFoliosByDate(folios: IWeekDays): void {
    this._foliosByDate$.next({ ...folios });
  }

  get foliosByDate(): any {
    return this._foliosByDate$.getValue();
  }

  // RETRNA TODOS LOS DEPARTAMENTOS QUE TIENE FOLIOS PENDIENTES
  get departamentsPending(): string[] {
    const foliosPending = [...this._folios$.value];
    const uniqDepartaments = new Set(
      foliosPending.map((f: IFolio) => f.department).filter((d) => d != null)
    );
    const result = Array.from(uniqDepartaments);
    result.unshift('Todos');
    return result;
  }

  // **************************************************

  onMoveToDate(folio: IFolio, toDate: Date): void {
    const to = toDate.toISOString().split('T')[0];
    const folioByDate = { ...this._foliosByDate$.value };
    let foliosPending = [...this._folios$.value];

    foliosPending = foliosPending.filter((f: IFolio) => f.id !== folio.id);
    folioByDate[to].folios.push(folio);
    folioByDate[to].totalDay = folioByDate[to].folios.reduce(
      (sum: number, folio: IFolio) => sum + Number(folio.total || 0),
      0
    );

    console.log({ folio, toDate }, '0000');
    this._folios$.next(foliosPending);
    this._foliosByDate$.next(folioByDate);
  }

  onMoveBetweenDays(folio: IFolio, fromDate: string, toDate: Date): void {
    // console.log({ folio, fromDate, toDate });
    const foliosByDate = { ...this._foliosByDate$.value };
    const from = new Date(fromDate).toISOString().split('T')[0];
    const to = toDate.toISOString().split('T')[0];
    console.log({ folio, from, to });

    // MOVEMOS DE DONDE VIENE
    foliosByDate[from].folios = foliosByDate[from].folios.filter(
      (f: IFolio) => f.id !== folio.id
    );
    foliosByDate[from].totalDay = foliosByDate[from].folios.reduce(
      (suma: number, folio: IFolio) => suma + Number(folio.total || 0),
      0
    );

    //AGREGAMOS EL FOLIO AL NUEVO DESTINO
    foliosByDate[to].folios.push(folio);
    foliosByDate[to].totalDay = foliosByDate[to].folios.reduce(
      (suma: number, folio: IFolio) => suma + Number(folio.total || 0),
      0
    );

    // ACTUALIZAMOS
    this._foliosByDate$.next(foliosByDate);
  }

  // * REMOVER UN FOLIO DE LAS FECHAS Y PASARLO A PENDIENTE

  onRemove(folio: IFolio, dateKey: Date): void {
    const foliosByDate = { ...this._foliosByDate$.value };
    const foliosPending = [...this._folios$.value];
    const date = dateKey.toISOString().split('T')[0];
    foliosByDate[date].folios = foliosByDate[date].folios.filter(
      (f: IFolio) => f.id !== folio.id
    );
    foliosByDate[date].totalDay = foliosByDate[date].folios.reduce(
      (suma: number, folio: IFolio) => suma + Number(folio.total || 0),
      0
    );
    foliosPending.push(folio);
    this._foliosByDate$.next(foliosByDate);
    this._folios$.next(foliosPending);
  }

  /*
  AQQUI VAN LOS HELPERS
  */

  private getSafeDate(date: string | Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private createPaymentMap(payments: any): Map<number, any> {
    const list = Object.values(payments || {}).flatMap((day: any) => day.map((folio: any) => ({
      id: folio.id,
      payment_day_adjusted: folio.payment_day_adjusted,

    })))

    return new Map(list.map((item: any) => [item.id, item]))
  }


  private mergeFolios(existing: IFolio[], incoming: IFolio[]): IFolio[] {
    const existingIds = new Set(existing.map((f) => f.id))
    return [...existing, ...incoming.filter((f) => !existingIds.has(f.id))]
  }

  // ESTRUCTURA DE LA SEMANA
  private prepareWeek(arrayOfDays: Date[]): IWeekDays {
    return arrayOfDays.reduce((acc: any, date: any) => {
      const key = this.getSafeDate(date)
      acc[key] = {
        day: key,
        inicial: 0,
        estimado: 0,
        confirmado: 0,
        finalEstimado: 0,
        finalReal: 0,
        totalDay: 0,
        folios: [],
        idWeek: undefined,
        status: undefined,
      }
      return acc
    }, {} as IWeekDays)
  }

  // 
  private processPayments(program: any): any {
    const paymentMap = this.createPaymentMap(program.payments)
    const paymentsTransformed = this.onTransformPayments(program.payments)
    return { paymentMap, paymentsTransformed }
  }

  // TRANSFORMAR LOS PAGOS
  onTransformPayments(payments: any): any {
    // payment_day_adjusted  => fecha de pago yyyy-mm-dd
    const result: any = {}

    Object.values(payments).forEach((payment: any) => {
      payment.forEach((p: any) => {
        const dept = `${p.department.toLowerCase()}`;
        const date = p.payment_day_adjusted.split(" ")[0];
        // const date = p.scheduled_payment_date

        if (!result[dept]) {
          result[dept] = {}
        }

        if (!result[dept][date]) {
          result[dept][date] = []
        }

        result[dept][date].push(p)


      })
    })

    console.log(result, 'result');
    return result
  }

  private mergearConFoliosPrevios(
    weekFolios: IWeekDays,
    currentFoliosByDate: IWeekDays
  ): IWeekDays {
    const finalObj = { ...currentFoliosByDate };

    for (const [key, day] of Object.entries(weekFolios)) {
      const existing = finalObj[key]?.folios || [];
      const merged = this.mergeFolios(existing, day.folios);

      finalObj[key] = {
        ...finalObj[key],
        ...day,
        folios: merged,
        totalDay: merged.reduce((s, f) => s + Number(f.total || 0), 0),
      };
    }

    return finalObj;
  }


  // ROCESAR FOLIOS PROGRAADIS
  private processFoliosProgrammed(programmed: any, weekFolios: IWeekDays, helpers: { pendingIds: Set<number>; existingIds: Set<number>; paymentMap: Map<number, any> }): any {

    const { pendingIds, existingIds, paymentMap } = helpers
    for (const dayFolios of Object.values(programmed.programmed || {})) {
      for (const folio of dayFolios as IFolio[]) {
        if (!folio.scheduled_payment_date) continue


        const payment = paymentMap.get(folio.id)
        console.log(payment, 'payment');

        const realDate = payment ? payment.payment_day_adjusted.split(' ')[0] : folio.scheduled_payment_date

        const day = weekFolios[realDate]

        if (!day) continue

        if (pendingIds.has(folio.id)) continue
        if (existingIds.has(folio.id)) continue

        folio.CDatePayment = payment ? payment.payment_day_adjusted.split(' ')[0] : null
        folio.CDateProgrammed = folio.scheduled_payment_date
        folio.CStatus = payment ? 'Pagado' : 'Pendiente'

        day.folios.push(folio)
        existingIds.add(folio.id)
      }
    }
  }

  private calcTotal(weekFolios: IWeekDays) {
    Object.values(weekFolios).forEach((day) => {
      day.totalDay = day.folios.reduce((acc, folio) => acc + Number(folio.total || 0), 0)
    })
  }

  getAndTransformFoliosByWeek(titleWeek: ITitleWeek): Observable<IWeekDays> {
    if (!titleWeek) throw new Error('titleWeek es requerido');

    const { arrayOfDays, weekNumber, year } = titleWeek as ITitleWeek;

    const weekFolios = this.prepareWeek(arrayOfDays);
    const currentFoliosByDate = { ...this._foliosByDate$.value };
    const pendingIds = new Set(this._folios$.value.map((f) => f.id));
    const existingIds = new Set(
      Object.values(currentFoliosByDate).flatMap(d => d.folios.map(f => f.id))
    );

    return this.getProgrammingFolio({ week_number: weekNumber, year }).pipe(
      map((res) => {
        let paymentsTransformed: any = {};

        for (const program of res.data) {
          const { paymentMap, paymentsTransformed: pt } = this.processPayments(program);
          paymentsTransformed = pt;

          // Set idWeek y status
          Object.values(weekFolios).forEach((d) => {
            d.idWeek = program.id;
            d.status = program.status;
          });

          this.processFoliosProgrammed(program, weekFolios, {
            pendingIds,
            existingIds,
            paymentMap,
          });
        }

        this.calcTotal(weekFolios);

        const merged = this.mergearConFoliosPrevios(weekFolios, currentFoliosByDate);

        this._foliosByDate$.next(merged);

        return paymentsTransformed;
      }),
      catchError(() => {
        this._foliosByDate$.next({ ...currentFoliosByDate });
        return of(currentFoliosByDate);
      })
    );
  }

  getProgrammingFolio(dataParams: {
    week_number: number;
    year: string;
    created_by?: string;
    confirmed_by?: string;
    status?: string;
  }): Observable<IRequest> {
    let paramsQ = new HttpParams();

    (Object.keys(dataParams) as (keyof typeof dataParams)[]).forEach((key) => {
      const value = dataParams[key];
      if (value !== '' && value != null) {
        paramsQ = paramsQ.set(key, value as string);
      }
    });

    const token: string = '9951|wiCkpyu7MjAMJVGXCDJfDWPQiNEHFoa7EVxLREz6';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<IRequest>('http://34.2.4.36:8001/api/schedule', {
      headers: headers,
      params: paramsQ,
    });
  }


  onSaveProgramming(titleWeek?: ITitleWeek): any {
    const foliosByDate = { ...this._foliosByDate$.value };
    console.log(foliosByDate, 'foliosByDate');


    if (!foliosByDate || Object.keys(foliosByDate).length === 0) {
      console.warn('No hay folios para guardar');
      return;
    }

    const initial_amount = 1000000;
    const status = 'in_working';
    const groupedByWeek: Record<number, any> = {};

    Object.entries(foliosByDate).forEach(([dateKey, dayData]: [string, any]) => {
      const idWeek = dayData.idWeek;
      if (!idWeek) return;

      // Extraemos los folios válidos
      const folios = (dayData.folios || []).map((f: any) => f.id).filter(Boolean);
      const statusDay = dayData.status;

      if (statusDay === 'confirmed') return

      // Si la semana no existe, la inicializamos
      if (!groupedByWeek[idWeek]) {
        groupedByWeek[idWeek] = {
          idWeek,
          initial_amount,
          status,
          data: {
            numberWeek: titleWeek?.weekNumber || 0,
            year: titleWeek?.year || 0,
          },
          hasFolios: false, // bandera para saber si hay al menos un folio en la semana
        };
      }

      // Guardamos el día (aunque luego se filtrará si no hay folios)
      groupedByWeek[idWeek].data[dateKey] = {
        inicial: dayData.inicial || 0,
        estimado: dayData.estimado || 0,
        confirmado: dayData.confirmado || 0,
        folios,
      };

      // Si este día tiene folios, marcamos la semana como válida
      if (folios.length > 0) {
        groupedByWeek[idWeek].hasFolios = true;
      }
    });

    // Convertimos a arreglo y filtramos las semanas sin folios
    const payloads = Object.values(groupedByWeek)
      .filter((week: any) => week.hasFolios)
      .map(({ hasFolios, ...rest }) => rest); // removemos la bandera auxiliar

    console.log('Payload listo para guardar:', payloads);
    return payloads;
  }


  // SEND DATA
  onUpdateWeekPrograming(id: number, data: any): Observable<any> {
    const token: string = '9951|wiCkpyu7MjAMJVGXCDJfDWPQiNEHFoa7EVxLREz6';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch(`http://34.2.4.36:8001/api/schedule/${id}`, data, {
      headers: headers,
    });
  }


  // FUNCION QUE TRANSFORMA LOS FOLIOS PAGADOS

}

