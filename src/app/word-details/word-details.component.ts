import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { AudioService } from '../shared/services/audio.service';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { WordDetailsService } from './word-details.service';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [CommonModule, TranslationAndAudioContainerComponent],
  templateUrl: './word-details.component.html',
  styleUrls: ['./word-details.component.scss'],
  providers: [AudioService, WordDetailsService],
})
export class WordDetailsComponent implements OnInit, OnChanges {
  @Input() wordHanzi: string = '';
  pinyin: string = '';
  heisigDetails: { hanzi: string; heisig: string }[] = [];
  heisigTTSText: string = '';
  simpleTranslation$!: Observable<string>;
  allTranslations$!: Observable<
    {
      hanzi: string;
      pinyin?: string;
      translations: string[];
      usedApi: boolean;
    }[]
  >;
  displayPinyin$!: Observable<boolean>;
  translationsContainingCharacter: {
    [key: string]: Observable<
      {
        hanzi: string;
        pinyin?: string;
        translations: string[];
        usedApi: boolean;
      }[]
    >;
  } = {};
  expandedCharacters: { [key: string]: boolean } = {};

  constructor(
    private companion: WordDetailsService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wordHanzi']) {
      this.loadDetails();
    }
  }

  private loadDetails(): void {
    this.pinyin = this.companion.getPinyin(this.wordHanzi);
    this.heisigDetails = this.companion.getHeisigDetails(this.wordHanzi);
    this.simpleTranslation$ = this.companion.getSimpleTranslation(
      this.wordHanzi
    );
    this.allTranslations$ = this.companion.getAllTranslations(this.wordHanzi);
    this.displayPinyin$ = this.companion.getDisplayPinyin(this.wordHanzi);

    this.heisigDetails.forEach((detail) => {
      this.translationsContainingCharacter[detail.hanzi] =
        this.companion.getTranslationsContainingCharacter(detail.hanzi);
    });
    this.heisigTTSText = this.companion.getHeisigTTSText(this.wordHanzi);
  }

  toggleExpansion(character: string): void {
    this.expandedCharacters[character] = !this.expandedCharacters[character];
  }

  isExpanded(character: string): boolean {
    return this.expandedCharacters[character];
  }

  playAudio(event: Event, text: string, lang: string = 'en-US'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }

  cropTranslation(translation: string): string {
    return translation.length > 60
      ? `${translation.slice(0, 60)}...`
      : translation;
  }
}
