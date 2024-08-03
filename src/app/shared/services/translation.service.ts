import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { containsChineseCharacters } from '../helper';
import { DictionaryService } from './dictionary.service';
import { HeisigService } from './heisig.service';
import { OnlineTranslationService } from './online-translation.service';

export enum Language {
  EN = 'en',
  DE = 'de',
}

interface Translation {
  hanzi: string;
  pinyin?: string;
  translations: string[];
  usedApi: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(
    private dictionaryService: DictionaryService,
    private heisigService: HeisigService,
    private onlineTranslationService: OnlineTranslationService
  ) {}

  getTranslation(
    chineseString: string,
    language: Language,
    contextSentence?: string
  ): Observable<{ translation: string; usedApi: boolean }> {
    if (!containsChineseCharacters(chineseString)) {
      return of({ translation: chineseString, usedApi: false });
    }

    if (chineseString.length === 1) {
      const heisigTranslation = this.heisigService.getHeisigEn(chineseString);
      if (heisigTranslation) {
        return of({ translation: heisigTranslation, usedApi: false });
      }
    }

    return this.dictionaryService.isLoaded().pipe(
      switchMap((dictionaryLoaded) => {
        if (dictionaryLoaded) {
          const dictionaryTranslation =
            this.dictionaryService.translate(chineseString);
          if (dictionaryTranslation) {
            return of({ translation: dictionaryTranslation, usedApi: false });
          }
        } else {
          return of({ translation: 'Loading dictionary...', usedApi: false });
        }

        return this.onlineTranslationService
          .translate(chineseString, `zh|${language}`)
          .pipe(
            map((onlineTranslation) => ({
              translation: onlineTranslation.responseData.translatedText,
              usedApi: true,
            })),
            catchError((error) => {
              console.error('Online translation error:', error);
              return of({
                translation: 'Translation not found',
                usedApi: true,
              });
            }),
            startWith({ translation: 'Loading...', usedApi: true })
          );
      })
    );
  }

  getAllTranslations(
    chineseString: string,
    language: Language
  ): Observable<Translation[]> {
    const onlineTranslation$ = this.onlineTranslationService
      .translate(chineseString, `zh|${language}`)
      .pipe(
        map((onlineTranslation) => ({
          hanzi: chineseString,
          pinyin: undefined,
          translations: [onlineTranslation.responseData.translatedText],
          usedApi: true,
        })),
        catchError((error) => {
          console.error('Online translation error:', error);
          return of({
            hanzi: chineseString,
            pinyin: undefined,
            translations: ['Translation not found'],
            usedApi: true,
          });
        }),
        startWith({
          hanzi: chineseString,
          pinyin: undefined,
          translations: ['Loading...'],
          usedApi: true,
        })
      );

    return this.dictionaryService.isLoaded().pipe(
      switchMap((dictionaryLoaded) => {
        const translations: Translation[] = [];

        if (dictionaryLoaded) {
          const dictionaryEntries =
            this.dictionaryService.getAllTranslations(chineseString);
          translations.push(
            ...dictionaryEntries.map((entry) => ({
              hanzi: chineseString,
              pinyin: entry.pinyin,
              translations: entry.english,
              usedApi: false,
            }))
          );
        }

        return forkJoin([onlineTranslation$, of(translations)]).pipe(
          map(([onlineTranslation, dictTranslations]) => [
            onlineTranslation,
            ...dictTranslations,
          ])
        );
      })
    );
  }

  getTranslationsContainingCharacter(
    character: string
  ): Observable<Translation[]> {
    return this.dictionaryService.isLoaded().pipe(
      switchMap((dictionaryLoaded) => {
        if (dictionaryLoaded) {
          const entries =
            this.dictionaryService.getTranslationsContainingCharacter(
              character
            );
          return of(
            entries.map((entry) => ({
              hanzi: entry.simplified,
              pinyin: entry.pinyin,
              translations: entry.english,
              usedApi: false,
            }))
          );
        }
        return of([]);
      })
    );
  }

  getHeisigTranslation(chineseCharacter: string): string {
    return this.heisigService.getHeisigEn(chineseCharacter);
  }
}
