import {
  Component,
  EventEmitter,
  OnInit,
  AfterViewInit,
  Output,
  Input,
} from '@angular/core';
import { ITitleWeek } from '../../interfaces/calendary.interfaces';

interface DayCalendary {
  fecha: Date;
  folios: any[];
  initial: number;
  estimate: number;
  final: number;
}

@Component({
  selector: 'app-calendario',
  templateUrl: './calendario.component.html',
  styleUrls: ['./calendario.component.scss'],
})
export class CalendarioComponent implements OnInit, AfterViewInit {
  // FECHA QUE RECIBE DEL PADRE
  @Input() set dataSelection(date: any) {
    // console.log(date, 'del setter');
  }

  @Output() titleWeekE = new EventEmitter<{
    week: string;
    year: string;
    month: string;
  }>();

  public titleWeek: { week: string; year: string; month: string } = {
    week: '',
    year: '',
    month: '',
  };

  public presentDay: Date = new Date();
  public daysOfWeek: string[] = [
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
  ];
  public daysShows: DayCalendary[] = [];

  // *------------
  public daySelect?: any;

  constructor() {}
  ngOnInit(): void {
    this.updateCalendary();
    // console.log(this.daysShows, '000');
  }
  ngAfterViewInit(): void {
    this.calculateTitleWeek();
    //
  }

  private calculateTitleWeek(): void {
    if (!this.daysShows || this.daysShows.length === 0) {
      return;
    }

    const firstDate = this.daysShows[0].fecha;
    const lastDate = this.daysShows[this.daysShows.length - 1].fecha;

    const startDay = firstDate.toLocaleDateString('es-MX', { day: 'numeric' });
    const endDay = lastDate.toLocaleDateString('es-MX', { day: 'numeric' });

    const firstYear = firstDate.getFullYear().toString();
    const lastYear = lastDate.getFullYear().toString();

    const firstMonth = firstDate.toLocaleDateString('es-MX', { month: 'long' });
    const lastMonth = lastDate.toLocaleDateString('es-MX', { month: 'long' });

    const monthText =
      firstMonth === lastMonth ? firstMonth : `${firstMonth} - ${lastMonth}`;

    const yearText =
      firstYear === lastYear ? `${firstYear}` : `${firstYear} / ${lastYear}`;

    // Construir el título final
    this.titleWeek = {
      week: `${startDay} ${firstMonth} - ${endDay} ${lastMonth}`,
      year: lastYear,
      month: monthText,
    };

    setTimeout(() => {
      this.titleWeekE.emit(this.titleWeek);
    }, 0);
  }

  private createCalendary(date: Date): DayCalendary {
    return {
      fecha: new Date(date),
      folios: [],
      initial: 0,
      estimate: 0,
      final: 0,
    };
  }

  private updateCalendary(): void {
    this.daysShows = [];
    const startWeek = this.getStartWeek(this.presentDay);
    for (let i = 0; i < 5; i++) {
      const fecha = new Date(startWeek);
      fecha.setDate(fecha.getDate() + i);
      this.daysShows.push(this.createCalendary(fecha));
    }
  }

  private getStartWeek(dateN: Date): Date {
    const dia = new Date(dateN);
    const diaSemana = dia.getDay();
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
    dia.setDate(dia.getDate() + diff);
    dia.setHours(0, 0, 0, 0);
    return dia;
  }

  public navigationWeek(days: number = 7): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxWeekLimit = new Date(today);
    maxWeekLimit.setDate(today.getDate() + 7);

    if (days > 0 && this.presentDay >= maxWeekLimit) return;

    this.presentDay.setDate(this.presentDay.getDate() + days);
    this.presentDay = new Date(this.presentDay);
    this.updateCalendary();
    this.calculateTitleWeek();
    this.titleWeekE.emit(this.titleWeek);
  }

  onSelectDay(day: any): void {
    console.log(day, 'dia');
    this.daySelect = day;
  }
}
