import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, of } from 'rxjs';
import {
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

          Object.values(programmed).forEach((dayFolios) => {
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
              dayData.status = program.status;
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

    const token: string = '2667|PHzOUfLI1ltLXCCv7YRvSpB8ZJYhz7SKj67UFzOq';
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
