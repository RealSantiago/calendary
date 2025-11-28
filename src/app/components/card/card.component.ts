import { Component, Input, OnInit } from '@angular/core';
import { IFolio } from '../../interfaces/folios.interfaces';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent implements OnInit {
  @Input() public dataCard?: IFolio;
  @Input() public status: string | undefined;
  @Input() public fromDate?: any | undefined;
  @Input() public onAction?: () => void;

  constructor() { }

  ngOnInit(): void {
    // console.log(this.status);

    // console.log(this.dataCard);
  }

  onDragStar(event: DragEvent): void {

    if (!this.dataCard || !event.dataTransfer) return;

    if (this.isTextBeingSelected()) {
      event.preventDefault();
      return;
    }

    // TODO: OPCIONA -> PODRIAMOS BLOQUEAR QUE LOS QUE ESTEN CONFRIMADOS NO DE PAGO SE PUEDAN MOVER
    // if (this.dataCard?.CStatus === 'Pagado') {
    //   event.preventDefault();
    //   return;
    // }

    if (this.status === 'confirmed') {
      event.preventDefault();
      return;
    }


    console.log(this.dataCard);
    const payload = {
      folio: this.dataCard,
      fromDate: this.fromDate,
    };

    event.dataTransfer.setData('text/plain', JSON.stringify(payload));
    event.dataTransfer.effectAllowed = 'move';
  }

  onDelete(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.onAction) return;
    this.onAction();
  }
  private isTextBeingSelected(): boolean {
    const selection = window.getSelection();
    return !!selection && selection.toString().length > 0;
  }

}
