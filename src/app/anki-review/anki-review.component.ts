import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnkiCardCarouselComponent } from '../anki-card-carousel/anki-card-carousel.component';
import { AnkiCardListComponent } from '../anki-card-list/anki-card-list.component';
import { AnkiCard } from '../shared/services/anki-card';

@Component({
  selector: 'app-anki-review',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AnkiCardCarouselComponent,
    AnkiCardListComponent,
  ],
  templateUrl: './anki-review.component.html',
  styleUrls: ['./anki-review.component.scss'],
})
export class AnkiReviewComponent {
  @Input() ankiCards: AnkiCard[] = [];
  @Input() applyAllType: 'update' | 'create' | 'none' = 'none';
  isCarouselVisible: boolean = false;
  carouselIndex: number = 0;

  showCarousel(index: number): void {
    this.carouselIndex = index;
    this.isCarouselVisible = true;
    window.scrollTo({ top: 0 });
  }

  hideCarousel(): void {
    this.isCarouselVisible = false;
    window.scrollTo({ top: 0 });
  }
}
