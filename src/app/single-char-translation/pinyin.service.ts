import { Injectable } from '@angular/core';
import { pinyin } from 'pinyin-pro';

@Injectable({
  providedIn: 'root',
})
export class PinyinService {
  constructor() {}

  convertToPinyin(text: string): { hanzi: string; pinyin: string }[] {
    return Array.from(text).map((char) => ({
      hanzi: char,
      pinyin: pinyin(char),
    }));
  }
}
