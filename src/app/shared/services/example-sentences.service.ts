import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, firstValueFrom } from 'rxjs';
import { PinyinService } from './pinyin.service';
import { Language, TranslationService } from './translation.service';

interface TatoebaSentence {
  text: string;
  translations: {
    lang: string;
    text: string;
  }[];
}

export interface ExampleSentence {
  hanzi: string;
  english: string;
  pinyin: string;
}

@Injectable({
  providedIn: 'root',
})
export class ExampleSentencesService {
  private sentencesDataSubject: BehaviorSubject<TatoebaSentence[]> =
    new BehaviorSubject<TatoebaSentence[]>([]);
  private sentencesData$ = this.sentencesDataSubject.asObservable();

  constructor(
    private http: HttpClient,
    private translationService: TranslationService,
    private pinyinService: PinyinService
  ) {
    this.loadSentencesData();
  }

  private loadSentencesData(): void {
    this.http.get<TatoebaSentence[]>('assets/tatoeba.json').subscribe(
      (data) => {
        this.sentencesDataSubject.next(data);
      },
      (error) => {
        console.error('Failed to load sentences data:', error);
      }
    );
  }

  public async getSentencesContainingWord(
    hanziWord: string,
    resultLimit: number = 5,
    maxCharacters: number = 20
  ): Promise<ExampleSentence[]> {
    const data = await this.getSentenceData();
    const filteredSentences = data
      .filter(
        (sentence) =>
          sentence.text.includes(hanziWord) &&
          sentence.text.length <= maxCharacters
      )
      .slice(0, resultLimit);

    const result = [];

    for (const sentence of filteredSentences) {
      const englishTranslation =
        sentence.translations.find((t) => t.lang === 'eng')?.text || '';
      const pinyin = this.pinyinService.toPinyinString(sentence.text);

      if (englishTranslation) {
        result.push({
          hanzi: sentence.text,
          english: englishTranslation,
          pinyin: pinyin,
        });
      } else {
        const translation = await this.translationService.getTranslationProm(
          sentence.text,
          Language.EN
        );
        result.push({
          hanzi: sentence.text,
          english: translation.translation,
          pinyin: pinyin,
        });
      }
    }

    return result;
  }

  private async getSentenceData(): Promise<TatoebaSentence[]> {
    const currentData = this.sentencesDataSubject.value;
    if (currentData && currentData.length > 0) {
      return currentData;
    }
    return firstValueFrom(
      this.sentencesData$.pipe(filter((data) => data.length > 0))
    );
  }
}
