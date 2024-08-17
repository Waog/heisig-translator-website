import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AudioService } from '../shared/services/audio.service';
import {
  Translation,
  TranslationService,
} from '../shared/services/translation.service';

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
  translations: Translation[] = [];

  constructor(
    private translationService: TranslationService,
    private audioService: AudioService
  ) {}

  async ngOnInit(): Promise<void> {
    const translations =
      await this.translationService.getTranslationsContainingCharacter(
        this.hanziChar
      );
    this.translations = translations.sort(
      (a, b) => a.hanzi.length - b.hanzi.length
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
