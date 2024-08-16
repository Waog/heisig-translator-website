import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { GuessModeToggleOptions } from '../shared/guess-mode-toggle-options.enum';
import { smoothenHeisig } from '../shared/helper';
import { AudioService } from '../shared/services/audio.service';
import { FrequencyService } from '../shared/services/frequency.service';
import { HeisigService } from '../shared/services/heisig.service';
import {
  Language,
  TranslationService,
} from '../shared/services/translation.service';
import { SingleCharacterComponent } from './single-character.component';
import { SoundToggleOptions } from './sound-toggle-options.enum';

@Component({
  selector: 'app-single-word',
  standalone: true,
  imports: [CommonModule, SingleCharacterComponent],
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.scss'],
  providers: [AudioService],
})
export class SingleWordComponent implements OnChanges, OnInit {
  @Input() hanziWord: string = '';
  @Input() isSelected: boolean = false;
  @Input() toggleOption: SoundToggleOptions = SoundToggleOptions.Chinese;
  @Input() guessMode: GuessModeToggleOptions = GuessModeToggleOptions.Show;
  @Input() showWordFrequency: boolean = true;

  @Output() wordClicked: EventEmitter<string> = new EventEmitter<string>();

  hanziCharacters: string[] = [];
  public translation: string = '';
  isApiTranslation: boolean = false;
  public GuessModeToggleOptions = GuessModeToggleOptions;
  private revealed: boolean = false; // Track the revealed state
  frequencyCategory: number | null = null;

  constructor(
    private translationService: TranslationService,
    private heisigService: HeisigService,
    private audioService: AudioService,
    private frequencyService: FrequencyService
  ) {}

  ngOnInit(): void {
    this.heisigService.isLoaded().subscribe((loaded) => {
      if (loaded) {
        this.translateWord();
      }
    });
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['hanziWord']) {
      this.hanziCharacters = Array.from(this.hanziWord);
      this.translateWord();
      if (this.showWordFrequency) {
        this.frequencyCategory =
          await this.frequencyService.getFrequencyCategory(this.hanziWord);
      } else {
        this.frequencyCategory = null;
      }
    }

    if (changes['showWordFrequency']) {
      if (this.showWordFrequency) {
        this.frequencyCategory =
          await this.frequencyService.getFrequencyCategory(this.hanziWord);
      } else {
        this.frequencyCategory = null;
      }
    }

    if (changes['guessMode']) {
      this.revealed = this.guessMode === GuessModeToggleOptions.Show;
    }
  }

  translateWord(): void {
    this.translationService
      .getTranslation(this.hanziWord, Language.EN)
      .subscribe((translationResult) => {
        this.translation = smoothenHeisig(translationResult.translation);
        this.isApiTranslation = translationResult.usedApi;
      });
  }

  onWordClick(): void {
    if (!this.revealed) {
      this.revealed = true;
    }
    this.wordClicked.emit(this.hanziWord);

    switch (this.toggleOption) {
      case SoundToggleOptions.Off:
        break;
      case SoundToggleOptions.Word:
        this.audioService.playAudio(this.translation, 'en-US');
        break;
      case SoundToggleOptions.Chinese:
        this.audioService.playAudio(this.hanziWord, 'zh-CN');
        break;
      case SoundToggleOptions.Heisig:
        const heisigSentence = smoothenHeisig(
          this.heisigService.getHeisigSentenceEn(this.hanziWord)
        );
        this.audioService.playAudio(heisigSentence, 'en-US');
        break;
      default:
        break;
    }
  }

  isHidden(): boolean {
    return this.guessMode === GuessModeToggleOptions.Hide && !this.revealed;
  }
}
