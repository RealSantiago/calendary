import { Component, Input } from '@angular/core';
import { Folio } from '../../interfaces/folios.interfaces';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input() public dataCard?: Folio;

  onDragStar(event: DragEvent): void {
    if (!this.dataCard || !event.dataTransfer) return;

    event.dataTransfer.setData('text/plain', JSON.stringify(this.dataCard));
    event.dataTransfer.effectAllowed = 'move';
  }
}
