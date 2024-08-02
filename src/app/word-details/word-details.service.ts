import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { HeisigService } from '../shared/services/heisig.service';
import { PinyinService } from '../shared/services/pinyin.service';
import {
  Language,
  TranslationService,
} from '../shared/services/translation.service';

@Injectable()
export class WordDetailsService {
  constructor(
    private translationService: TranslationService,
    private pinyinService: PinyinService,
    private heisigService: HeisigService
  ) {}

  getPinyin(word: string): string {
    return this.pinyinService
      .convertToPinyin(word)
      .map((entry) => entry.pinyin)
      .join(' ');
  }

  getPinyinWithNumbers(word: string): string {
    return this.pinyinService.convertToPinyinWithNumbers(word);
  }

  getHeisigDetails(word: string): { hanzi: string; heisig: string }[] {
    return Array.from(word).map((char) => ({
      hanzi: char,
      heisig: this.heisigService.getHeisigEn(char) || '??',
    }));
  }

  getSimpleTranslation(word: string): Observable<string> {
    return this.translationService
      .getTranslation(word, Language.EN)
      .pipe(map((translationResult) => translationResult.translation));
  }

  getAllTranslations(word: string): Observable<
    {
      pinyin?: string;
      translations: string[];
      usedApi: boolean;
    }[]
  > {
    return this.translationService.getAllTranslations(word, Language.EN);
  }

  getDisplayPinyin(word: string): Observable<boolean> {
    return this.getAllTranslations(word).pipe(
      map((allTranslations) => {
        const normalizedWholePinyin = this.normalizeString(
          this.getPinyinWithNumbers(word)
        );

        return allTranslations.some(
          (entry) =>
            entry.pinyin &&
            this.normalizeString(entry.pinyin) !== normalizedWholePinyin
        );
      })
    );
  }

  private normalizeString(str: string): string {
    return str.replace(/\s+/g, '').toLowerCase();
  }
}
