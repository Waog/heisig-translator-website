import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { AudioButtonComponent } from '../container-with-buttons/audio-button.component';
import { ContainerWithButtonsComponent } from '../container-with-buttons/container-with-buttons.component';
import { OnlineTranslationService } from '../shared/services/online-translation.service';

@Component({
  selector: 'app-sentence-translation',
  standalone: true,
  imports: [
    CommonModule,
    ContainerWithButtonsComponent,
    AudioButtonComponent,
  ],
  templateUrl: './sentence-translation.component.html',
  styleUrls: ['./sentence-translation.component.scss'],
})
export class SentenceTranslationComponent implements OnChanges {
  @Input() userInput: string = '';
  @Input() targetLang: string = '';

  translation: string = '';
  isLoading: boolean = false;
  debounceInProgress: boolean = false;
  private inputSubject: Subject<string> = new Subject();

  constructor(private translationService: OnlineTranslationService) {
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
