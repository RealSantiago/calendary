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

  // ************
  onGetFilterByDepartament(): void {}

  // getAndTransformFoliosByWeek(titleWeek: ITitleWeek): Observable<IWeekDays> {
  //   if (!titleWeek) throw new Error('titleWeek es requerido');

  //   const { arrayOfDays, weekNumber, year } = titleWeek;

  //   // Inicializa estructura base vacía
  //   const weekFolios: IWeekDays = {};

  //   arrayOfDays.forEach((date) => {
  //     const dayKey = date.toISOString().split('T')[0];
  //     weekFolios[dayKey] = {
  //       day: dayKey,
  //       inicial: 0,
  //       estimado: 0,
  //       confirmado: 0,
  //       finalEstimado: 0,
  //       finalReal: 0,
  //       totalDay: 0,
  //       folios: [],
  //       idWeek: undefined,
  //       status: undefined,
  //     };
  //   });

  //   return this.getProgrammingFolio({ week_number: weekNumber, year }).pipe(
  //     map((res) => {
  //       const { data } = res;

  //       data.forEach((program) => {
  //         const { programmed } = program;

  //         Object.keys(weekFolios).forEach((key) => {
  //           weekFolios[key].idWeek = program.id;
  //           weekFolios[key].status = program.status;
  //         });

  //         Object.values(programmed).forEach((dayFolios) => {
  //           // RECORREMOS CADA FOLIO
  //           dayFolios.forEach((folio) => {
  //             if (!folio.scheduled_payment_date) return;

  //             const fecha = new Date(folio.scheduled_payment_date)
  //               .toISOString()
  //               .split('T')[0];

  //             const dayData = weekFolios[fecha];
  //             if (!dayData) return;

  //             const alreadyExists = dayData.folios.some(
  //               (f) => f.id === folio.id
  //             );
  //             if (!alreadyExists) {
  //               dayData.folios.push(folio);
  //             }

  //             dayData.totalDay = dayData.folios.reduce(
  //               (sum, f) => sum + Number(f.total || 0),
  //               0
  //             );
  //           });
  //         });
  //       });

  //       this.setFoliosByDate(weekFolios);
  //       return weekFolios;
  //     }),
  //     catchError((error) => {
  //       console.error('Error al obtener folios:', error);

  //       // Mantén estructura vacía, evita que la app falle
  //       this.setFoliosByDate(weekFolios);
  //       return of(weekFolios);
  //     })
  //   );
  // }
  // ENDPOINTS

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

        const currentFoliosByDate = { ...this._foliosByDate$.value };
        const foliosPendings = [...this._folios$.value];

        // ** FOLIOS EXISTENTES EN _FOLIOBYDAYS
        const existingFoliosIds = new Set(
          Object.values(currentFoliosByDate).flatMap((day) =>
            day.folios.map((f) => f.id)
          )
        );
        console.log(existingFoliosIds, 'Existentes');

        // FOLIOS PENDIENTES
        const pedingFoliosId = new Set(foliosPendings.map((f) => f.id));

        data.forEach((program) => {
          const { programmed, payments } = program;

          Object.keys(weekFolios).forEach((key) => {
            weekFolios[key].idWeek = program.id;
            weekFolios[key].status = program.status;
          });

          Object.values(programmed).forEach((dayFolios) => {
            dayFolios.forEach((folio) => {
              if (!folio.scheduled_payment_date) return;

              const fecha = new Date(folio.scheduled_payment_date)
                .toISOString()
                .split('T')[0];

              const dayData = weekFolios[fecha];
              if (!dayData) return;

              // VERIFICAR SI ESTA EN PEDIENTE
              if (pedingFoliosId.has(folio.id)) return;

              // VERIFICAR SI EL FOLIO YA EXISTE EN OTRO DIA DE LA SEMANA
              if (existingFoliosIds.has(folio.id)) return;

              dayData.folios.push(folio);
              existingFoliosIds.add(folio.id);
              // dayData.totalDay = dayData.folios.reduce(
              //   (sum, f) => sum + Number(f.total || 0),
              //   0
              // );
            });
          });
        });

        Object.values(weekFolios).forEach((day) => {
          day.totalDay = day.folios.reduce(
            (sum: number, folio: IFolio) => sum + Number(folio.total || 0),
            0
          );
        });

        //  Fusionar con lo que ya existe en foliosByDate

        Object.entries(weekFolios).forEach(([key, newDay]) => {
          const existing = currentFoliosByDate[key];
          const existingFolios = existing?.folios || [];

          const mergedFolios = [
            ...existingFolios,
            ...newDay.folios.filter(
              (nf) => !existingFolios.some((ef) => ef.id === nf.id)
            ),
          ];

          currentFoliosByDate[key] = {
            ...existing,
            ...newDay,
            folios: mergedFolios,
            totalDay: mergedFolios.reduce(
              (sum, f) => sum + Number(f.total || 0),
              0
            ),
          };
        });
        // Actualizamos el BehaviorSubject sin perder los datos previos
        this._foliosByDate$.next(currentFoliosByDate);
        return currentFoliosByDate;
      }),
      catchError((error) => {
        console.error('Error al obtener folios:', error);
        const currentFoliosByDate = { ...this._foliosByDate$.value };
        this._foliosByDate$.next(currentFoliosByDate);
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

    const token: string = '9937|LMDhN9j2bl1Q0Azmf1lOxF6CBKTTXCHPGFFCwhYR';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<IRequest>('http://34.2.4.36:8001/api/schedule', {
      headers: headers,
      params: paramsQ,
    });
  }

  getFoliosPending(): void {}

  onSaveProgramming(titleWeek?: ITitleWeek): any {
    const foliosByDate = { ...this._foliosByDate$.value };

    if (!foliosByDate || Object.keys(foliosByDate).length === 0) {
      console.warn('No hay folios para guardar');
      return;
    }

    const initial_amount = 1000000;
    const status = 'confirmed';

    //  Agrupamos por idWeek
    const groupedByWeek: Record<number, any> = {};

    Object.entries(foliosByDate).forEach(
      ([dateKey, dayData]: [string, any]) => {
        const idWeek = dayData.idWeek;
        if (!idWeek) return; // si no tiene idWeek, lo ignoramos

        if (!groupedByWeek[idWeek]) {
          groupedByWeek[idWeek] = {
            idWeek,
            initial_amount,
            status,
            data: {
              numberWeek: titleWeek?.weekNumber || 0,
              year: titleWeek?.year || 0,
            },
          };
        }

        groupedByWeek[idWeek].data[dateKey] = {
          inicial: dayData.inicial || 0,
          estimado: dayData.estimado || 0,
          confirmado: dayData.confirmado || 0,
          folios: (dayData.folios || []).map((f: any) => f.id),
        };
      }
    );

    // Convertimos a arreglo
    const payloads = Object.values(groupedByWeek);

    console.log('Payload listo para guardar:', payloads);
    return payloads;
  }

  // SEND DATA
  onUpdateWeekPrograming(id: number, data: any): Observable<any> {
    const token: string = '9937|LMDhN9j2bl1Q0Azmf1lOxF6CBKTTXCHPGFFCwhYR';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
    return this.http.patch(`http://34.2.4.36:8001/api/schedule${id}`, data, {
      headers: headers,
    });
  }
}
