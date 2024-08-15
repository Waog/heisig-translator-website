import { filter, firstValueFrom, map } from 'rxjs';
import { AnkiCard } from './anki-export.service';
import { ExampleSentence } from './example-sentences.service';
import { Language } from './translation.service';
import { VocabServiceCollectionService } from './vocab-service-collection.service';

export type VocabItemInitializer = {
  hanzi: string;
} & Partial<VocabItem>;

export class VocabItem {
  hanzi: string;
  english?: string;
  pinyin?: string;
  sound?: string;
  overrideTTS?: string;
  heisigKeywords?: string;
  image?: string;
  skill?: string;
  lesson?: string;
  notes?: string;
  segmentation: string[] = [];
  fromInputSentence: string[] = [];
  allTranslations: string[] = [];
  examples: ExampleSentence[] = [];
  lastChange?: Date;
  importedFromAnki: boolean = false;
  exportedToAnki: boolean = false;
  markedForAnkiExport: boolean = false;
  isSentence: boolean = false;
  isWord: boolean = false;

  constructor(
    init: VocabItemInitializer,
    private services: VocabServiceCollectionService
  ) {
    this.hanzi = init.hanzi;
    Object.assign(this, init);
    this.segmentation = [...(init.segmentation || [])];
    this.fromInputSentence = [...(init.fromInputSentence || [])];
    this.allTranslations = [...(init.allTranslations || [])];
    this.examples = [...(init.examples || [])];
  }

  update(updatedItem: VocabItem): void {
    Object.assign(this, updatedItem);
    this.updateLastChange();
  }

  addTranslation(translation: string): void {
    this.allTranslations.push(translation);
    this.updateLastChange();
  }

  addFromInputSentence(sentence: string): void {
    this.fromInputSentence.push(sentence);
    this.updateLastChange();
  }

  markForAnkiExport(): void {
    this.markedForAnkiExport = true;
    this.updateLastChange();
  }

  unmarkForAnkiExport(): void {
    this.markedForAnkiExport = false;
    this.updateLastChange();
  }

  updateLastChange(): void {
    this.lastChange = new Date();
  }

  matches(partial: Partial<VocabItem>): boolean {
    const isSubset = (subset: string[], set: string[]) =>
      subset.every((value) => set.includes(value));

    const isExampleSubset = (
      subset: ExampleSentence[],
      set: ExampleSentence[]
    ) => subset.every((value) => set.includes(value));

    return (
      (!partial.hanzi || this.hanzi === partial.hanzi) &&
      (!partial.english || this.english === partial.english) &&
      (!partial.pinyin || this.pinyin === partial.pinyin) &&
      (!partial.sound || this.sound === partial.sound) &&
      (!partial.overrideTTS || this.overrideTTS === partial.overrideTTS) &&
      (!partial.heisigKeywords ||
        this.heisigKeywords === partial.heisigKeywords) &&
      (!partial.image || this.image === partial.image) &&
      (!partial.skill || this.skill === partial.skill) &&
      (!partial.lesson || this.lesson === partial.lesson) &&
      (!partial.notes || this.notes === partial.notes) &&
      (!partial.importedFromAnki ||
        this.importedFromAnki === partial.importedFromAnki) &&
      (!partial.exportedToAnki ||
        this.exportedToAnki === partial.exportedToAnki) &&
      (!partial.markedForAnkiExport ||
        this.markedForAnkiExport === partial.markedForAnkiExport) &&
      (!partial.segmentation ||
        isSubset(partial.segmentation, this.segmentation)) &&
      (!partial.fromInputSentence ||
        isSubset(partial.fromInputSentence, this.fromInputSentence)) &&
      (!partial.allTranslations ||
        isSubset(partial.allTranslations, this.allTranslations)) &&
      (!partial.examples || isExampleSubset(partial.examples, this.examples)) &&
      (partial.importedFromAnki == undefined ||
        this.importedFromAnki === partial.importedFromAnki) &&
      (partial.exportedToAnki == undefined ||
        this.exportedToAnki === partial.exportedToAnki) &&
      (partial.markedForAnkiExport == undefined ||
        this.markedForAnkiExport === partial.markedForAnkiExport) &&
      (partial.isSentence == undefined ||
        this.isSentence === partial.isSentence) &&
      (partial.isWord == undefined || this.isWord === partial.isWord)
    );
  }

