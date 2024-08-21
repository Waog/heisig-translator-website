import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
})
export class FavoriteButtonComponent implements OnInit, OnChanges, OnDestroy {
  @Input() hanziString: string = '';
  @Input() type: 'word' | 'sentence' = 'sentence';
  @Input() context?: string;
  @Input() customSegmentation?: string = '';
  @Input() allowMultiple: boolean = false;

  vocabItems: VocabItem[] = [];
  disabled: boolean = false;
  subscription!: Subscription;

  constructor(private vocabListService: VocabListService) {}

  ngOnInit(): void {
    this.loadFavoriteStatus();
    this.subscription = this.vocabListService.onChange$.subscribe(() =>
      this.loadFavoriteStatus()
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hanziString'] && !changes['hanziString'].firstChange) ||
      changes['type']
    ) {
      this.loadFavoriteStatus();
    }
  }

  loadFavoriteStatus(): void {
    if (!this.hanziString) {
      this.disabled = true;
      this.vocabItems = [];
    } else {
      this.disabled = false;
      this.vocabItems = this.vocabListService.getVocabItems({
        hanzi: this.hanziString,
      });
    }
  }

  async toggleFavorite(): Promise<void> {
    if (this.vocabItems.length > 0) {
      this.vocabListService.removeVocabItem({ hanzi: this.hanziString });
    } else {
      await this.addFavorite();
    }
  }

  async addFavorite(): Promise<void> {
    await this.vocabListService.createAndFillVocabItem({
      hanzi: this.hanziString,
      markedForAnkiExport: true,
      segmentation: this.customSegmentation
        ? this.customSegmentation.split('.')
        : undefined,
    });
  }
}
