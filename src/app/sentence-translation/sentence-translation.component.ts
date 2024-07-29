import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { PlayAudioComponent } from '../play-audio/play-audio.component';
import { TranslationService } from './translation.service';

@Component({
  selector: 'app-sentence-translation',
  standalone: true,
  imports: [CommonModule, PlayAudioComponent],
  templateUrl: './sentence-translation.component.html',
  styleUrls: ['./sentence-translation.component.scss'],
})
export class SentenceTranslationComponent implements OnChanges {
  @Input() userInput: string = '';
  @Input() targetLang: string = ''; // 'de-DE' oder 'en-US'

  translation: string = '';
  isLoading: boolean = false;
  private inputSubject: Subject<string> = new Subject();

  constructor(private translationService: TranslationService) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe((input: any) => {
      this.translateText(input);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['userInput'] &&
      changes['userInput'].currentValue !== changes['userInput'].previousValue
    ) {
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
      (error) => {
        this.isLoading = false;
        this.translation = 'Translation error';
      }
    );
  }
}
