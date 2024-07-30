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
    if (englishArray.length === 0) {
      return undefined;
    }

    const chineseCharacterRegex = /[\u4e00-\u9fff]/;

    // Find the first translation without Chinese characters
    let translation = englishArray.find(
      (entry) => !chineseCharacterRegex.test(entry)
    );

    // If no valid translation was found, fallback to the first entry
    if (!translation) {
      translation = englishArray[0];
    }

    // If there is a semicolon, split and take the first part
    if (translation.includes(';')) {
      translation = translation.split(';')[0];
    }

    // Remove any text within parentheses, braces, or brackets
    translation = translation.replace(/\(.*?\)|\[.*?\]|\{.*?\}/g, '').trim();

    // If the translation starts with "to ", remove it
    if (translation.startsWith('to ')) {
      translation = translation.substring(3).trim();
    }

    return translation;
  }
}
