import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { IRequest } from '../interfaces/folios.interfaces';

@Injectable({
  providedIn: 'root',
})
export class FoliosService {
  constructor(private http: HttpClient) {}

  private _folios$ = new BehaviorSubject<any[]>([]);
  public folios$ = this._folios$.asObservable();

  private _foliosByDate$ = new BehaviorSubject<any>({});
  public foliosByDate$ = this._foliosByDate$.asObservable();

  setFoliosPending(folios: any[]): void {
    this._folios$.next([...folios]);
  }

  setFoliosByDate(folios: any): void {
    this._foliosByDate$.next({ ...folios });
  }

  get foliosByDate(): any {
    return this._foliosByDate$.getValue();
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

    const token: string = '2642|7lMGTlAq7Bi6F67yeFyzwBEnudISRmd06evoweB4';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<IRequest>('http://34.2.4.36:8001/api/schedule', {
      headers: headers,
      params: paramsQ,
    });
  }
}
