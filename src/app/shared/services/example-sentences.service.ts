import { Injectable } from '@angular/core';
import { HttpPromiseService } from './http-promise.service';
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
  private sentencesData: TatoebaSentence[] = [];

  constructor(
    private httpPromiseService: HttpPromiseService,
    private translationService: TranslationService,
    private pinyinService: PinyinService
  ) {}

  private async loadSentencesData(): Promise<TatoebaSentence[]> {
    if (this.sentencesData.length === 0) {
      this.sentencesData = await this.httpPromiseService.getOnce<
        TatoebaSentence[]
      >('assets/tatoeba.json');
    }
    return this.sentencesData;
  }

  public async getSentencesContainingWord(
    hanziWord: string,
    resultLimit: number = 5,
    maxCharacters: number = 20
  ): Promise<ExampleSentence[]> {
    const data = await this.loadSentencesData();
    const filteredSentences = data
      .filter(
        (sentence) =>
          sentence.text.includes(hanziWord) &&
          sentence.text.length <= maxCharacters
      )
      .slice(0, resultLimit);

    const result: ExampleSentence[] = [];

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
        const translation = await this.translationService.getTranslation(
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
}
