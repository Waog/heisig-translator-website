import { Injectable } from '@angular/core';
import { removeBraces } from '../helper';
import { HttpPromiseService } from './http-promise.service';

// Internal interface for the JSON structure
interface HeisigEntryInternal {
  Hanzi: string;
  Keyword: string;
  KeyworddeDEGoogleTranslate: string;
  Traditional: string | null;
  HeisigNumber: number;
  isPrimitive: boolean;
  Hanziisfilename: boolean;
  Story: string;
  StorydeDEGoogleTranslate: string;
  StrokeCount: number;
  Pinyin: string;
  ComponentsFlatHanzi: string;
  ComponentsFlatPinyin: string;
  ComponentsFlatKeywords: string;
}

// Public interface for service consumers
export interface HeisigEntry {
  keyword: string;
  keywordDe: string;
  hanzi: string;
  traditional: string | null;
  heisigNumber: number;
  isPrimitive: boolean;
  hanziIsFilename: boolean;
  story: string;
  storyDe: string;
  strokeCount: number;
  pinyin: string;
  components: HeisigEntry[];
  storyWithMarkedKeywords: string;
  storyWithMarkedKeywordsDe: string;
}

@Injectable({
  providedIn: 'root',
})
export class HeisigService {
  private heisigData: HeisigEntryInternal[] = [];

  constructor(private httpPromiseService: HttpPromiseService) {}

  private async loadHeisigData(): Promise<void> {
    if (this.heisigData.length === 0) {
      try {
        this.heisigData = await this.httpPromiseService.getOnce<
          HeisigEntryInternal[]
        >('assets/heisig.json');
      } catch (error) {
        console.error('Failed to load Heisig data:', error);
      }
    }
  }

  private async mapEntry(entry: HeisigEntryInternal): Promise<HeisigEntry> {
    const components = await this.mapComponents(entry.ComponentsFlatKeywords);
    return {
      keyword: entry.Keyword,
      keywordDe: entry.KeyworddeDEGoogleTranslate,
      hanzi: entry.Hanzi,
      traditional: entry.Traditional,
      heisigNumber: entry.HeisigNumber,
      isPrimitive: entry.isPrimitive,
      hanziIsFilename: entry.Hanziisfilename,
      story: entry.Story,
      storyDe: entry.StorydeDEGoogleTranslate,
      strokeCount: entry.StrokeCount,
      pinyin: entry.Pinyin,
      components: components,
      storyWithMarkedKeywords: this.markKeywordsInStory(entry, components),
      storyWithMarkedKeywordsDe: this.markKeywordsInStoryDe(entry, components),
    };
  }

  private async mapComponents(
    componentsKeywords: string
  ): Promise<HeisigEntry[]> {
    const keywordsArray = componentsKeywords.split('\n').map((k) => k.trim());
    const allComponents = (
      await Promise.all(
        keywordsArray.map((keyword) => this.getHeisigEntryByKeyword(keyword))
      )
    ).filter((entry): entry is HeisigEntry => entry !== undefined);

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

  private markKeywordsInStory(
    entry: HeisigEntryInternal,
    children: HeisigEntry[]
  ): string {
    if (!entry.Story) {
      return entry.Story;
    }

    const selfKeyword = removeBraces(entry.Keyword);
    let result = entry.Story.replace(
      new RegExp(selfKeyword, 'gi'),
      (match) => `«${match}»`
    );

    // note: only marking keywords of the top-level children
    for (const child of children) {
      const keyword = removeBraces(child.keyword);
      result = result.replace(
        new RegExp(keyword, 'gi'),
        (match) => `‹${match}›`
      );
    }

    return result;
  }

  private markKeywordsInStoryDe(
    entry: HeisigEntryInternal,
    children: HeisigEntry[]
  ): string {
    if (!entry.StorydeDEGoogleTranslate) {
      return entry.StorydeDEGoogleTranslate;
    }

    const selfKeyword = removeBraces(entry.KeyworddeDEGoogleTranslate);
    let result = entry.StorydeDEGoogleTranslate.replace(
      new RegExp(selfKeyword, 'gi'),
      (match) => `«${match}»`
    );

    // note: only marking keywords of the top-level children
    for (const child of children) {
      const keyword = removeBraces(child.keywordDe);
      result = result.replace(
        new RegExp(keyword, 'gi'),
        (match) => `‹${match}›`
      );
    }

    return result;
  }

  async getHeisigEn(hanzi: string): Promise<string> {
    await this.loadHeisigData();
    const entry = this.heisigData.find((e) => e.Hanzi === hanzi);
    return entry ? entry.Keyword : hanzi;
  }

  async getHeisigSentenceEn(
    hanziSentence: string,
    replacementForUnknown: string | undefined = undefined,
    delimiter: string = ' '
  ): Promise<string> {
    await this.loadHeisigData();

    const heisigKeywords = await Promise.all(
      hanziSentence.split('').map(async (hanzi) => {
        const keyword = await this.getHeisigEn(hanzi);
        return keyword || replacementForUnknown || hanzi;
      })
    );

    return heisigKeywords.join(delimiter);
  }

  async getHeisigEntry(hanzi: string): Promise<HeisigEntry | undefined> {
    await this.loadHeisigData();
    const entry = this.heisigData.find((e) => e.Hanzi === hanzi);
    return entry ? this.mapEntry(entry) : undefined;
  }

  async getHeisigEntryByKeyword(
    keyword: string
  ): Promise<HeisigEntry | undefined> {
    await this.loadHeisigData();
    const entry = this.heisigData.find((e) => e.Keyword === keyword);
    return entry ? this.mapEntry(entry) : undefined;
  }
}
