// src/app/pinyin.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { PinyinService } from './pinyin.service';

describe('PinyinService', () => {
  let service: PinyinService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PinyinService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should convert text to pinyin', () => {
    const result = service.convertToPinyin('你好');
    expect(result).toEqual([
      { char: '你', pinyin: 'nǐ' },
      { char: '好', pinyin: 'hǎo' },
    ]);
  });
});
