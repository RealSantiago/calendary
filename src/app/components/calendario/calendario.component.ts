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

      const folios = data[dayTransform].folios;

      const dayCreate: IDaysWeek = {
        day: day,
        folios: folios,
        inicial: data[dayTransform].inicial,
        estimate: data[dayTransform].estimado,
        final: data[dayTransform].final,
        status: 'new',
      };
      this.daysShows.push(dayCreate);
    });
  }

  onSelectDay(day: any): void {
    this.daySelect = day;
  }
}
