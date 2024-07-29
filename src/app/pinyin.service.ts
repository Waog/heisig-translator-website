// src/app/pinyin.service.ts

import { Injectable } from '@angular/core';
import { pinyin } from 'pinyin-pro';

@Injectable({
  providedIn: 'root',
})
export class PinyinService {
  constructor() {}

  convertToPinyin(text: string): { char: string; pinyin: string }[] {
    return Array.from(text).map((char) => ({
      char: char,
      pinyin: pinyin(char),
    }));
  }
}
