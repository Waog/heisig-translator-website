import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AudioService } from '../shared/services/audio.service';
import { TranslationService } from '../shared/services/translation.service';

@Component({
  selector: 'app-dictionary-occurrences',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dictionary-occurrences.component.html',
  styleUrls: ['./dictionary-occurrences.component.scss'],
  providers: [AudioService],
})
export class DictionaryOccurrencesComponent implements OnInit {
  @Input() hanziChar: string = '';
  translations$!: Observable<
    {
      hanzi: string;
      pinyin?: string;
      translations: string[];
      usedApi: boolean;
    }[]
  >;

  constructor(
    private translationService: TranslationService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.translations$ = this.translationService
      .getTranslationsContainingCharacter(this.hanziChar)
      .pipe(
        map((translations) =>
          translations.sort((a, b) => a.hanzi.length - b.hanzi.length)
        )
      );
  }

  playAudio(event: Event, text: string, lang: string = 'zh-CN'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }

  cropTranslation(translation: string): string {
    return translation.length > 60
      ? `${translation.slice(0, 60)}...`
      : translation;
  }
}
