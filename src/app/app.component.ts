import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CalendarioComponent } from './components/calendario/calendario.component';
import { FoliosService } from './services/folios.service';

import { ITitleWeek } from './interfaces/calendary.interfaces';
import { IData, IFolio, IWeek } from './interfaces/folios.interfaces';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild(CalendarioComponent) public calendariC?: CalendarioComponent;

  public titleWeek?: ITitleWeek;

  constructor(public service: FoliosService) {}

  ngOnInit(): void {
    // this.service.getProgrammingFolio({week_number:}).subscribe({
    //   next: (res) => {
    //     const { data, pending } = res;
    //     const foliosByDate: IFolioByDate = {};
    //     console.log(data, 'data');
    //     data.forEach((program: Datum) => {
    //       const { week } = program;
    //       Object.values(week).forEach((dayFolios: Folio[]) => {
    //         dayFolios.forEach((folio: Folio) => {
    //           const fecha = folio.scheduled_payment_date
    //             ? new Date(folio.scheduled_payment_date)
    //                 .toISOString()
    //                 .split('T')[0]
    //             : new Date(folio.date_request).toISOString().split('T')[0];
    //           if (!foliosByDate[fecha]) {
    //             foliosByDate[fecha] = {
    //               initial: 0,
    //               estimate: 0,
    //               final: 0,
    //               folios: [],
    //             };
    //           }
    //           foliosByDate[fecha].initial = Number(program.initial_amount);
    //           foliosByDate[fecha].estimate = Number(program.final_amount);
    //           foliosByDate[fecha].folios.push(folio);
    //         });
    //       });
    //     });
    //     this.service.setFoliosPending(pending);
    //     this.service.setFoliosByDate(foliosByDate);
    //   },
    // });
  }

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
    console.log(this.titleWeek);

    const { arrayOfDays } = this.titleWeek;
    // console.log(arrayOfDays);

    const weekFolios: IWeek = { week: {}, status: 'new' };

    arrayOfDays.forEach((date) => {
      const dayKey = date.toLocaleDateString('en-CA');

      weekFolios.week[dayKey] = {
        inicial: 0,
        estimado: 0,
        final: 0,
        folios: [],
      };
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

                if (!weekFolios.week[fecha]) {
                  weekFolios.week[fecha] = {
                    inicial: 0,
                    estimado: 0,
                    final: 0,
                    folios: [],
                  };
                }

                weekFolios.week[fecha].inicial = 0;
                weekFolios.week[fecha].estimado = 1;
                weekFolios.week[fecha].final = 2;
                weekFolios.week[fecha].folios.push(folio);
              });
            });
          });
          this.service.setFoliosByDate(weekFolios);
          console.log(weekFolios);
          // console.log(this.service.foliosByDate, 'jejej');
        },
      });
  }

  onTest(): void {
    console.log(this.service.foliosByDate, 'test');
  }
}
