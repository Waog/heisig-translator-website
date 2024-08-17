import { Injectable } from '@angular/core';
import { containsChineseCharacters } from '../helper';
import { DictionaryService } from './dictionary.service';
import { HeisigService } from './heisig.service';
import { OnlineTranslationService } from './online-translation.service';

export enum Language {
  EN = 'en',
  DE = 'de',
}

export interface Translation {
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

  async getTranslation(
    chineseString: string,
    language: Language,
    contextSentence?: string
  ): Promise<{ translation: string; usedApi: boolean }> {
    if (!containsChineseCharacters(chineseString)) {
      return { translation: chineseString, usedApi: false };
    }

    if (chineseString.length === 1) {
      const heisigTranslation = await this.heisigService.getHeisigEn(
        chineseString
      );
      if (heisigTranslation) {
        return { translation: heisigTranslation, usedApi: false };
      }
    }

    const dictionaryTranslation = await this.dictionaryService.translate(
      chineseString
    );
    if (dictionaryTranslation) {
      return { translation: dictionaryTranslation, usedApi: false };
    }

    try {
      const onlineTranslation = await this.onlineTranslationService.translate(
        chineseString,
        `zh|${language}`
      );
      return {
        translation: onlineTranslation.responseData.translatedText,
        usedApi: true,
      };
    } catch (error) {
      console.error('Online translation error:', error);
      return { translation: 'Translation not found', usedApi: true };
    }
  }

  async getAllTranslations(
    chineseString: string,
    language: Language
  ): Promise<Translation[]> {
    const translations: Translation[] = [];

    const dictionaryEntries = await this.dictionaryService.getAllTranslations(
      chineseString
    );
    if (dictionaryEntries.length > 0) {
      translations.push(
        ...dictionaryEntries.map((entry) => ({
          hanzi: chineseString,
          pinyin: entry.pinyin,
          translations: entry.english,
          usedApi: false,
        }))
      );
    }

    try {
      const onlineTranslation = await this.onlineTranslationService.translate(
        chineseString,
        `zh|${language}`
      );
      translations.push({
        hanzi: chineseString,
        pinyin: undefined,
        translations: [onlineTranslation.responseData.translatedText],
        usedApi: true,
      });
    } catch (error) {
      console.error('Online translation error:', error);
      translations.push({
        hanzi: chineseString,
        pinyin: undefined,
        translations: ['Translation not found'],
        usedApi: true,
      });
    }

    return translations;
  }

  async getTranslationsContainingCharacter(
    character: string
  ): Promise<Translation[]> {
    const entries =
      await this.dictionaryService.getTranslationsContainingCharacter(
        character
      );
    return entries.map((entry) => ({
      hanzi: entry.simplified,
      pinyin: entry.pinyin,
      translations: entry.english,
      usedApi: false,
    }));
  }
}
