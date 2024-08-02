import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { TranslationService } from '../shared/services/translation.service';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';

@Component({
  selector: 'app-sentence-translation',
  standalone: true,
  imports: [CommonModule, TranslationAndAudioContainerComponent],
  templateUrl: './sentence-translation.component.html',
  styleUrls: ['./sentence-translation.component.scss'],
})
export class SentenceTranslationComponent implements OnChanges {
  @Input() userInput: string = '';
  @Input() targetLang: string = ''; // 'de-DE' oder 'en-US'

  translation: string = '';
  isLoading: boolean = false;
  debounceInProgress: boolean = false;
  private inputSubject: Subject<string> = new Subject();

  constructor(private translationService: TranslationService) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe((input: string) => {
      if (input && input.trim().length > 0) {
        this.debounceInProgress = false;
        this.translateText(input);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['userInput'] &&
      changes['userInput'].currentValue !== changes['userInput'].previousValue
    ) {
      this.debounceInProgress = true;
      this.inputSubject.next(changes['userInput'].currentValue);
    }
  }

  translateText(input: string): void {
    this.isLoading = true;
    const langPair = this.targetLang === 'de-DE' ? 'zh|de' : 'zh|en';

    this.translationService.translate(input, langPair).subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.responseData) {
          this.translation = response.responseData.translatedText;
        } else {
          this.translation = 'Translation error';
        }
      },
      (error: any) => {
        this.isLoading = false;
        this.translation = 'Translation error';
      }
    );
  }
}
