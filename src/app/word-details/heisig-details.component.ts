import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { AudioService } from '../shared/services/audio.service';
import { HeisigEntry, HeisigService } from '../shared/services/heisig.service';
import { DictionaryOccurrencesComponent } from './dictionary-occurrences.component';

@Component({
  selector: 'app-heisig-details',
  standalone: true,
  imports: [CommonModule, DictionaryOccurrencesComponent],
  templateUrl: './heisig-details.component.html',
  styleUrls: ['./heisig-details.component.scss'],
  providers: [AudioService],
})
export class HeisigDetailsComponent implements OnInit {
  @Input() hanzi: string = '';
  detail: HeisigEntry | undefined;
  expandedOccurrences: { [key: string]: boolean } = {};
  expandedHeisigDetails: { [key: string]: boolean } = {};
  expandedSubComponents: { [key: string]: boolean } = {};

  constructor(
    private heisigService: HeisigService,
    private audioService: AudioService
  ) {}

  async ngOnInit(): Promise<void> {
    this.detail = await this.heisigService.getHeisigEntry(this.hanzi);
  }

  toggleOccurrencesExpansion(character: string, event: Event): void {
    event.stopPropagation();
    this.expandedOccurrences[character] = !this.expandedOccurrences[character];
  }

  toggleHeisigDetailsExpansion(character: string, event: Event): void {
    event.stopPropagation();
    this.expandedHeisigDetails[character] =
      !this.expandedHeisigDetails[character];
  }

  toggleSubComponentsExpansion(character: string, event: Event): void {
    event.stopPropagation();
    this.expandedSubComponents[character] =
      !this.expandedSubComponents[character];
  }

  isOccurrencesExpanded(character: string): boolean {
    return this.expandedOccurrences[character];
  }

  isHeisigDetailsExpanded(character: string): boolean {
    return this.expandedHeisigDetails[character];
  }

  isSubComponentsExpanded(character: string): boolean {
    return this.expandedSubComponents[character];
  }

  playAudio(event: Event, text: string, lang: string = 'en-US'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }

  isPrimitiveWithImage(): boolean {
    return (this.detail?.isPrimitive && this.detail?.hanziIsFilename) || false;
  }

  getPrimitiveImageFileName(): string | undefined {
    return this.detail?.hanziIsFilename
      ? `assets/primitives/rsh-${this.detail.hanzi}.svg`
      : undefined;
  }
}
