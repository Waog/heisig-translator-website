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
  mapping = mapping;
  pinyinTranslation: { hanzi: string; pinyin: string }[] = [];

  constructor(private pinyinService: PinyinService) {}

  ngOnChanges({ userInput }: SimpleChanges): void {
    if (userInput && userInput.currentValue !== userInput.previousValue) {
      this.pinyinTranslation = this.pinyinService.convertToPinyin(
        userInput.currentValue
      );
    }
  }
}
