import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { FoliosService } from './services/folios.service';

import { ITitleWeek } from './interfaces/calendary.interfaces';
import {
  IData,
  IFolio,
  IWeek,
  IWeekDays,
} from './interfaces/folios.interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(CalendarioComponent) public calendariC?: CalendarioComponent;

  public titleWeek?: ITitleWeek;

  constructor(public service: FoliosService) {}

  ngOnInit(): void {}

  ngAfterViewInit() {
    const resizer = document.querySelector('.resizer') as HTMLElement;
    const bottom = document.querySelector('.bottom-section') as HTMLElement;
    const container = document.querySelector('.container') as HTMLElement;

    let startY: number;
    let startHeight: number;

    resizer.addEventListener('mousedown', (e: MouseEvent) => {
      e.preventDefault(); // evita selección de texto al arrastrar
      startY = e.clientY;
      startHeight = bottom.offsetHeight;

      const onMouseMove = (event: MouseEvent) => {
        const dy = startY - event.clientY;
        const newHeight = startHeight + dy;

        const minHeight = 150; // mínimo visible
        const maxHeight = container.offsetHeight - 150; // límite superior

        if (newHeight >= minHeight && newHeight <= maxHeight) {
          bottom.style.height = `${newHeight}px`;
        }
      };

      const onMouseUp = () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  }

  onChangeDate(date: any): void {
    this.titleWeek = date;
    // this.onGetData();
    this.onGenerate();
  }

  onGenerate(): void {
    if (!this.titleWeek) return;

    const { arrayOfDays } = this.titleWeek;
    console.log(arrayOfDays, 'days');

    const previousFolios = { ...this.service.foliosByDate };
    const weekFolios: IWeekDays = { ...previousFolios };

    arrayOfDays.forEach((date) => {
      const dayKey = date.toISOString().split('T')[0];

      if (!weekFolios[dayKey]) {
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
      }
    });

    this.service
      .getProgrammingFolio({
        week_number: this.titleWeek.weekNumber,
        year: this.titleWeek.year,
      })
      .subscribe({
        next: (res) => {
          const { data } = res;

          data.forEach((program: IData) => {
            const { programmed } = program;

            Object.values(programmed).forEach((dayFolios: IFolio[]) => {
              dayFolios.forEach((folio: IFolio) => {
                if (!folio.scheduled_payment_date) return;

                const fecha = new Date(folio.scheduled_payment_date)
                  .toISOString()
                  .split('T')[0];

                const dayData = weekFolios[fecha];
                console.log(dayData);

                if (!dayData) return;

                const alreadyExists = dayData.folios.some(
                  (f) => f.id === folio.id
                );
                if (!alreadyExists) {
                  dayData.folios.push(folio);
                }

                dayData.inicial = 0;
                dayData.totalDay = dayData.folios.reduce(
                  (sum: number, folio: IFolio) =>
                    sum + Number(folio.total || 0),
                  0
                );
                dayData.status = program.status;
              });
            });
          });

          this.service.setFoliosByDate(weekFolios);
          console.log('Datos actualizados:', weekFolios);
        },
        error: (err) => {
          this.service.setFoliosByDate(weekFolios);
        },
      });
  }

  onTest(): void {
    console.log(this.service.foliosByDate, 'test');
  }

  onFoliosPending(): void {}
}
