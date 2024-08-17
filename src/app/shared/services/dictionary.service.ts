import { Injectable } from '@angular/core';
import { HttpPromiseService } from './http-promise.service';

interface DictionaryEntry {
  traditional: string;
  simplified: string;
  pinyin: string;
  english: string[];
}

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  private dictionary: DictionaryEntry[] = [];

  // Set of known Chinese punctuation marks and symbols
  private chinesePunctuationMarks = new Set([
    '。',
    '，',
    '：',
    '；',
    '！',
    '？',
    '“',
    '”',
    '‘',
    '’',
    '（',
    '）',
    '《',
    '》',
    '【',
    '】',
    '、',
  ]);

  constructor(private httpPromiseService: HttpPromiseService) {}

  private async loadDictionary(): Promise<void> {
    if (this.dictionary.length === 0) {
      this.dictionary = await this.httpPromiseService.getOnce<
        DictionaryEntry[]
      >('assets/cedict.json');
    }
  }

  public async translate(word: string): Promise<string | undefined> {
    await this.loadDictionary();

    // Check if the word is a Chinese punctuation mark or symbol
    if (this.chinesePunctuationMarks.has(word)) {
      return word;
    }

    const entries: DictionaryEntry[] = this.dictionary.filter(
      (e) => e.simplified === word || e.traditional === word
    );

    // Combine all English translations into a single array
    const allEnglishTranslations = entries.flatMap((e) => e.english);

    return this.shortenTranslation(allEnglishTranslations);
  }

  public async getAllTranslations(word: string): Promise<DictionaryEntry[]> {
    await this.loadDictionary();
    return this.dictionary.filter(
      (e) => e.simplified === word || e.traditional === word
    );
  }

  public async getTranslationsContainingCharacter(
    character: string
  ): Promise<DictionaryEntry[]> {
    await this.loadDictionary();
    return this.dictionary.filter(
      (e) =>
        e.simplified.includes(character) || e.traditional.includes(character)
    );
  }

  private shortenTranslation(englishArray: string[]): string | undefined {
    // Split each English translation by semicolons
    englishArray = englishArray.map((e) => e.split(';')).flat();

    // Remove any text within parentheses, braces, or brackets
    englishArray = englishArray.map((e) =>
      e.replace(/\(.*?\)|\[.*?\]|\{.*?\}/g, '').trim()
    );

    // If the translation starts with "to ", remove it
    englishArray = englishArray.map((e) => e.replace(/^to /g, '').trim());

    // If the translation contains a comma, replace everything after the comma by `...`
    englishArray = englishArray.map((e) =>
      e.includes(`,`) ? e.split(',')[0] + `, ...` : e
    );

    // Remove any entries which contain Chinese characters
    const chineseCharacterRegex = /[\u4e00-\u9fff]/;
    englishArray = englishArray.filter(
      (entry) => !chineseCharacterRegex.test(entry)
    );

    // Remove any empty strings
    englishArray = englishArray.filter((entry) => entry.length > 0);

    // If no valid translation was found, fallback to the first entry
    if (englishArray.length === 0) {
      return undefined;
    }
    return englishArray[0];
  }
}
