import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AnkiCard } from '../shared/services/anki-card';

@Component({
  selector: 'app-anki-card-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './anki-card-list.component.html',
  styleUrls: ['./anki-card-list.component.scss'],
})
export class AnkiCardListComponent {
  @Input() ankiCards: AnkiCard[] = [];
  @Output() viewDetails = new EventEmitter<number>();

  viewAnkiCardDetails(index: number): void {
    this.viewDetails.emit(index);
  }
}
