import { Component, Input } from '@angular/core';
import { IFolio } from '../../interfaces/folios.interfaces';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() public dataCard?: IFolio;
  @Input() public status: string | undefined;
  @Input() public fromDate?: any | undefined;
  @Input() public onAction?: () => void;
  onDragStar(event: DragEvent): void {
    if (!this.dataCard || !event.dataTransfer) return;

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
}
