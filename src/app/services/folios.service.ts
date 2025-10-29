import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

  getProgrammingFolio(dataParams: any): Observable<any> {
    let paramsQ = new HttpParams();

    Object.keys(dataParams).forEach((key) => {
      const value = dataParams[key];
      if (value !== '' && value != null) {
        paramsQ = paramsQ.set(key, value);
      }
    });

    const token: string = '2638|CIwTBfrB76tgGseQ2OPa8DXtJqtImJrqAfZjqgMH';
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.get<any>('http://34.2.4.36:8001/api/schedule', {
      headers: headers,
      params: paramsQ,
    });
  }

  onGetDepartaments(): string[] {
    return [
      'Recursos Humanos',
      'Finanzas',
      'Contabilidad',
      'Marketing',
      'Ventas',
      'Atención al Cliente',
      'Operaciones',
      'Tecnología / IT',
      'Legal',
      'Compras',
      'Logística',
      'Calidad',
      'Investigación y Desarrollo',
      'Comunicación Corporativa',
      'Seguridad',
      'Mantenimiento',
      'Proyectos',
      'Innovación',
      'Planificación Estratégica',
      'Administración',
    ];
  }
}
