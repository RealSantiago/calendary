import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import {
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
  constructor(private http: HttpClient) {}

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

  getAndTransformFoliosByWeek(titleWeek: ITitleWeek): Observable<IWeekDays> {
    if (!titleWeek) throw new Error('titleWeek es requerido');

    const { arrayOfDays, weekNumber, year } = titleWeek;

    // Inicializa estructura base vacía
    const weekFolios: IWeekDays = {};

    arrayOfDays.forEach((date) => {
      const dayKey = date.toISOString().split('T')[0];
      weekFolios[dayKey] = {
        day: dayKey,
        inicial: 0,
        estimado: 0,
        confirmado: 0,
        finalEstimado: 0,
        finalReal: 0,
        totalDay: 0,
        folios: [],
        idWeek: undefined,
        status: undefined,
      };
    });

    return this.getProgrammingFolio({ week_number: weekNumber, year }).pipe(
      map((res) => {
        const { data } = res;

        data.forEach((program) => {
          const { programmed } = program;

          Object.keys(weekFolios).forEach((key) => {
            weekFolios[key].idWeek = program.id;
            weekFolios[key].status = program.status;
          });

          Object.values(programmed).forEach((dayFolios) => {
            // RECORREMOS CADA FOLIO
            dayFolios.forEach((folio) => {
              if (!folio.scheduled_payment_date) return;

              const fecha = new Date(folio.scheduled_payment_date)
                .toISOString()
                .split('T')[0];

              const dayData = weekFolios[fecha];
              if (!dayData) return;

              const alreadyExists = dayData.folios.some(
                (f) => f.id === folio.id
              );
              if (!alreadyExists) {
                dayData.folios.push(folio);
              }

              dayData.totalDay = dayData.folios.reduce(
                (sum, f) => sum + Number(f.total || 0),
                0
              );
            });
          });
        });

        this.setFoliosByDate(weekFolios);
        return weekFolios;
      }),
      catchError((error) => {
        console.error('Error al obtener folios:', error);

        // Mantén estructura vacía, evita que la app falle
        this.setFoliosByDate(weekFolios);
        return of(weekFolios);
      })
    );
  }
  // ENDPOINTS

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

    const token: string = '9933|UJtIApJbd3bTXjghrgPiSaGDlcLIQDvpeyxO0kTF';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<IRequest>('http://34.2.4.36:8001/api/schedule', {
      headers: headers,
      params: paramsQ,
    });
  }

  getFoliosPending(): void {}
}
