import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SearchFilterInputComponent } from '../search-filter-input/search-filter-input.component';
import { PinyinService } from '../shared/services/pinyin.service';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';
import { VocabItemFormComponent } from '../vocab-item-form/vocab-item-form.component';

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, VocabItemFormComponent, SearchFilterInputComponent],
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.scss'],
})
export class VocabularyComponent implements OnInit {
  vocabItems: VocabItem[] = [];
  searchFilterText: string = '';
  filters: { [key: string]: number } = {
    importedFromAnki: 0,
    exportedToAnki: 0,
    markedForAnkiExport: 0,
  };

  wordSentenceFilter: number = 0; // 0 = No Filter, 1 = Words, 2 = Sentences

  constructor(
    private vocabListService: VocabListService,
    private pinyinService: PinyinService
  ) {}

  ngOnInit(): void {
    this.loadVocabItems();
  }

  onSearchFilterTextChange(text: string): void {
    this.searchFilterText = text;
    this.loadVocabItems();
  }

  loadVocabItems(): void {
    this.vocabItems = this.vocabListService
      .getAllVocabItems()
      .filter((item) => {
        // filter by search filter input, consider spaces as AND
        let hanziMatches = true;
        let englishMatches = true;
        let pinyinMatches = true;
        let heisigMatches = true;
        for (const searchFilterTextSegment of this.searchFilterText.split(
          ' '
        )) {
          hanziMatches &&= item.hanzi.includes(searchFilterTextSegment);
          englishMatches &&=
            item.english?.includes(searchFilterTextSegment) ?? false;
          pinyinMatches &&= this.pinyinService
            .pinyinToPinyinWithoutTones(item.pinyin || '')
            .replace(' ', '')
            .includes(searchFilterTextSegment.replace(' ', ''));
          heisigMatches &&=
            item.heisigKeywords?.includes(searchFilterTextSegment) ?? false;
        }
        return hanziMatches || englishMatches || pinyinMatches || heisigMatches;
      })
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
      })
      .sort((vocabItemA, vocabItemB) => {
        // sort by: full text matches of any field with the full text of this.searchFilterText first, rest second

        const searchFilterText = this.searchFilterText.trim().toLowerCase();

        // Helper function to check if any field fully matches the search text
        const fullTextMatch = (item: VocabItem): boolean => {
          return (
            item.hanzi === searchFilterText ||
            item.english?.toLowerCase() === searchFilterText ||
            this.pinyinService
              .pinyinToPinyinWithoutTones(item.pinyin || '')
              .replace(' ', '') === searchFilterText ||
            item.heisigKeywords?.toLowerCase() === searchFilterText
          );
        };

        const itemAFullMatch = fullTextMatch(vocabItemA);
        const itemBFullMatch = fullTextMatch(vocabItemB);

        if (itemAFullMatch && !itemBFullMatch) {
          return -1; // vocabItemA comes first
        } else if (!itemAFullMatch && itemBFullMatch) {
          return 1; // vocabItemB comes first
        }

        // If neither or both fully match, sort alphabetically by hanzi as a fallback
        return vocabItemA.hanzi.localeCompare(vocabItemB.hanzi);
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
