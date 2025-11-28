import { Component, Input, OnInit } from '@angular/core';
import { ITitleWeek } from '../../interfaces/calendary.interfaces';

@Component({
  selector: 'app-analytic',
  templateUrl: './analytic.component.html',
  styleUrl: './analytic.component.scss'
})
export class AnalyticComponent implements OnInit {
  @Input() payments: { [key: string]: { [fecha: string]: any[] } } = {};

  @Input() daysWeek?: ITitleWeek;
  // public daysWeek: string[] = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'];

  ngOnInit(): void {
    console.log(this.daysWeek);
  }

  dateTransform(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }
}
