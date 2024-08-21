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
  carouselIndex: number = 0;
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
      .filter((item) => this.filterBySearchText(item))
      .filter((item) => this.filterByExportStatus(item))
      .filter((item) => this.filterByImportStatus(item))
      .filter((item) => this.filterByWordSentence(item))
      .sort((a, b) => this.sortVocabItems(a, b));
    if (this.vocabItems.length === 0) {
      this.hideCarousel();
    }
  }

  filterBySearchText(item: VocabItem): boolean {
    const orSegments = this.searchFilterText.split(',');

    return orSegments.some((orSegment) =>
      this.matchesAnyField(item, orSegment)
    );
  }

  filterByExportStatus(item: VocabItem): boolean {
    return (
      (this.markedForExportFilter.includes('✔️') && item.markedForAnkiExport) ||
      (this.markedForExportFilter.includes('❌') &&
        !item.markedForAnkiExport) ||
      this.markedForExportFilter.includes('🤷')
    );
  }

  filterByImportStatus(item: VocabItem): boolean {
    return (
      (this.importedFilter.includes('✔️') && item.importedFromAnki) ||
      (this.importedFilter.includes('❌') && !item.importedFromAnki) ||
      this.importedFilter.includes('🤷')
    );
  }

  filterByWordSentence(item: VocabItem): boolean {
    return (
      (this.wordSentenceFilter.includes('word') && item.isWord) ||
      (this.wordSentenceFilter.includes('sentence') && item.isSentence) ||
      this.wordSentenceFilter.includes('all')
    );
  }

  matchesAnyField(item: VocabItem, segment: string): boolean {
    return (
      item.uuid.includes(segment) ||
      item.hanzi.includes(segment) ||
      (item.english
        ?.toLocaleLowerCase()
        .includes(segment.toLocaleLowerCase()) ??
        false) ||
      this.pinyinService
        .pinyinToPinyinWithoutTones(item.pinyin || '')
        .replace(' ', '')
        .includes(segment.replace(' ', '')) ||
      (item.heisigKeywords?.includes(segment) ?? false)
    );
  }

  sortVocabItems(vocabItemA: VocabItem, vocabItemB: VocabItem): number {
    const searchFilterText = this.searchFilterText.trim().toLowerCase();
    const itemAFullMatch = this.isFullTextMatch(vocabItemA, searchFilterText);
    const itemBFullMatch = this.isFullTextMatch(vocabItemB, searchFilterText);

    if (itemAFullMatch && !itemBFullMatch) {
      return -1;
    } else if (!itemAFullMatch && itemBFullMatch) {
      return 1;
    }

    return vocabItemA.hanzi.localeCompare(vocabItemB.hanzi);
  }

  isFullTextMatch(item: VocabItem, searchText: string): boolean {
    return (
      item.uuid === searchText ||
      item.hanzi === searchText ||
      item.english?.toLowerCase() === searchText ||
      this.pinyinService
        .pinyinToPinyinWithoutTones(item.pinyin || '')
        .replace(' ', '') === searchText.replace(' ', '') ||
      item.heisigKeywords?.toLowerCase() === searchText.toLowerCase()
    );
  }

  deleteVocabItem(item: VocabItem): void {
    if (item.uuid) {
      this.vocabListService.removeVocabItem({ uuid: item.uuid });
    }
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
