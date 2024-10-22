import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioButtonComponent } from '../container-with-buttons/audio-button.component';
import { ContainerWithButtonsComponent } from '../container-with-buttons/container-with-buttons.component';
import { ToggleButtonComponent } from '../container-with-buttons/toggle-button.component';
import { GuessModeToggleOptions } from '../shared/guess-mode-toggle-options.enum';
import { smoothenHeisig } from '../shared/helper';
import { HeisigService } from '../shared/services/heisig.service';
import { SegmentationService } from '../shared/services/segmentation.service';
import { CustomSegmentationComponent } from './custom-segmentation.component';
import { SingleWordComponent } from './single-word.component';
import { SoundToggleOptions } from './sound-toggle-options.enum';

@Component({
  selector: 'app-segmentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContainerWithButtonsComponent,
    SingleWordComponent,
    AudioButtonComponent,
    ToggleButtonComponent,
    CustomSegmentationComponent,
  ],
  templateUrl: './segmentation.component.html',
  styleUrls: ['./segmentation.component.scss'],
})
export class SegmentationComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() userInput: string = '';
  @Input() selectedWord: string = '';
  @Output() wordSelected: EventEmitter<string> = new EventEmitter<string>();
  @Input() customSegmentation: string = '';
  @Output() customSegmentationChange: EventEmitter<string> =
    new EventEmitter<string>();

  hanziWords: string[] = [];
  wordsTTS: string = '';
  heisigTTS: string = '';
  selectedSoundToggleOption: SoundToggleOptions = SoundToggleOptions.Off;
  selectedGuessModeToggleOption: GuessModeToggleOptions =
    GuessModeToggleOptions.Show;
  showWordFrequency: string = 'Hiding Frequency';

  private static readonly SOUND_TOGGLE_STORAGE_KEY = 'playWordAudioOption';
  private static readonly GUESS_MODE_TOGGLE_STORAGE_KEY =
    'segmentationGuessModeOption';
  private static readonly SHOW_WORD_FREQUENCY_STORAGE_KEY =
    'showWordFrequencyOption';

  public SoundToggleOptions = SoundToggleOptions;
  public GuessModeToggleOptions = GuessModeToggleOptions;

  @ViewChildren(SingleWordComponent)
  singleWordComponents!: QueryList<SingleWordComponent>;

  constructor(
    private heisigService: HeisigService,
    private segmentationService: SegmentationService
  ) {}

  ngOnInit(): void {
    const savedSoundOption = localStorage.getItem(
      SegmentationComponent.SOUND_TOGGLE_STORAGE_KEY
    );
    if (
      savedSoundOption &&
      Object.values(SoundToggleOptions).includes(
        savedSoundOption as SoundToggleOptions
      )
    ) {
      this.selectedSoundToggleOption = savedSoundOption as SoundToggleOptions;
    }

    const savedGuessModeOption = localStorage.getItem(
      SegmentationComponent.GUESS_MODE_TOGGLE_STORAGE_KEY
    );
    if (
      savedGuessModeOption &&
      Object.values(GuessModeToggleOptions).includes(
        savedGuessModeOption as GuessModeToggleOptions
      )
    ) {
      this.selectedGuessModeToggleOption =
        savedGuessModeOption as GuessModeToggleOptions;
    }

    const savedShowWordFrequencyOption = localStorage.getItem(
      SegmentationComponent.SHOW_WORD_FREQUENCY_STORAGE_KEY
    );
    if (
      savedShowWordFrequencyOption &&
      ['Hiding Frequency', 'Showing Frequency'].includes(
        savedShowWordFrequencyOption
      )
    ) {
      this.showWordFrequency = savedShowWordFrequencyOption;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userInput']) {
      if (this.userInput.length > 0) {
        this.hanziWords = this.segmentationService.toHanziWords(this.userInput);
        this.customSegmentation = this.hanziWords.join('.');
      } else {
        this.hanziWords = [];
      }
    }
  }

  onCustomSegmentationChange(): void {
    if (this.customSegmentation.length > 0) {
      this.hanziWords = this.customSegmentation.split('.');
      this.customSegmentationChange.emit(this.customSegmentation);
    }
  }

  ngAfterViewInit() {
    this.singleWordComponents.changes.subscribe(() => {
      setTimeout(() => this.updateTTS(), 1000);
    });

    setTimeout(() => this.updateTTS(), 1000);
  }

  onWordClick(word: string): void {
    this.wordSelected.emit(word);
  }

  async updateTTS(): Promise<void> {
    this.wordsTTS = smoothenHeisig(
      this.singleWordComponents
        .map((component) => component.translation)
        .join(' ')
    );
    this.heisigTTS = smoothenHeisig(
      await this.heisigService.getHeisigSentenceEn(this.userInput)
    );
    if (this.wordsTTS.match(/Loading.*.../)) {
      setTimeout(() => this.updateTTS(), 1000);
    }
  }

  onSoundToggleOptionChange(): void {
    localStorage.setItem(
      SegmentationComponent.SOUND_TOGGLE_STORAGE_KEY,
      this.selectedSoundToggleOption
    );
  }

  onGuessModeToggleOptionChange(): void {
    localStorage.setItem(
      SegmentationComponent.GUESS_MODE_TOGGLE_STORAGE_KEY,
      this.selectedGuessModeToggleOption
    );

    // Emit an empty string when the guess mode is set to Hide
    if (this.selectedGuessModeToggleOption === GuessModeToggleOptions.Hide) {
      this.wordSelected.emit('');
    }
  }

  onShowWordFrequencyToggleOptionChange(): void {
    localStorage.setItem(
      SegmentationComponent.SHOW_WORD_FREQUENCY_STORAGE_KEY,
      this.showWordFrequency
    );
  }
}
