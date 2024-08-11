import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { AudioButtonComponent } from '../container-with-buttons/audio-button.component';
import { ContainerWithButtonsComponent } from '../container-with-buttons/container-with-buttons.component';
import { FrequencyComponent } from '../frequency/frequency.component';
import { AudioService } from '../shared/services/audio.service';
import { HeisigDetailsComponent } from './heisig-details.component';
import { WordDetailsService } from './word-details.service';

@Component({
  selector: 'app-word-details',
  standalone: true,
  imports: [
    CommonModule,
    ContainerWithButtonsComponent,
    HeisigDetailsComponent,
    AudioButtonComponent,
    FrequencyComponent, // Add FrequencyComponent here
  ],
  templateUrl: './word-details.component.html',
  styleUrls: ['./word-details.component.scss'],
  providers: [AudioService, WordDetailsService],
})
export class WordDetailsComponent implements OnInit, OnChanges {
  @Input() wordHanzi: string = '';
  pinyin: string = '';
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
    this.simpleTranslation$ = this.companion.getSimpleTranslation(
      this.wordHanzi
    );
    this.allTranslations$ = this.companion.getAllTranslations(this.wordHanzi);
    this.displayPinyin$ = this.companion.getDisplayPinyin(this.wordHanzi);
    this.heisigTTSText = this.companion.getHeisigTTSText(this.wordHanzi);
  }

  playAudio(event: Event, text: string, lang: string = 'en-US'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }
}
