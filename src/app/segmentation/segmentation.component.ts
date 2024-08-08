import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { AudioButtonComponent } from '../translation-and-audio-container/audio-button.component';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SingleWordComponent } from './single-word.component';

// @ts-ignore
import { Segment, useDefault } from 'segmentit';
import { smoothenHeisig } from '../shared/helper';
import { HeisigService } from '../shared/services/heisig.service';

@Component({
  selector: 'app-segmentation',
  standalone: true,
  imports: [
    CommonModule,
    TranslationAndAudioContainerComponent,
    SingleWordComponent,
    AudioButtonComponent,
  ],
  templateUrl: './segmentation.component.html',
  styleUrls: ['./segmentation.component.scss'],
})
export class SegmentationComponent implements OnChanges, AfterViewInit {
  @Input() userInput: string = '';
  @Input() selectedWord: string = '';
  @Output() wordSelected: EventEmitter<string> = new EventEmitter<string>();
  hanziWords: string[] = [];
  wordsTTS: string = '';
  heisigTTS: string = '';

  @ViewChildren(SingleWordComponent)
  singleWordComponents!: QueryList<SingleWordComponent>;

  constructor(private heisigService: HeisigService) {}

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
}
