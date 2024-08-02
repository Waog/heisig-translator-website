import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { DictionaryService } from '../shared/services/dictionary.service';
import { HeisigService } from '../shared/services/heisig.service';
import { PinyinService } from '../shared/services/pinyin.service';
import { OnlineTranslationService } from '../shared/services/online-translation.service';

@Injectable()
export class WordDetailsService {
  constructor(
    private dictionaryService: DictionaryService,
    private translationService: OnlineTranslationService,
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
    return this.dictionaryService.isLoaded().pipe(
      map((loaded) => {
        if (loaded) {
          return this.dictionaryService.translate(word) || '';
        }
        return '';
      })
    );
  }

  getAllTranslations(
    word: string
  ): Observable<{ pinyin: string; english: string[] }[]> {
    return this.dictionaryService.isLoaded().pipe(
      map((loaded) => {
        if (loaded) {
          return this.dictionaryService
            .getAllTranslations(word)
            .map((entry) => ({
              pinyin: entry.pinyin,
              english: entry.english.filter((eng) => eng !== 'Not available'),
            }));
        }
        return [];
      })
    );
  }

  getDisplayPinyin(word: string): Observable<boolean> {
    return this.getAllTranslations(word).pipe(
      map((allTranslations) => {
        const normalizedWholePinyin = this.normalizeString(
          this.getPinyinWithNumbers(word)
        );

        return allTranslations.some(
          (entry) =>
            this.normalizeString(entry.pinyin) !== normalizedWholePinyin
        );
      })
    );
  }

  getOnlineTranslation(word: string): Observable<string> {
    return new Observable((observer) => {
      this.translationService.translate(word, 'zh|en').subscribe(
        (response) => {
          observer.next(response.responseData.translatedText);
          observer.complete();
        },
        (error) => {
          console.error('Translation error:', error);
          observer.next('');
          observer.complete();
        }
      );
    });
  }

  private normalizeString(str: string): string {
    return str.replace(/\s+/g, '').toLowerCase();
  }
}
