import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AnkiCard,
  AnkiExportService,
} from '../shared/services/anki-export.service';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';

@Component({
  selector: 'app-anki',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './anki.component.html',
  styleUrls: ['./anki.component.scss'],
})
export class AnkiComponent implements OnInit {
  ankiCards: AnkiCard[] = [];

  constructor(
    private ankiExportService: AnkiExportService,
    private vocabListService: VocabListService
  ) {}

  ngOnInit(): void {
    this.loadAnkiCards();
  }

  loadAnkiCards(): void {
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
    this.ankiCards = vocabItems.map((vocab) => vocab.toAnkiCard());
  }

  exportDeck(): void {
    this.ankiExportService.exportDeck(this.ankiCards);
    const exportedVocabItems = this.vocabListService.getVocabItems({
      markedForAnkiExport: true,
    });
    for (const exportedVocabItem of exportedVocabItems) {
      exportedVocabItem.exportedToAnki = true;
      exportedVocabItem.markedForAnkiExport = false;
    }
    this.vocabListService.saveVocabItems();
    this.loadAnkiCards();
  }
}
