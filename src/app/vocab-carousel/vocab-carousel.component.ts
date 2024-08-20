import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabItemFormComponent } from '../vocab-item-form/vocab-item-form.component';

@Component({
  selector: 'app-vocab-carousel',
  standalone: true,
  imports: [CommonModule, FormsModule, VocabItemFormComponent],
  templateUrl: './vocab-carousel.component.html',
  styleUrls: ['./vocab-carousel.component.scss'],
})
export class VocabCarouselComponent implements OnChanges {
  @Input() vocabItems: VocabItem[] = [];
  @Input() initialIndex: number = 0;
  @Output() delete = new EventEmitter<VocabItem>();
  @Output() close = new EventEmitter<void>();

  currentIndex: number = 0;

  constructor(private router: Router) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['initialIndex'] &&
      changes['initialIndex'].currentValue !== undefined
    ) {
      this.currentIndex = changes['initialIndex'].currentValue;
    }
  }

  get totalItems(): number {
    return this.vocabItems.length;
  }

  prevItem(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }

  nextItem(): void {
    if (this.currentIndex < this.totalItems - 1) {
      this.currentIndex++;
    }
  }

  deleteCurrentItem(): void {
    const itemToDelete = this.vocabItems[this.currentIndex];
    this.delete.emit(itemToDelete);
  }

  closeCarousel(): void {
    this.close.emit();
  }

  navigateToTranslator(): void {
    this.router.navigate(['/translator'], {
      queryParams: { input: this.vocabItems[this.currentIndex].hanzi },
    });
  }
}
