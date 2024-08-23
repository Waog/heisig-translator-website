import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnkiReviewComponent } from '../anki-review/anki-review.component';
import { AnkiCard } from '../shared/services/anki-card';
import { AnkiImportService } from '../shared/services/anki-import.service';
import { DebouncedLocalStorageService } from '../shared/services/debounced-local-storage.service';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';

@Component({
  selector: 'app-anki-import',
  standalone: true,
  imports: [CommonModule, FormsModule, AnkiReviewComponent],
  templateUrl: './anki-import.component.html',
  styleUrls: ['./anki-import.component.scss'],
})
export class AnkiImportComponent implements OnInit {
  matchedByGuidAndNoChangesRequired: AnkiCard[] = [];
  matchedByHanziAndNoChangesRequired: AnkiCard[] = [];
  newCards: AnkiCard[] = [];
  matchedByGuidButChangesRequired: AnkiCard[] = [];
  matchedByHanziButChangesRequired: AnkiCard[] = [];
  matchedByHanziButMultipleMatches: AnkiCard[] = [];
  rest: AnkiCard[] = [];

  private readonly lastAnkiImportFile = 'latestAnkiImportFile';
  // NOTE: this key is defined in multiple places, keep them in sync!
  private readonly reviewedGuidsKey = 'reviewedAnkiCardGuidsSinceLastImport';

  constructor(
    private ankiImportService: AnkiImportService,
    private vocabListService: VocabListService,
    private localStorage: DebouncedLocalStorageService
  ) {}

  ngOnInit(): void {
    const storedContent = this.localStorage.getItem(this.lastAnkiImportFile);
    if (storedContent) {
      this.processImportedContent(storedContent);
    }
  }

  importDeck(event: any): void {
    this.resetAllCards();
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result;
        this.localStorage.setItem(this.lastAnkiImportFile, content);
        this.localStorage.setItem(this.reviewedGuidsKey, JSON.stringify([]));
        this.processImportedContent(content);
      };
      reader.readAsText(file);
    }
  }

  private processImportedContent(content: string): void {
    const reviewedGuids = this.getReviewedGuids();
    const allImportedCards: AnkiCard[] =
      this.ankiImportService.importDeck(content);

    const unprocessedCards = allImportedCards.filter(
      (card) => card.guid && !reviewedGuids.includes(card.guid)
    );

    for (const card of unprocessedCards) {
      this.processCard(card);
    }
  }

  private processCard(card: AnkiCard): void {
    const hanzi = VocabItem.ankiHanziToVocabHanzi(card.hanzi);
    if (this.vocabListService.isVocabItem({ ankiGuid: card.guid })) {
      const vocabItem: VocabItem = this.vocabListService.getVocabItem({
        ankiGuid: card.guid,
      })!;
      if (!vocabItem.isCausingChange(card)) {
        this.matchedByGuidAndNoChangesRequired.push(card);
      } else {
        this.matchedByGuidButChangesRequired.push(card);
      }
    } else if (
      this.vocabListService.getVocabItems({ hanzi }).length === 1 &&
      !this.vocabListService.getVocabItem({ hanzi })?.ankiGuid
    ) {
      const vocabItem: VocabItem = this.vocabListService.getVocabItem({
        hanzi,
      })!;
      if (!vocabItem.isCausingChange(card)) {
        this.matchedByHanziAndNoChangesRequired.push(card);
      } else {
        this.matchedByHanziButChangesRequired.push(card);
      }
    } else if (
      !this.vocabListService.isVocabItem({ ankiGuid: card.guid }) &&
      !this.vocabListService.isVocabItem({ hanzi })
    ) {
      this.newCards.push(card);
    } else if (this.vocabListService.getVocabItems({ hanzi }).length > 1) {
      this.matchedByHanziButMultipleMatches.push(card);
    } else {
      this.rest.push(card);
    }
  }

  private getReviewedGuids(): string[] {
    return JSON.parse(this.localStorage.getItem(this.reviewedGuidsKey) || '[]');
  }

  resetAllCards(): void {
    this.matchedByGuidAndNoChangesRequired = [];
    this.matchedByHanziAndNoChangesRequired = [];
    this.newCards = [];
    this.matchedByGuidButChangesRequired = [];
    this.matchedByHanziButChangesRequired = [];
    this.matchedByHanziButMultipleMatches = [];
    this.rest = [];
  }
}
