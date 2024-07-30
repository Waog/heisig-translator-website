import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { pinyin } from 'pinyin-pro';
import { mapping } from '../mapping';

@Component({
  selector: 'app-single-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-character.component.html',
  styleUrls: ['./single-character.component.scss'],
})
export class SingleCharacterComponent implements OnChanges {
  @Input() hanzi: string = '';
  pinyin: string = '';
  heisig: string = '';
  isChinese: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanzi']) {
      this.pinyin = pinyin(this.hanzi);
      this.heisig = mapping[this.hanzi] || this.hanzi;
      this.isChinese = this.isChineseCharacter(this.hanzi);
    }
  }

  isChineseCharacter(char: string): boolean {
    const chineseCharacterRegex = /[\u4e00-\u9fff]/;
    return chineseCharacterRegex.test(char);
  }
}