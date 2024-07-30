import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
  private dictionaryLoaded = new BehaviorSubject<boolean>(false);

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

  constructor(private http: HttpClient) {
    this.loadDictionary();
  }

  private loadDictionary(): void {
    this.http
      .get<DictionaryEntry[]>('assets/cedict.json')
      .pipe(
        tap((data) => {
          this.dictionary = data;
          this.dictionaryLoaded.next(true);
        })
      )
      .subscribe();
  }

  isLoaded(): Observable<boolean> {
    return this.dictionaryLoaded.asObservable();
  }

  translate(word: string): string | undefined {
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

    // remove any entries which contain chinese characters
    const chineseCharacterRegex = /[\u4e00-\u9fff]/;
    englishArray = englishArray.filter(
      (entry) => !chineseCharacterRegex.test(entry)
    );

    // remove any empty strings
    englishArray = englishArray.filter((entry) => entry.length > 0);

    // If no valid translation was found, fallback to the first entry
    if (englishArray.length === 0) {
      return undefined;
    }
    return englishArray[0];
  }
}
