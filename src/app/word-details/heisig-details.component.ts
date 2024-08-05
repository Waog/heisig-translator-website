import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { AudioService } from '../shared/services/audio.service';
import { HeisigEntry, HeisigService } from '../shared/services/heisig.service';
import { WordDetailsService } from './word-details.service';

@Component({
  selector: 'app-heisig-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './heisig-details.component.html',
  styleUrls: ['./heisig-details.component.scss'],
  providers: [AudioService, WordDetailsService],
})
export class HeisigDetailsComponent implements OnInit {
  @Input() hanzi: string = '';
  detail: HeisigEntry | undefined;
  expandedCharacters: { [key: string]: boolean } = {};
  expandedDetails: { [key: string]: boolean } = {};

  constructor(
    private heisigService: HeisigService,
    private audioService: AudioService,
    public companion: WordDetailsService
  ) {}

  ngOnInit(): void {
    this.detail = this.heisigService.getHeisigEntry(this.hanzi);
  }

  toggleExpansion(character: string, event: Event): void {
    event.stopPropagation();
    this.expandedCharacters[character] = !this.expandedCharacters[character];
  }

  toggleDetails(character: string, event: Event): void {
    event.stopPropagation();
    this.expandedDetails[character] = !this.expandedDetails[character];
  }

  isExpanded(character: string): boolean {
    return this.expandedCharacters[character];
  }

  isDetailsExpanded(character: string): boolean {
    return this.expandedDetails[character];
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

  getTranslationsContainingCharacter(character: string): Observable<
    {
      hanzi: string;
      pinyin?: string;
      translations: string[];
      usedApi: boolean;
    }[]
  > {
    return this.companion.getTranslationsContainingCharacter(character);
  }
}