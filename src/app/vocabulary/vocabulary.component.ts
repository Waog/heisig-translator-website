import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToggleButtonComponent } from '../container-with-buttons/toggle-button.component';
import { SearchFilterInputComponent } from '../search-filter-input/search-filter-input.component';
import { PinyinService } from '../shared/services/pinyin.service';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';
import { VocabCarouselComponent } from '../vocab-carousel/vocab-carousel.component';
import { VocabListComponent } from '../vocab-list/vocab-list.component';

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VocabCarouselComponent,
    VocabListComponent,
    SearchFilterInputComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './vocabulary.component.html',
  styleUrls: ['./vocabulary.component.scss'],
})
export class VocabularyComponent implements OnInit {
  vocabItems: VocabItem[] = [];
  isCarouselVisible: boolean = false;
  carouselIndex: number = 0; // Property to hold the index for the carousel
  searchFilterText: string = '';
  markedForExportFilter: string = 'to export: 🤷';
  exportedFilter: string = 'exported: 🤷';
  importedFilter: string = 'imported: 🤷';
  wordSentenceFilter: string = 'all';

  constructor(
    private vocabListService: VocabListService,
    private pinyinService: PinyinService
  ) {}

  ngOnInit(): void {
    this.loadVocabItems();
  }

  onToggleChange(): void {
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
            item.english
              ?.toLocaleLowerCase()
              .includes(searchFilterTextSegment.toLocaleLowerCase()) ?? false;
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
        return (
          (this.markedForExportFilter.includes('✔️') &&
            item.markedForAnkiExport) ||
          (this.markedForExportFilter.includes('❌') &&
            !item.markedForAnkiExport) ||
          this.markedForExportFilter.includes('🤷')
        );
      })
      .filter((item) => {
        return (
          (this.exportedFilter.includes('✔️') && item.exportedToAnki) ||
          (this.exportedFilter.includes('❌') && !item.exportedToAnki) ||
          this.exportedFilter.includes('🤷')
        );
      })
      .filter((item) => {
        return (
          (this.importedFilter.includes('✔️') && item.importedFromAnki) ||
          (this.importedFilter.includes('❌') && !item.importedFromAnki) ||
          this.importedFilter.includes('🤷')
        );
      })
      .filter((item) => {
        console.log(this.wordSentenceFilter);
        return (
          (this.wordSentenceFilter.includes('word') && item.isWord) ||
          (this.wordSentenceFilter.includes('sentence') && item.isSentence) ||
          this.wordSentenceFilter.includes('all')
        );
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

  deleteVocabItem(item: VocabItem): void {
    this.vocabListService.removeVocabItem({ hanzi: item.hanzi });
    this.loadVocabItems();
  }

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
