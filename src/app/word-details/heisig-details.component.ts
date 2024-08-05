import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioService } from '../shared/services/audio.service';
import { WordDetailsService } from './word-details.service';

@Component({
  selector: 'app-heisig-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heisig-details.component.html',
  styleUrls: ['./heisig-details.component.scss'],
  providers: [AudioService, WordDetailsService],
})
export class HeisigDetailsComponent {
  @Input() heisigDetails: { hanzi: string; heisig: string }[] = [];
  @Input() translationsContainingCharacter: {
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
    private audioService: AudioService,
    private companion: WordDetailsService
  ) {}

  toggleExpansion(character: string, event: Event): void {
    event.stopPropagation();
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
