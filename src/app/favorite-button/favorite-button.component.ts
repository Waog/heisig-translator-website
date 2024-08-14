import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { VocabListService } from '../shared/services/vocab-list.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
})
export class FavoriteButtonComponent implements OnInit, OnChanges {
  @Input() hanziString: string = '';
  @Input() type: 'word' | 'sentence' = 'sentence';
  @Input() context?: string;
  @Input() customSegmentation?: string = '';

  isVocabItem: boolean = false;
  vocabItemHasSameFromInput: boolean = false;

  constructor(private vocabListService: VocabListService) {}

  ngOnInit(): void {
    this.loadFavoriteStatus();
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
    if (this.type === 'sentence') {
      this.isVocabItem = this.vocabListService.isVocabItem({
        hanzi: this.hanziString,
        isSentence: true,
      });
      this.vocabItemHasSameFromInput = true;
    } else {
      this.isVocabItem = this.vocabListService.isVocabItem({
        hanzi: this.hanziString,
        isWord: true,
      });
      this.vocabItemHasSameFromInput =
        this.vocabListService
          .getVocabItem({
            hanzi: this.hanziString,
            isWord: true,
          })
          ?.fromInputSentence.includes(this.context!) ?? false;
    }
  }

  async toggleFavorite(): Promise<void> {
    if (this.isVocabItem && this.vocabItemHasSameFromInput) {
      if (this.type === 'sentence') {
        this.vocabListService.removeVocabItem({
          hanzi: this.hanziString,
          isSentence: true,
        });
        this.isVocabItem = false;
        this.vocabItemHasSameFromInput = false;
      } else {
        const vocabItem = this.vocabListService.removeFromInputSentence(
          { hanzi: this.hanziString, isWord: true },
          this.context!
        );
        this.vocabItemHasSameFromInput = false;
        if (vocabItem?.fromInputSentence.length === 0) {
          this.vocabListService.removeVocabItem({
            hanzi: this.hanziString,
            isWord: true,
          });
          this.isVocabItem = false;
        }
      }
    } else if (this.isVocabItem && !this.vocabItemHasSameFromInput) {
      if (this.type === 'sentence') {
        this.vocabItemHasSameFromInput = true;
      } else {
        const item = this.vocabListService.getVocabItem({
          hanzi: this.hanziString,
          isWord: true,
        });
        item?.addFromInputSentence(this.context!);
        item?.markForAnkiExport();
        this.vocabListService.saveVocabItems();
        this.vocabItemHasSameFromInput = true;
      }
    } else {
      if (this.type === 'sentence') {
        await this.vocabListService.createAndFillVocabItem({
          hanzi: this.hanziString,
          isSentence: true,
          markedForAnkiExport: true,
          segmentation: this.customSegmentation
            ? this.customSegmentation.split('.')
            : undefined,
        });
        this.isVocabItem = true;
        this.vocabItemHasSameFromInput = true;
      } else {
        await this.vocabListService.createAndFillVocabItem({
          hanzi: this.hanziString,
          isWord: true,
          fromInputSentence: [this.context!],
          markedForAnkiExport: true,
        });
        this.isVocabItem = true;
        this.vocabItemHasSameFromInput = true;
      }
    }
  }
}
