import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
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
  public allPayments: any = {};
  bottomPanelOpen: boolean = false;
  bottomPanelHeight: number = 250; // altura inicial en px
  isResizing: boolean = false;
  startY: number = 0;
  startHeight: number = 0;

  constructor(public service: FoliosService) { }

  ngOnInit(): void {
    this.departaments = [...this.service.departamentsPending];
  }

  toggleBottomPanel() {
    this.bottomPanelOpen = !this.bottomPanelOpen;
    if (this.bottomPanelOpen) {
      this.bottomPanelHeight = 250;
    }
  }

  startResize(event: MouseEvent) {
    this.isResizing = true;
    this.startY = event.clientY;
    this.startHeight = this.bottomPanelHeight;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isResizing) return;

    const diff = this.startY - event.clientY; // Movimiento hacia arriba (positivo)
    const newHeight = Math.max(100, Math.min(600, this.startHeight + diff));

    this.bottomPanelHeight = newHeight;
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isResizing = false;
  }

  ngAfterViewInit() { }
  onChangeDate(date: ITitleWeek): void {
    this.titleWeek = date;
    this.onGenerate();
  }

  onGenerate(): void {
    if (!this.titleWeek) return;

    this.service.getAndTransformFoliosByWeek(this.titleWeek).subscribe({
      next: (weekFolios) => {
        console.log('Datos actualizados:', weekFolios);
        this.allPayments = weekFolios;
      },
      error: (err) => {
        console.error('Error al obtener folios:', err);
      },
    });
  }

  onTest(): void {
    console.log(this.service.foliosByDate, 'test');
  }

  onFoliosPending(): void { }

  onSaveTemporality(): void {
    const data = this.service.onSaveProgramming(this.titleWeek);
    console.log(this.titleWeek);

    console.log(data);

    // return



    if (!data || data.length === 0) {
      console.warn('No hay datos para guardar');
      return;
    }


    data.forEach((weekData: any) => {
      const { idWeek, ...payload } = weekData;

      console.log('ID de la semana:', idWeek);
      console.log('Payload a enviar:', payload);


      this.service.onUpdateWeekPrograming(idWeek, payload).subscribe({
        next: (res) => console.log(`Semana ${idWeek} actualizada`, res),
        error: (err) => console.error(`Error en semana ${idWeek}`, err),
      });
    });
  }

}
