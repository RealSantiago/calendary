import {
  AfterViewInit,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import {
  MatDatepickerInputEvent,
  MatCalendarCellClassFunction,
} from '@angular/material/datepicker';

@Component({
  selector: 'app-custom-date-picker',
  templateUrl: './custom-date-picker.component.html',
  styleUrls: ['./custom-date-picker.component.scss'],
})
export class CustomDatePickerComponent implements OnInit, AfterViewInit {
  public dateSelection: Date = new Date();
  public startOfWeek!: Date;
  public endOfWeek!: Date;
  public weekReady: any;

  @Output() private selectWeek = new EventEmitter<any>();

  constructor(private dateAdapter: DateAdapter<Date>) {
    this.dateAdapter.setLocale('es');
  }

  ngOnInit(): void {
    // inicializa la semana seleccionada por defecto (tu logic actual)
  }
  ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      // Obtener el lunes de la próxima semana
      const nextWeekStart = new Date(this.dateSelection);
      nextWeekStart.setDate(nextWeekStart.getDate() + 7);

      this.setWeekRange(nextWeekStart);
      this.weekReady = this.getDataDate();
      this.selectWeek.emit(this.weekReady);
    });
  }

  onSelectDate(event: MatDatepickerInputEvent<Date>): void {
    if (!event.value) return;
    this.setWeekRange(event.value);

    const formatter = new Intl.DateTimeFormat('es-MX', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    const startFormatted = formatter.format(this.startOfWeek);
    const endFormatted = formatter.format(this.endOfWeek);

    this.weekReady = `${startFormatted} - ${endFormatted}`;
    // console.log(this.weekReady, 'sas');

    const data = this.getDataDate();
    this.weekReady = data;
    // console.log('Datos de la semana:', data);
    this.selectWeek.emit(this.weekReady);
  }

  private setWeekRange(date: Date): void {
    const monday = this.getStartWeek(date);
    const friday = new Date(monday);
    friday.setDate(monday.getDate() + 4);

    this.startOfWeek = monday;
    this.endOfWeek = friday;
    this.dateSelection = monday;
  }

  private getStartWeek(date: Date): Date {
    const day = new Date(date);
    const dayOfWeek = day.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    day.setDate(day.getDate() + diff);
    day.setHours(0, 0, 0, 0);
    return day;
  }

  myFilter = (d: Date | null): boolean => {
    if (!d) return false;

    const date = new Date(d);
    date.setHours(0, 0, 0, 0);

    // Bloquear sábado y domingo
    const day = date.getDay();
    if (day === 0 || day === 6) return false;

    // Lunes de la semana actual
    const today = new Date();
    const currentWeekStart = this.getStartWeek(today);

    // Viernes de la semana actual
    const currentWeekEnd = new Date(currentWeekStart);
    currentWeekEnd.setDate(currentWeekStart.getDate() + 4);

    // Lunes de la semana futura permitida (una semana extra)
    const nextWeekStart = new Date(currentWeekStart);
    nextWeekStart.setDate(currentWeekStart.getDate() + 7);

    // Viernes de la semana futura permitida
    const nextWeekEnd = new Date(nextWeekStart);
    nextWeekEnd.setDate(nextWeekStart.getDate() + 4);

    if (
      date <= currentWeekEnd ||
      (date >= nextWeekStart && date <= nextWeekEnd)
    ) {
      return true;
    }

    return false; // todas las demás fechas bloqueadas
  };

  dateClass: MatCalendarCellClassFunction<Date> = (cellDate, view) => {
    if (view === 'month' && this.startOfWeek && this.endOfWeek) {
      if (cellDate >= this.startOfWeek && cellDate <= this.endOfWeek) {
        return 'week-selected';
      }
    }
    return '';
  };

  getDataDate(): {
    week: string;
    month: string;
    year: string;
    weekNumber: number;
    arrayOfDays: Date[];
  } {
    const firstDate = this.startOfWeek;
    const lastDate = this.endOfWeek;

    const startDay = firstDate.toLocaleDateString('es-MX', { day: 'numeric' });
    const endDay = lastDate.toLocaleDateString('es-MX', { day: 'numeric' });

    const firstMonth = firstDate.toLocaleDateString('es-MX', { month: 'long' });
    const lastMonth = lastDate.toLocaleDateString('es-MX', { month: 'long' });

    const monthText =
      firstMonth === lastMonth ? firstMonth : `${firstMonth} - ${lastMonth}`;

    const arrayOfDays: Date[] = [];
    const tempDate = new Date(firstDate);
    while (tempDate <= lastDate) {
      arrayOfDays.push(new Date(tempDate)); // crear una copia para no mutar la referencia
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return {
      week: `${startDay} ${firstMonth} - ${endDay} ${lastMonth}`,
      month: monthText,
      year: firstDate.getFullYear().toString(),
      weekNumber: this.getISOWeekNumber(firstDate),
      arrayOfDays,
    };
  }

  private getISOWeekNumber(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    // Ajustar al jueves de la semana actual (ISO)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7));

    const yearStart = new Date(d.getFullYear(), 0, 1);
    const weekNo = Math.ceil(
      ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );
    return weekNo;
  }
}
