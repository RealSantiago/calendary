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
import { IWeekDayDetails } from '../../interfaces/folios.interfaces';

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
      const dayKey: IWeekDayDetails = data[dayTransform];

      const dayCreate: IDaysWeek = {
        day: day,
        inicial: dayKey.inicial,
        estimate: dayKey.estimado,
        confirmado: dayKey.confirmado,
        finalEstimado: dayKey.finalEstimado,
        finalReal: dayKey.finalReal,
        status: dayKey.status,
        folios: dayKey.folios,
      };
      this.daysShows.push(dayCreate);
    });

    console.log(this.daysShows, 'diasmostrados');
  }

  onSelectDay(day: any): void {
    this.daySelect = day;
    console.log(day);
  }
}
