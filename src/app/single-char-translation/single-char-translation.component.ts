import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SingleWordComponent } from './single-word.component';

// @ts-ignore
import { Segment, useDefault } from 'segmentit';

@Component({
  selector: 'app-single-char-translation',
  standalone: true,
  imports: [
    CommonModule,
    TranslationAndAudioContainerComponent,
    SingleWordComponent,
  ],
  templateUrl: './single-char-translation.component.html',
  styleUrls: ['./single-char-translation.component.scss'],
})
export class SingleCharTranslationComponent implements OnChanges {
  @Input() userInput: string = '';
  hanziWords: string[] = [];

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
}
