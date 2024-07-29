import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { mapping } from '../mapping';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { PinyinService } from './pinyin.service';

@Component({
  selector: 'app-single-char-translation',
  standalone: true,
  imports: [CommonModule, TranslationAndAudioContainerComponent],
  templateUrl: './single-char-translation.component.html',
  styleUrls: ['./single-char-translation.component.scss'],
})
export class SingleCharTranslationComponent implements OnChanges {
  @Input() userInput: string = '';
  pinyinTranslation: { char: string; pinyin: string }[] = [];
  mapping = mapping;

  constructor(private pinyinService: PinyinService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['userInput'] &&
      changes['userInput'].currentValue !== changes['userInput'].previousValue
    ) {
      this.convertToPinyin(changes['userInput'].currentValue);
    }
  }

  convertToPinyin(input: string): void {
    this.pinyinTranslation = this.pinyinService.convertToPinyin(input);
  }
}
