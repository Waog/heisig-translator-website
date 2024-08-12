import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';
import { VocabItemFormComponent } from '../vocab-item-form/vocab-item-form.component';

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, VocabItemFormComponent],
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.scss'],
})
export class VocabularyComponent implements OnInit {
  vocabItems: VocabItem[] = [];
  filters: { [key: string]: number } = {
    importedFromAnki: 0,
    exportedToAnki: 0,
    markedForAnkiExport: 0,
  };

  wordSentenceFilter: number = 0; // 0 = No Filter, 1 = Words, 2 = Sentences

  constructor(private vocabListService: VocabListService) {}

  ngOnInit(): void {
    this.loadVocabItems();
  }

  loadVocabItems(): void {
    this.vocabItems = this.vocabListService
      .getAllVocabItems()
      .filter((item) => {
        // Apply flag filters
        const flagFilter = Object.keys(this.filters).every((flag) => {
          const flagKey = flag as keyof VocabItem;
          if (this.filters[flag] === 1) return item[flagKey] === true;
          if (this.filters[flag] === 2) return item[flagKey] === false;
          return true;
        });

        // Apply word/sentence filter
        const wordSentenceFilter =
          this.wordSentenceFilter === 0 ||
          (this.wordSentenceFilter === 1 && item.isWord) ||
          (this.wordSentenceFilter === 2 && item.isSentence);

        return flagFilter && wordSentenceFilter;
      });
  }

  toggleFilter(flag: string): void {
    this.filters[flag] = (this.filters[flag] + 1) % 3;
    this.loadVocabItems();
  }

  toggleWordSentenceFilter(): void {
    this.wordSentenceFilter = (this.wordSentenceFilter + 1) % 3;
    this.loadVocabItems();
  }

  deleteVocabItem(item: VocabItem): void {
    this.vocabListService.removeVocabItem({ hanzi: item.hanzi });
    this.loadVocabItems();
  }
}
