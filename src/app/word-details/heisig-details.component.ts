import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AudioService } from '../shared/services/audio.service';
import { HeisigEntry, HeisigService } from '../shared/services/heisig.service';
import { DictionaryOccurrencesComponent } from './dictionary-occurrences.component';
import { WordDetailsService } from './word-details.service';

@Component({
  selector: 'app-heisig-details',
  standalone: true,
  imports: [CommonModule, DictionaryOccurrencesComponent],
  templateUrl: './heisig-details.component.html',
  styleUrls: ['./heisig-details.component.scss'],
  providers: [AudioService, WordDetailsService],
})
export class HeisigDetailsComponent implements OnInit {
  @Input() hanzi: string = '';
  detail: HeisigEntry | undefined;
  expandedOccurrences: { [key: string]: boolean } = {};
  expandedHeisigDetails: { [key: string]: boolean } = {};

  constructor(
    private heisigService: HeisigService,
    private audioService: AudioService,
    public companion: WordDetailsService
  ) {}

  ngOnInit(): void {
    this.detail = this.heisigService.getHeisigEntry(this.hanzi);
  }

  toggleOccurrencesExpansion(character: string, event: Event): void {
    event.stopPropagation();
    if (this.expandedOccurrences[character]) {
      this.expandedOccurrences[character] = false;
    } else {
      this.expandedOccurrences = { [character]: true };
      this.expandedHeisigDetails = {};
    }
  }

  toggleHeisigDetailsExpansion(character: string, event: Event): void {
    event.stopPropagation();
    if (this.expandedHeisigDetails[character]) {
      this.expandedHeisigDetails[character] = false;
    } else {
      this.expandedHeisigDetails = { [character]: true };
      this.expandedOccurrences = {};
    }
  }

  isOccurrencesExpanded(character: string): boolean {
    return this.expandedOccurrences[character];
  }

  isHeisigDetailsExpanded(character: string): boolean {
    return this.expandedHeisigDetails[character];
  }

  playAudio(event: Event, text: string, lang: string = 'en-US'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }

  isPrimitiveWithImage(): boolean {
    return this.detail?.hanzi.startsWith('p.<img src="') || false;
  }

  getPrimitiveImageFileName(): string | undefined {
    return `assets/primitives/${this.detail?.hanzi
      .replace('p.<img src="', '')
      .replace('.jpg">', '')
      .replace('.jpg"/>', '')}.svg`;
  }
}
