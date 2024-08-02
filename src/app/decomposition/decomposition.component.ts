import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SingleWordComponent } from './single-word.component';

// @ts-ignore
import { Segment, useDefault } from 'segmentit';

@Component({
  selector: 'app-decomposition',
  standalone: true,
  imports: [
    CommonModule,
    TranslationAndAudioContainerComponent,
    SingleWordComponent,
  ],
  templateUrl: './decomposition.component.html',
  styleUrls: ['./decomposition.component.scss'],
})
export class DecompositionComponent implements OnChanges {
  @Input() userInput: string = '';
  @Input() selectedWord: string = '';
  @Output() wordSelected: EventEmitter<string> = new EventEmitter<string>();
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

  onWordClick(word: string): void {
    this.wordSelected.emit(word);
  }
}
