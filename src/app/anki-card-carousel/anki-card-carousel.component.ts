import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { AnkiCardDetailsComponent } from '../anki-card-details/anki-card-details.component';
import { JsonDiffComponent } from '../json-diff/json-diff.component';
import { AnkiCard } from '../shared/services/anki-card';
import { DebouncedLocalStorageService } from '../shared/services/debounced-local-storage.service';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';
import { VocabServiceCollectionService } from '../shared/services/vocab-service-collection.service';
import { VocabItemFormComponent } from '../vocab-item-form/vocab-item-form.component';

@Component({
  selector: 'app-anki-card-carousel',
  standalone: true,
  imports: [
    CommonModule,
    AnkiCardDetailsComponent,
    VocabItemFormComponent,
    JsonDiffComponent,
  ],
  templateUrl: './anki-card-carousel.component.html',
  styleUrls: ['./anki-card-carousel.component.scss'],
})
export class AnkiCardCarouselComponent implements OnChanges {
  @Input() ankiCards: AnkiCard[] = [];
  @Input() initialIndex: number = 0;
  @Input() showVocabChanges: boolean = false;
  @Input() applyAllType: 'update' | 'create' | 'none' = 'none';
  @Output() close = new EventEmitter<void>();

  currentIndex: number = 0;
  currentVocabItems: VocabItem[] = [];
  currentVocabItemsAfterChange: VocabItem[] = [];
  newVocabItem!: VocabItem;

  // NOTE: this key is defined in multiple places, keep them in sync!
  private readonly localStorageKey = 'reviewedAnkiCardGuidsSinceLastImport';

  constructor(
    private vocabListService: VocabListService,
    private vocabServiceCollectionService: VocabServiceCollectionService,
    private localStorage: DebouncedLocalStorageService
  ) {}

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (
      changes['initialIndex'] &&
      changes['initialIndex'].currentValue !== undefined
    ) {
      this.currentIndex = changes['initialIndex'].currentValue;
    }
    if (this.currentIndex >= this.totalItems) {
      this.currentIndex = this.totalItems - 1;
    }
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    await this.updateVocabItems();
  }

  get totalItems(): number {
    return this.ankiCards.length;
  }

  async prevItem(): Promise<void> {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      await this.updateVocabItems();
    }
  }

  async nextItem(): Promise<void> {
    if (this.currentIndex < this.totalItems - 1) {
      this.currentIndex++;
      await this.updateVocabItems();
    }
  }

  closeCarousel(): void {
    this.close.emit();
  }

  async onCreateAll(): Promise<void> {
    while (this.ankiCards.length > 0) {
      await this.onCreateVocabItem();
      if (this.ankiCards.length % 10 === 0) await this.ensureUiUpdate();
    }
  }

  async onUpdateAll(): Promise<void> {
    while (this.ankiCards.length > 0) {
      if (this.currentVocabItems.length === 1 && this.currentVocabItems[0]) {
        await this.onApplyDiff(this.currentVocabItems[0]);
      } else {
        window.alert(`⚠️ Aborting!\n
          Couldn't find a single distinct VocabItem to update.\n
          found: ${JSON.stringify(this.currentVocabItems)}.`);
        break;
      }
      if (this.ankiCards.length % 10 === 0) await this.ensureUiUpdate();
    }
  }

  async onApplyDiff(vocabItem: VocabItem): Promise<void> {
    await vocabItem
      .updateFromAnkiCard(this.ankiCards[this.currentIndex])
      .autoFillEmptyFields();
    this.vocabListService.saveVocabItems();
    this.storeReviewedAnkiCardGuid(this.ankiCards[this.currentIndex].guid);
    await this.onDeleteAnkiCard();
  }

  async onCreateVocabItem(): Promise<void> {
    await this.vocabListService.createAndFillVocabItem(this.newVocabItem);
    this.storeReviewedAnkiCardGuid(this.ankiCards[this.currentIndex].guid);
    await this.onDeleteAnkiCard();
  }

  async onDeleteAnkiCard(): Promise<void> {
    this.storeReviewedAnkiCardGuid(this.ankiCards[this.currentIndex].guid);
    this.ankiCards.splice(this.currentIndex, 1);
    if (this.totalItems > 0) {
      await this.updateVocabItems();
    } else {
      this.closeCarousel();
    }
  }

  private async updateVocabItems() {
    this.ensureIndexInRange();
    if (this.showVocabChanges) {
      this.newVocabItem = new VocabItem(
        this.ankiCards[this.currentIndex],
        this.vocabServiceCollectionService
      ).updateFromAnkiCard(this.ankiCards[this.currentIndex]);
      await this.newVocabItem.autoFillEmptyFields();
      this.currentVocabItems = this.vocabListService.getVocabItemsByAnkiCard(
        this.ankiCards[this.currentIndex]
      );
      this.currentVocabItemsAfterChange = await Promise.all(
        this.currentVocabItems.map(async (vocabItem) => {
          const clone = vocabItem
            .clone()
            .updateFromAnkiCard(this.ankiCards[this.currentIndex]);
          await clone.autoFillEmptyFields();
          return clone;
        })
      );
    } else {
      this.currentVocabItems = [];
    }
  }

  private ensureIndexInRange(): void {
    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
    if (this.currentIndex >= this.totalItems) {
      this.currentIndex = this.totalItems - 1;
    }
  }

  private storeReviewedAnkiCardGuid(guid: string | undefined): void {
    if (!guid) return;

    const reviewedGuids = JSON.parse(
      this.localStorage.getItem(this.localStorageKey) || '[]'
    );
    if (!reviewedGuids.includes(guid)) {
      reviewedGuids.push(guid);
      this.localStorage.setItem(
        this.localStorageKey,
        JSON.stringify(reviewedGuids)
      );
    }
  }

  private ensureUiUpdate(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 10));
  }
}
