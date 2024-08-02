import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DictionaryService } from '../shared/services/dictionary.service';
import { HeisigService } from '../shared/services/heisig.service';
import { OnlineTranslationService } from '../shared/services/online-translation.service';
import { SingleCharacterComponent } from './single-character.component';

@Component({
  selector: 'app-single-word',
  standalone: true,
  imports: [CommonModule, SingleCharacterComponent, HttpClientModule],
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.scss'],
  providers: [OnlineTranslationService],
})
export class SingleWordComponent implements OnChanges {
  @Input() hanziWord: string = '';
  @Input() isSelected: boolean = false;
  @Output() wordClicked: EventEmitter<string> = new EventEmitter<string>();
  hanziCharacters: string[] = [];
  translation: string = '';
  isApiTranslation: boolean = false;

  constructor(
    private dictionaryService: DictionaryService,
    private translationService: OnlineTranslationService,
    private heisigService: HeisigService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanziWord']) {
      this.hanziCharacters = Array.from(this.hanziWord);
      this.translateWord();
    }
  }

  translateWord(): void {
    if (!this.containsChineseCharacters(this.hanziWord)) {
      this.translation = this.hanziWord;
      this.isApiTranslation = false;
      return;
    }

    if (this.hanziWord.length === 1) {
      const heisigTranslation = this.heisigService.getHeisigEn(this.hanziWord);
      if (heisigTranslation) {
        this.translation = heisigTranslation;
        this.isApiTranslation = false;
        return;
      }
    }

    this.dictionaryService.isLoaded().subscribe((loaded) => {
      if (loaded) {
        const localTranslation = this.dictionaryService.translate(
          this.hanziWord
        );
        if (localTranslation) {
          this.translation = localTranslation;
          this.isApiTranslation = false;
        } else {
          this.translationService.translate(this.hanziWord, 'zh|en').subscribe(
            (response) => {
              this.translation = response.responseData.translatedText;
              this.isApiTranslation = true;
            },
            (error) => {
              console.error('Translation error:', error);
              this.translation = 'Translation not found';
              this.isApiTranslation = false;
            }
          );
        }
      }
    });
  }

  containsChineseCharacters(text: string): boolean {
    const chineseCharacterRegex = /[\u4e00-\u9fff]/;
    return chineseCharacterRegex.test(text);
  }

  onWordClick(event: Event): void {
    event.stopPropagation();
    this.wordClicked.emit(this.hanziWord);
  }
}
