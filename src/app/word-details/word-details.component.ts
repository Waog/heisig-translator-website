import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Router } from '@angular/router';
import { AudioButtonComponent } from '../container-with-buttons/audio-button.component';
import { ContainerWithButtonsComponent } from '../container-with-buttons/container-with-buttons.component';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';
import { FrequencyComponent } from '../frequency/frequency.component';
import { AudioService } from '../shared/services/audio.service';
import {
  ExampleSentence,
  ExampleSentencesService,
} from '../shared/services/example-sentences.service';
import { Translation } from '../shared/services/translation.service';
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
    FrequencyComponent,
    FavoriteButtonComponent,
  ],
  templateUrl: './word-details.component.html',
  styleUrls: ['./word-details.component.scss'],
  providers: [AudioService, WordDetailsService],
})
export class WordDetailsComponent implements OnInit, OnChanges {
  @Input() wordHanzi: string = '';
  @Input() context: string = '';
  pinyin: string = '';
  heisigTTSText: string = '';
  simpleTranslation: string = '';
  allTranslations: Translation[] = [];
  displayPinyin: boolean = false;
  exampleSentences!: Promise<ExampleSentence[]>;

  constructor(
    private companion: WordDetailsService,
    private audioService: AudioService,
    private router: Router,
    private exampleSentencesService: ExampleSentencesService
  ) {}

  ngOnInit(): void {
    this.loadDetails();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['wordHanzi']) {
      this.loadDetails();
    }
  }

  private async loadDetails(): Promise<void> {
    this.pinyin = this.companion.getPinyin(this.wordHanzi);
    this.simpleTranslation = await this.companion.getSimpleTranslation(
      this.wordHanzi
    );
    this.allTranslations = await this.companion.getAllTranslations(
      this.wordHanzi
    );
    this.displayPinyin = await this.companion.getDisplayPinyin(this.wordHanzi);
    this.heisigTTSText = await this.companion.getHeisigTTSText(this.wordHanzi);

    this.exampleSentences =
      this.exampleSentencesService.getSentencesContainingWord(this.wordHanzi);
  }

  playAudio(event: Event, text: string, lang: string = 'en-US'): void {
    event.stopPropagation();
    this.audioService.playAudio(text, lang);
  }

  navigateToTranslator(hanzi: string = this.wordHanzi): void {
    this.router.navigate(['/translator'], {
      queryParams: { input: hanzi },
    });
  }

  navigateToVocabItem(hanzi: string = this.wordHanzi): void {
    this.router.navigate(['/vocabulary'], {
      queryParams: { searchFilter: this.wordHanzi },
    });
  }
}
