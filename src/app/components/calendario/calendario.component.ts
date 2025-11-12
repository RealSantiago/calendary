import {
  Component,
  EventEmitter,
  OnInit,
  AfterViewInit,
  Output,
  Input,
} from '@angular/core';
import { IDaysWeek, ITitleWeek } from '../../interfaces/calendary.interfaces';
import { FoliosService } from '../../services/folios.service';
import { IFolio, IWeekDayDetails } from '../../interfaces/folios.interfaces';

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent implements OnInit {
  @Input() titleWeek?: ITitleWeek;

  constructor(public service: FoliosService) {}

  public daysOfWeek: string[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ];
  public daysShows: IDaysWeek[] = [];

  // *------------
  public daySelect?: IDaysWeek;

  ngOnInit(): void {
    // console.log(this.daysShows);

    this.service.foliosByDate$.subscribe(() => {
      // console.log('cambio la data');
      this.onUpdateWeek();
    });
  }

  onUpdateWeek(): void {
    this.daysShows = [];
    if (!this.titleWeek) return;

    const data = { ...this.service.foliosByDate };
    const { arrayOfDays } = this.titleWeek;

    arrayOfDays.forEach((day) => {
      const dayTransform = day.toISOString().split('T')[0];
      const dayKey: IWeekDayDetails | undefined = data[dayTransform];

      // ⚠️ Si no hay información del día, creamos un objeto vacío
      if (!dayKey) {
        this.daysShows.push({
          day,
          inicial: 0,
          estimate: 0,
          confirmado: 0,
          finalEstimado: 0,
          finalReal: 0,
          status: undefined,
          folios: [],
          selection: 'Todos',
          idWeek: undefined,
          finalDia: 0,
        });
        return; // pasa al siguiente día
      }

      const dayCreate: IDaysWeek = {
        day,
        inicial: dayKey.inicial || 0,
        estimate: dayKey.estimado || 0,
        confirmado: dayKey.confirmado || 0,
        finalEstimado: dayKey.finalEstimado || 0,
        finalReal: dayKey.finalReal || 0,
        status: dayKey.status,
        folios: dayKey.folios || [],
        selection: 'Todos',
        idWeek: dayKey.idWeek,
        finalDia: dayKey.totalDay || 0,
      };

      this.daysShows.push(dayCreate);
    });

    // console.log(this.daysShows, '✅ días mostrados');
  }

  onSelectDay(day: any, event: Event): void {
    event.preventDefault();
    this.daySelect = day;
    console.log(day);
  }

  // AGREGAR ESTIMADO O CONFIRMADO
  // En tu componente .ts
  onAddValue(event: Event, property: string): void {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);
    input.value = value.toString();
    console.log(Number(value));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); // necesario para permitir el drop
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, toDate: Date): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain');
    if (!data) return;
    const { folio, fromDate } = JSON.parse(data);
    console.log({ folio, fromDate });
    // console.log({ toDate });
    if (!fromDate) {
      this.service.onMoveToDate(folio, toDate);
      return;
    }
    this.service.onMoveBetweenDays(folio, fromDate, toDate);
  }

  onGetDepartaments(folios: IFolio[]): any {
    const uniqDepartament = new Set(
      folios.map((folio) => folio.department).filter((d) => d != null)
    );
    const result = Array.from(uniqDepartament);
    result.unshift('Todos');
    return result;
  }

  onRemove = (folio: IFolio, dateKey: any) => {
    return this.service.onRemove(folio, dateKey);
  };
  //
  onFilterByDepartment(day: IDaysWeek, department: string): void {
    day.selection = department;

    // Si el valor es "Todos", mostramos todos los folios originales
    if (department === 'Todos') {
      day.folios =
        this.service.foliosByDate[day.day.toISOString().split('T')[0]].folios;
      return;
    }

    // Si es un departamento específico, filtramos
    const allFolios =
      this.service.foliosByDate[day.day.toISOString().split('T')[0]].folios;

    day.folios = allFolios.filter(
      (folio: IFolio) => folio.department === department
    );
  }
}
