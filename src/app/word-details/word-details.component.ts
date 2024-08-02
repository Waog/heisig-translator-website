import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { heisigMapping } from '../shared/heisig-mapping';
import { AudioService } from '../shared/services/audio.service';
import { DictionaryService } from '../shared/services/dictionary.service';
import { PinyinService } from '../shared/services/pinyin.service';
import { TranslationService } from '../shared/services/translation.service';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [CommonModule, TranslationAndAudioContainerComponent],
  templateUrl: './word-details.component.html',
  styleUrls: ['./word-details.component.scss'],
  providers: [AudioService],
})
export class WordDetailsComponent implements OnInit, OnChanges {
  @Input() word: string = '';
  pinyin: string = '';
  heisigDetails: { hanzi: string; heisig: string }[] = [];
  simpleTranslation: string = '';
  onlineTranslation: string = 'Loading...';
  allTranslations: { pinyin: string; english: string[] }[] = [];
  pinyinWithNumbers: string = '';
  displayPinyin: boolean = false;

  constructor(
    private dictionaryService: DictionaryService,
    private translationService: TranslationService,
    private pinyinService: PinyinService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['word']) {
      this.loadDetails();
    }
  }

  private loadDetails(): void {
    this.setPinyin();
    this.setHeisigDetails();
    this.loadTranslations();
    this.loadOnlineTranslation();
    this.audioService.playAudio(this.word, 'zh-CN'); // Play audio when component initializes
  }

  private setPinyin(): void {
    this.pinyin = this.pinyinService
      .convertToPinyin(this.word)
      .map((entry) => entry.pinyin)
      .join(' ');

    this.pinyinWithNumbers = this.pinyinService.convertToPinyinWithNumbers(
      this.word
    );
  }

  private setHeisigDetails(): void {
    this.heisigDetails = Array.from(this.word).map((char) => ({
      hanzi: char,
      heisig: heisigMapping[char] || '??',
    }));
  }

  private loadTranslations(): void {
    this.dictionaryService.isLoaded().subscribe((loaded) => {
      if (loaded) {
        this.simpleTranslation =
          this.dictionaryService.translate(this.word) || '';

        this.allTranslations = this.dictionaryService
          .getAllTranslations(this.word)
          .map((entry) => ({
            pinyin: entry.pinyin,
            english: entry.english.filter((eng) => eng !== 'Not available'),
          }));

        const normalizedWholePinyin = this.normalizeString(
          this.pinyinWithNumbers
        );
        this.displayPinyin = this.allTranslations.some(
          (entry) =>
            this.normalizeString(entry.pinyin) !== normalizedWholePinyin
        );
      }
    });
  }

  private loadOnlineTranslation(): void {
    this.onlineTranslation = 'Loading...';
    this.translationService.translate(this.word, 'zh|en').subscribe(
      (response) => {
        this.onlineTranslation = response.responseData.translatedText;
      },
      (error) => {
        console.error('Translation error:', error);
        this.onlineTranslation = '';
      }
    );
  }

  private normalizeString(str: string): string {
    return str.replace(/\s+/g, '').toLowerCase();
  }

  playAudio(event: Event, text: string, lang: string = 'en-US'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }
}
