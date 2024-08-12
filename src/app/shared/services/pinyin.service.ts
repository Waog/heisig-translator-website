import { Injectable } from '@angular/core';
import { pinyin } from 'pinyin-pro';

@Injectable({
  providedIn: 'root',
})
export class PinyinService {
  constructor() {}

  toPinyinString(text: string): string {
    return pinyin(text);
  }

  convertToPinyin(text: string): { hanzi: string; pinyin: string }[] {
    return Array.from(text).map((char) => ({
      hanzi: char,
      pinyin: pinyin(char),
    }));
  }

  convertToPinyinWithNumbers(text: string): string {
    return pinyin(text, { toneType: 'num' });
  }
}
