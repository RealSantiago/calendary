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
  public departaments: string[] = [];

  constructor(public service: FoliosService) {}

  ngOnInit(): void {
    this.departaments = [...this.service.departamentsPending];
  }

  ngAfterViewInit() {
    // const resizer = document.querySelector('.resizer') as HTMLElement;
    // const bottom = document.querySelector('.bottom-section') as HTMLElement;
    // const container = document.querySelector('.container') as HTMLElement;
    // let startY: number;
    // let startHeight: number;
    // resizer.addEventListener('mousedown', (e: MouseEvent) => {
    //   e.preventDefault(); // evita selección de texto al arrastrar
    //   startY = e.clientY;
    //   startHeight = bottom.offsetHeight;
    //   const onMouseMove = (event: MouseEvent) => {
    //     const dy = startY - event.clientY;
    //     const newHeight = startHeight + dy;
    //     const minHeight = 150; // mínimo visible
    //     const maxHeight = container.offsetHeight - 150; // límite superior
    //     if (newHeight >= minHeight && newHeight <= maxHeight) {
    //       bottom.style.height = `${newHeight}px`;
    //     }
    //   };
    //   const onMouseUp = () => {
    //     window.removeEventListener('mousemove', onMouseMove);
    //     window.removeEventListener('mouseup', onMouseUp);
    //   };
    //   window.addEventListener('mousemove', onMouseMove);
    //   window.addEventListener('mouseup', onMouseUp);
    // });
  }
  onChangeDate(date: ITitleWeek): void {
    this.titleWeek = date;
    this.onGenerate();
  }

  onGenerate(): void {
    if (!this.titleWeek) return;

    this.service.getAndTransformFoliosByWeek(this.titleWeek).subscribe({
      next: (weekFolios) => {
        console.log('Datos actualizados:', weekFolios);
      },
      error: (err) => {
        console.error('Error al obtener folios:', err);
      },
    });
  }

  onTest(): void {
    console.log(this.service.foliosByDate, 'test');
  }

  onFoliosPending(): void {}
}
