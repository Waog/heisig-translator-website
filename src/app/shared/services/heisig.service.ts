import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Internal interface for the JSON structure
interface HeisigEntryInternal {
  Keyword: string;
  KeyworddeDEGoogleTranslate: string;
  Hanzi: string;
  Traditional: string | null;
  HeisigNumber: number;
  HeisigSequence: number;
  Story: string;
  StorydeDEGoogleTranslate: string;
  StrokeCount: number;
  Pinyin: string;
  ComponentsHanzi: string;
  ComponentsPinyin: string;
  ComponentsKeywords: string;
  ComponentsKeywordsdeDE: string;
}

// Public interface for service consumers
export interface HeisigEntry {
  keyword: string;
  keywordDe: string;
  hanzi: string;
  traditional: string | null;
  heisigNumber: number;
  heisigSequence: number;
  story: string;
  storyDe: string;
  strokeCount: number;
  pinyin: string;
  componentsHanzi: string;
  componentsPinyin: string;
  componentsKeywords: string;
  componentsKeywordsDe: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeisigService {
  private heisigData: HeisigEntryInternal[] = [];
  private heisigLoaded = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadHeisigData();
  }

  private loadHeisigData(): void {
    this.http
      .get<HeisigEntryInternal[]>('assets/heisig.json')
      .pipe(
        tap((data) => {
          this.heisigData = data;
          this.heisigLoaded.next(true);
        })
      )
      .subscribe();
  }

  isLoaded(): Observable<boolean> {
    return this.heisigLoaded.asObservable();
  }

  getHeisigEn(hanzi: string): string {
    const entry = this.heisigData.find((e) => e.Hanzi === hanzi);
    return entry ? entry.Keyword : hanzi;
  }

  getHeisigSentenceEn(
    hanziSentence: string,
    replacementForUnknown: string | undefined = undefined
  ): string {
    return hanziSentence
      .split('')
      .map((hanzi) => this.getHeisigEn(hanzi) || replacementForUnknown || hanzi)
      .join(' ');
  }

  getHeisigEntry(hanzi: string): HeisigEntry | undefined {
    const entry = this.heisigData.find((e) => e.Hanzi === hanzi);
    if (entry) {
      return {
        keyword: entry.Keyword,
        keywordDe: entry.KeyworddeDEGoogleTranslate,
        hanzi: entry.Hanzi,
        traditional: entry.Traditional,
        heisigNumber: entry.HeisigNumber,
        heisigSequence: entry.HeisigSequence,
        story: entry.Story,
        storyDe: entry.StorydeDEGoogleTranslate,
        strokeCount: entry.StrokeCount,
        pinyin: entry.Pinyin,
        componentsHanzi: entry.ComponentsHanzi,
        componentsPinyin: entry.ComponentsPinyin,
        componentsKeywords: entry.ComponentsKeywords,
        componentsKeywordsDe: entry.ComponentsKeywordsdeDE,
      };
    }
    return undefined;
  }
}
