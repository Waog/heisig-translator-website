import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AnkiCardCarouselComponent } from '../anki-card-carousel/anki-card-carousel.component';
import { AnkiCardListComponent } from '../anki-card-list/anki-card-list.component';
import { AnkiCard } from '../shared/services/anki-card';
import { AnkiExportService } from '../shared/services/anki-export.service';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';

@Component({
  selector: 'app-anki-export',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AnkiCardCarouselComponent,
    AnkiCardListComponent,
  ],
  templateUrl: './anki-export.component.html',
  styleUrls: ['./anki-export.component.scss'],
})
export class AnkiExportComponent implements OnInit {
  ankiCards: AnkiCard[] = [];
  isCarouselVisible: boolean = false;
  carouselIndex: number = 0;

  constructor(
    private ankiExportService: AnkiExportService,
    private vocabListService: VocabListService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.loadAnkiCards();
  }

  async loadAnkiCards(): Promise<void> {
    const vocabItems: VocabItem[] = [
      ...this.vocabListService.getVocabItems({
        markedForAnkiExport: true,
        isWord: true,
      }),
      ...this.vocabListService.getVocabItems({
        markedForAnkiExport: true,
        isSentence: true,
      }),
    ];
    this.ankiCards = await Promise.all(
      vocabItems.map(async (vocab) => await vocab.toAnkiCard())
    );
    if (this.ankiCards.length === 0) {
      this.hideCarousel();
    }
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

  async exportDeck(): Promise<void> {
    this.ankiExportService.exportDeck(this.ankiCards);
    const exportedVocabItems = this.vocabListService.getVocabItems({
      markedForAnkiExport: true,
    });
    for (const exportedVocabItem of exportedVocabItems) {
      exportedVocabItem.exportedToAnki = true;
      exportedVocabItem.markedForAnkiExport = false;
    }
    this.vocabListService.saveVocabItems();
    await this.loadAnkiCards();
  }
}