  async autoFillEmptyFields(): Promise<void> {
    this.english ||= await this.getTranslation(this.hanzi, Language.EN);
    this.pinyin ||= this.services.pinyinService.toPinyinString(this.hanzi);
    this.sound ||= ''; // TODO: Implement sound fetching
    this.heisigKeywords ||= this.services.heisigService.getHeisigSentenceEn(
      this.hanzi,
      undefined,
      ', '
    );
    this.image ||= ''; // TODO: Implement image fetching;
    this.skill ||= 'Waog-Heisig';
    this.lesson ||= '';

    this.segmentation =
      this.segmentation.length > 0
        ? this.segmentation
        : this.services.segmentationService.toHanziWords(this.hanzi);

    await this.addAutoFillAllTranslations();

    this.examples =
      this.examples.length > 0
        ? this.examples
        : await this.services.exampleSentencesService.getSentencesContainingWord(
            this.hanzi
          );

    this.notes ||= await this.getAutoFillNotes();

    this.updateLastChange();
  }

  private async getTranslation(hanzi: string, lang: Language): Promise<string> {
    return firstValueFrom(
      this.services.translationService.getTranslation(hanzi, lang).pipe(
        map((translationResult) => translationResult.translation),
        filter((translation) => translation !== 'Loading...')
      )
    );
  }

  private async addAutoFillAllTranslations() {
    const translations = await firstValueFrom(
      this.services.translationService
        .getAllTranslations(this.hanzi, Language.EN)
        .pipe(
          filter(
            (translationResult) =>
              translationResult[0]?.translations[0] !== 'Loading...'
          ),
          map((translationResult) =>
            translationResult.map((t) => t.translations)
          ),
          map((translationStringArrayArray) =>
            translationStringArrayArray.flat()
          )
        )
    );
    for (const translation of translations) {
      if (!this.allTranslations.includes(translation)) {
        this.addTranslation(translation);
      }
    }
  }

  private async getAutoFillNotes(): Promise<string> {
    if (this.isSentence) {
      return await this.getAutoFillSentenceNotes();
    } else if (this.isWord) {
      return await this.getAutoFillWordNotes();
    }
    return 'Neither Word nor Sentence! What is this?';
  }

  private async getAutoFillSentenceNotes(): Promise<string> {
    let result = '';

    const segmentedWords =
      this.segmentation.length > 0
        ? this.segmentation
        : this.services.segmentationService.toHanziWords(this.hanzi);
    if (segmentedWords.length > 1) {
      result += '<!-- begin segments -->\n';
      result += '<h2>Segments:</h2>\n';
      result += '<ul>\n';
      for (const word of segmentedWords) {
        result += `  <li>${await this.toNoteEntry(word)}</li>\n`;
      }
      result += '</ul>\n';
      result += '<!-- end segments -->\n';
      result += '\n';
    } else {
      result += this.getAutoFillWordNotes();
    }

    return result;
  }

  private async getAutoFillWordNotes(): Promise<string> {
    let result = '';

    if (this.allTranslations.length > 0) {
      result += '<!-- begin translations -->\n';
      result += '<h2>Translations:</h2>\n';
      result += '<ul>\n';
      for (const translation of this.allTranslations) {
        result += `  <li>${translation}</li>\n`;
      }
      result += '</ul>\n';
      result += '<!-- end translations -->\n';
      result += '\n';
    }

    if (this.examples.length > 0) {
      result += '<!-- begin examples -->\n';
      result += '<h2>Examples:</h2>\n';
      result += '<ul>\n';
      for (const example of this.examples) {
        result += `  <li>${example.hanzi} <i>(${example.pinyin})</i> ${example.english}</li>\n`;
      }
      result += '</ul>\n';
      result += '<!-- end examples -->\n';
      result += '\n';
    }

    if (this.fromInputSentence.length > 0) {
      result += '<!-- begin fromInputSentence -->\n';
      result += '<h2>First found in:</h2>\n';
      result += '<ul>\n';
      for (const fromInputSentence of this.fromInputSentence) {
        result += `  <li>${await this.toNoteEntry(fromInputSentence)}</li>\n`;
      }
      result += '</ul>\n';
      result += '<!-- end fromInputSentence -->\n';
      result += '\n';
    }

    return result;
  }

  async toNoteEntry(hanziSentence: string): Promise<string> {
    return `${hanziSentence} <i>(${this.services.pinyinService.toPinyinString(
      hanziSentence
    )})</i> ${await this.getTranslation(hanziSentence, Language.EN)}`;
  }

  toAnkiCard(): AnkiCard {
    return {
      hanzi: this.hanzi,
      english: this.english ?? '',
      pinyin: this.pinyin ?? '',
      sound: this.sound ?? '',
      overrideTTS: this.overrideTTS ?? '',
      heisigKeywords: this.heisigKeywords ?? '',
      image: this.image ?? '',
      skill: this.skill ?? '',
      lesson: this.lesson ?? '',
      notes: this.notes ?? '',
    };
  }

  toSerializable(): VocabItem {
    return { ...this, services: undefined };
  }
}
