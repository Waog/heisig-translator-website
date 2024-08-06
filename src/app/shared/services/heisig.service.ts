import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject } from 'rxjs';
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
  ComponentsFlatHanzi: string;
  ComponentsFlatPinyin: string;
  ComponentsFlatKeywords: string;
  ComponentsFlatKeywordsdeDE: string;
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
  components: HeisigEntry[];
}

@Injectable({
  providedIn: 'root',
})
export class HeisigService {
  private heisigData: HeisigEntryInternal[] = [];
  private heisigLoaded = new ReplaySubject<boolean>(1);

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

  private mapEntry(entry: HeisigEntryInternal): HeisigEntry {
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
      components: this.mapComponents(entry.ComponentsFlatKeywords),
    };
  }

  private mapComponents(componentsKeywords: string): HeisigEntry[] {
    const keywordsArray = componentsKeywords.split('\n').map((k) => k.trim());
    const allComponents = keywordsArray
      .map((keyword) => this.getHeisigEntryByKeyword(keyword))
      .filter((entry): entry is HeisigEntry => entry !== undefined);

    const uniqueComponents = this.filterUniqueComponents(allComponents);
    return uniqueComponents;
  }

  private filterUniqueComponents(components: HeisigEntry[]): HeisigEntry[] {
    const childKeywords = new Set<string>();

    const gatherChildKeywords = (entry: HeisigEntry) => {
      entry.components.forEach((child) => {
        if (!childKeywords.has(child.keyword)) {
          childKeywords.add(child.keyword);
          gatherChildKeywords(child);
        }
      });
    };

    components.forEach((component) => gatherChildKeywords(component));
    return components.filter(
      (component) => !childKeywords.has(component.keyword)
    );
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
    return entry ? this.mapEntry(entry) : undefined;
  }

  getHeisigEntryByKeyword(keyword: string): HeisigEntry | undefined {
    const entry = this.heisigData.find((e) => e.Keyword === keyword);
    return entry ? this.mapEntry(entry) : undefined;
  }
}
