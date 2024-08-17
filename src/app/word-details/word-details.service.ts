import { Injectable } from '@angular/core';
import { smoothenHeisig } from '../shared/helper';
import { HeisigService } from '../shared/services/heisig.service';
import { PinyinService } from '../shared/services/pinyin.service';
import {
  Language,
  Translation,
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

  async getHeisigTTSText(word: string): Promise<string> {
    const sentence = await this.heisigService.getHeisigSentenceEn(
      word,
      'unknown'
    );
    return smoothenHeisig(sentence);
  }

  async getSimpleTranslation(word: string): Promise<string> {
    const translationResult = await this.translationService.getTranslation(
      word,
      Language.EN
    );
    return translationResult.translation;
  }

  async getAllTranslations(word: string): Promise<Translation[]> {
    return this.translationService.getAllTranslations(word, Language.EN);
  }

  async getDisplayPinyin(word: string): Promise<boolean> {
    const allTranslations = await this.getAllTranslations(word);
    const normalizedWholePinyin = this.normalizeString(
      this.getPinyinWithNumbers(word)
    );

    return allTranslations.some(
      (entry) =>
        entry.pinyin &&
        this.normalizeString(entry.pinyin) !== normalizedWholePinyin
    );
  }

  private normalizeString(str: string): string {
    return str.replace(/\s+/g, '').toLowerCase();
  }
}
