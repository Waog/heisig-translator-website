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
import { GuessModeToggleOptions } from '../shared/guess-mode-toggle-options.enum'; // Import the new enum
import { SingleWordComponent } from './single-word.component';
import { SoundToggleOptions } from './sound-toggle-options.enum'; // Import the renamed enum

// @ts-ignore
import { Segment, useDefault } from 'segmentit';
import { smoothenHeisig } from '../shared/helper';
import { HeisigService } from '../shared/services/heisig.service';

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
  ],
  templateUrl: './segmentation.component.html',
  styleUrls: ['./segmentation.component.scss'],
})
export class SegmentationComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() userInput: string = '';
  @Input() selectedWord: string = '';
  @Output() wordSelected: EventEmitter<string> = new EventEmitter<string>();
  hanziWords: string[] = [];
  wordsTTS: string = '';
  heisigTTS: string = '';
  selectedSoundToggleOption: SoundToggleOptions = SoundToggleOptions.Off;
  selectedGuessModeToggleOption: GuessModeToggleOptions =
    GuessModeToggleOptions.Show;

  private static readonly SOUND_TOGGLE_STORAGE_KEY = 'playWordAudioOption';
  private static readonly GUESS_MODE_TOGGLE_STORAGE_KEY =
    'segmentationGuessModeOption';

  public SoundToggleOptions = SoundToggleOptions;
  public GuessModeToggleOptions = GuessModeToggleOptions;

  @ViewChildren(SingleWordComponent)
  singleWordComponents!: QueryList<SingleWordComponent>;

  constructor(private heisigService: HeisigService) {}

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userInput']) {
      if (this.userInput.length > 0) {
        const segmentit = useDefault(new Segment());
        const result = segmentit.doSegment(this.userInput);
        this.hanziWords = result.map((segment: { w: string }) => segment.w);
      } else {
        this.hanziWords = [];
      }
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

  updateTTS(): void {
    this.wordsTTS = smoothenHeisig(
      this.singleWordComponents
        .map((component) => component.translation)
        .join(' ')
    );
    this.heisigTTS = smoothenHeisig(
      this.heisigService.getHeisigSentenceEn(this.userInput)
    );
    if (this.wordsTTS.match(/Loading.*.../)) {
      setTimeout(() => this.updateTTS(), 1000);
    }
  }

  onSoundToggleOptionChange(option: string): void {
    if (
      Object.values(SoundToggleOptions).includes(option as SoundToggleOptions)
    ) {
      this.selectedSoundToggleOption = option as SoundToggleOptions;
      localStorage.setItem(
        SegmentationComponent.SOUND_TOGGLE_STORAGE_KEY,
        option
      );
    }
  }

  onGuessModeToggleOptionChange(option: string): void {
    if (
      Object.values(GuessModeToggleOptions).includes(
        option as GuessModeToggleOptions
      )
    ) {
      this.selectedGuessModeToggleOption = option as GuessModeToggleOptions;
      localStorage.setItem(
        SegmentationComponent.GUESS_MODE_TOGGLE_STORAGE_KEY,
        option
      );

      // Emit an empty string when the guess mode is set to Hide
      if (this.selectedGuessModeToggleOption === GuessModeToggleOptions.Hide) {
        this.wordSelected.emit('');
      }
    }
  }
}
