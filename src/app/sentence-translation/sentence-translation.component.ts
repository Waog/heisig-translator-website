import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { AudioButtonComponent } from '../container-with-buttons/audio-button.component';
import { ContainerWithButtonsComponent } from '../container-with-buttons/container-with-buttons.component';
import { ToggleButtonComponent } from '../container-with-buttons/toggle-button.component';
import { GuessModeToggleOptions } from '../shared/guess-mode-toggle-options.enum';
import { OnlineTranslationService } from '../shared/services/online-translation.service';

@Component({
  selector: 'app-sentence-translation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContainerWithButtonsComponent,
    AudioButtonComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './sentence-translation.component.html',
  styleUrls: ['./sentence-translation.component.scss'],
})
export class SentenceTranslationComponent implements OnChanges, OnInit {
  @Input() userInput: string = '';
  @Input() targetLang: string = '';

  translation: string = '';
  isLoading: boolean = false;
  debounceInProgress: boolean = false;
  isRevealed: boolean = false; // Variable to track if translation is revealed
  private inputSubject: Subject<string> = new Subject();

  selectedGuessModeToggleOption: GuessModeToggleOptions =
    GuessModeToggleOptions.Show;

  private getGuessModeToggleStorageKey(): string {
    return `sentenceGuessModeOption_${this.targetLang}`;
  }

  public GuessModeToggleOptions = GuessModeToggleOptions;

  constructor(private translationService: OnlineTranslationService) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe((input: string) => {
      if (input && input.trim().length > 0) {
        this.debounceInProgress = false;
        this.translateText(input);
      }
    });
  }

  ngOnInit(): void {
    const savedGuessModeOption = localStorage.getItem(
      this.getGuessModeToggleStorageKey()
    );
    if (
      savedGuessModeOption &&
      Object.values(GuessModeToggleOptions).includes(
        savedGuessModeOption as GuessModeToggleOptions
      )
    ) {
      this.selectedGuessModeToggleOption =
        savedGuessModeOption as GuessModeToggleOptions;
    } else {
      localStorage.setItem(
        this.getGuessModeToggleStorageKey(),
        this.selectedGuessModeToggleOption
      );
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['userInput'] &&
      changes['userInput'].currentValue !== changes['userInput'].previousValue
    ) {
      this.debounceInProgress = true;
      this.isRevealed = false; // Reset reveal state when input changes
      this.inputSubject.next(changes['userInput'].currentValue);
    }
  }

  onGuessModeToggleOptionChange(option: string): void {
    if (
      Object.values(GuessModeToggleOptions).includes(
        option as GuessModeToggleOptions
      )
    ) {
      this.selectedGuessModeToggleOption = option as GuessModeToggleOptions;
      localStorage.setItem(this.getGuessModeToggleStorageKey(), option);

      // Reset the reveal state when guess mode is changed
      this.isRevealed = false;
    }
  }

  async translateText(input: string): Promise<void> {
    this.isLoading = true;
    const langPair = this.targetLang === 'de-DE' ? 'zh|de' : 'zh|en';

    try {
      const response = await this.translationService.translate(input, langPair);
      this.translation =
        response.responseData.translatedText || 'Translation error';
    } catch (error) {
      console.error('Translation error:', error);
      this.translation = 'Translation error';
    } finally {
      this.isLoading = false;
    }
  }

  revealTranslation(): void {
    this.isRevealed = true; // Set the translation as revealed when clicked
  }
}
