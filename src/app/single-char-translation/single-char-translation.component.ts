import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SingleCharacterComponent } from './single-character.component';

@Component({
  selector: 'app-single-char-translation',
  standalone: true,
  imports: [
    CommonModule,
    TranslationAndAudioContainerComponent,
    SingleCharacterComponent,
  ],
  templateUrl: './single-char-translation.component.html',
  styleUrls: ['./single-char-translation.component.scss'],
})
export class SingleCharTranslationComponent implements OnChanges {
  @Input() userInput: string = '';
  hanziSentence: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userInput']) {
      this.hanziSentence = Array.from(this.userInput);
    }
  }
}
