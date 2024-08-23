import { v4 as uuidv4 } from 'uuid';
import { AnkiCard } from './anki-card';
import { ExampleSentence } from './example-sentences.service';
import { Language } from './translation.service';
import { VocabServiceCollectionService } from './vocab-service-collection.service';

export type VocabItemInitializer = {
  hanzi: string;
} & Partial<VocabItem>;

export interface OtherVariants {
  hanzi: string[];
  english: string[];
  pinyin: string[];
}

export class VocabItem {
  uuid: string;
  ankiGuid?: string;
  ankiIndex?: number;
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
  allTranslations: string[] = [];
  examples: ExampleSentence[] = [];
  itemCreationDate: Date;
  lastChange?: Date;
  lastUpdateFromAnki?: Date;
  importedFromAnki: boolean = false;
  exportedToAnki: boolean = false;
  markedForAnkiExport: boolean = false;

  get segmentIn(): string[] {
    return this.services.vocabListService
      .getAllVocabItems()
      .filter(
        (vocabItem: VocabItem) =>
          vocabItem.hanzi.includes(this.hanzi) && vocabItem.hanzi !== this.hanzi
      )
      .map((vocabItem: VocabItem) => vocabItem.hanzi);
  }

  get isSentence(): boolean {
    return this.segmentation.length > 1;
  }

  get isWord(): boolean {
    return this.segmentation.length <= 1;
  }

  get otherVariants(): OtherVariants {
    const result: OtherVariants = { hanzi: [], english: [], pinyin: [] };
    for (const vocabItem of this.services.vocabListService.getAllVocabItems()) {
      if (vocabItem.uuid === this.uuid) {
        continue;
      }
      if (vocabItem.hanzi === this.hanzi) {
        result.hanzi.push(vocabItem.uuid);
      }
      if (
        this.english &&
        vocabItem.english &&
        vocabItem.english === this.english
      ) {
        result.english.push(vocabItem.uuid);
      }
      if (
        this.pinyin &&
        vocabItem.pinyin &&
        vocabItem.pinyin.replace(' ', '') === this.pinyin.replace(' ', '')
      ) {
        result.pinyin.push(vocabItem.uuid);
      }
    }
    return result;
  }

  constructor(
    init: VocabItemInitializer,
    private services: VocabServiceCollectionService
  ) {
    this.hanzi = init.hanzi;
    Object.assign(this, init);
    this.segmentation = [...(init.segmentation || [])];
    this.allTranslations = [...(init.allTranslations || [])];
    this.examples = [...(init.examples || [])];
    this.uuid ||= uuidv4();
    this.itemCreationDate = init.itemCreationDate
      ? new Date(init.itemCreationDate)
      : new Date();
    this.lastUpdateFromAnki = init.lastUpdateFromAnki
      ? new Date(init.lastUpdateFromAnki)
      : undefined;
    this.lastChange = init.lastChange ? new Date(init.lastChange) : new Date();
    this.cleanup();
  }

  private cleanup() {
    this.hanzi = this.hanzi.replace(' ', '').trim();
    this.english = this.english?.trim();
    this.pinyin = this.pinyin?.toLocaleLowerCase().trim();
    this.notes = this.removeAutoNotes(this.notes || '');
  }

  public static ankiHanziToVocabHanzi(hanzi: string): string {
    return VocabItem.removeAsideTags(hanzi).replaceAll(' ', '')?.trim();
  }

  private static removeAsideTags(input: string): string {
    return input.replace(/<aside>[\s\S]*?<\/aside>/g, '').trim();
  }

  update(updatedItem: VocabItem): void {
    Object.assign(this, updatedItem);
    this.updateLastChange();
  }

  addTranslation(translation: string): void {
    this.allTranslations.push(translation);
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
      (!partial.uuid || this.uuid === partial.uuid) &&
      (!partial.ankiGuid || this.ankiGuid === partial.ankiGuid) &&
      (!partial.ankiIndex || this.ankiIndex === partial.ankiIndex) &&
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
    this.uuid ||= uuidv4();
    this.english ||= await this.getTranslation(this.hanzi, Language.EN);
    this.pinyin ||= this.services.pinyinService.toPinyinString(this.hanzi);
    this.sound ||= ''; // TODO: Implement sound fetching
    this.overrideTTS ||= ''; // TODO: Implement sound fetching
    this.heisigKeywords ||=
      await this.services.heisigService.getHeisigSentenceEn(
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

    this.notes ||= '';

    this.updateLastChange();
  }

  private async getTranslation(hanzi: string, lang: Language): Promise<string> {
    const translationResult =
      await this.services.translationService.getTranslation(hanzi, lang);
    return translationResult.translation;
  }

  private async addAutoFillAllTranslations() {
    const translations =
      await this.services.translationService.getAllTranslations(
        this.hanzi,
        Language.EN
      );

    for (const translation of translations) {
      for (const t of translation.translations) {
        if (!this.allTranslations.includes(t)) {
          this.addTranslation(t);
        }
      }
    }
  }

  private async getAutoFillNotes(): Promise<string> {
    let result = '\n<!-- begin auto-notes -->\n';

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
    }

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

    if (this.segmentIn.length > 0) {
      result += '<!-- begin segmentIn -->\n';
      result += '<h2>Occurs in other cards:</h2>\n';
      result += '<ul>\n';
      for (const segmentIn of this.segmentIn) {
        result += `  <li>${await this.toNoteEntry(segmentIn)}</li>\n`;
      }
      result += '</ul>\n';
      result += '<!-- end segmentIn -->\n';
      result += '\n';
    }

    result += '<!-- end auto-notes -->\n';

    return result;
  }

  async toNoteEntry(hanziSentence: string): Promise<string> {
    return `${hanziSentence} <i>(${this.services.pinyinService.toPinyinString(
      hanziSentence
    )})</i> ${await this.getTranslation(hanziSentence, Language.EN)}`;
  }

  async toAnkiCard(): Promise<AnkiCard> {
    return {
      guid: this.ankiGuid,
      index: this.ankiIndex,
      hanzi: this.hanzi + this.getVariantsAside('hanzi'),
      english: this.english
        ? this.english + this.getVariantsAside('english')
        : '',
      pinyin: this.pinyin ? this.pinyin + this.getVariantsAside('pinyin') : '',
      sound: this.sound ? this.sound + this.getVariantsAside('pinyin') : '',
      overrideTTS: this.overrideTTS ?? '',
      heisigKeywords: this.heisigKeywords ?? '',
      image: this.image ?? '',
      skill: this.skill ?? '',
      lesson: this.lesson ?? '',
      notes: this.notes + (await this.getAutoFillNotes()),
    };
  }

  isCausingChange(card: AnkiCard): boolean {
    if (this.ankiGuid && this.ankiGuid !== card.guid) {
      // NOTE: changing GUID is a problem. setting it initially is fine
      return true;
    }
    const cloneCard = this.clone().updateFromAnkiCard(card);
    // NOTE: which are solely determined by anki card don't count as changes
    cloneCard.ankiGuid = this.ankiGuid;
    cloneCard.ankiIndex = this.ankiIndex;
    cloneCard.lastUpdateFromAnki = this.lastUpdateFromAnki;
    cloneCard.lastChange = this.lastChange;
    cloneCard.importedFromAnki = this.importedFromAnki;
    return !cloneCard.equals(this);
  }

  updateFromAnkiCard(card: AnkiCard): VocabItem {
    this.ankiGuid = card.guid?.trim();
    this.ankiIndex = card.index;
    this.hanzi = VocabItem.ankiHanziToVocabHanzi(card.hanzi);
    this.english = VocabItem.removeAsideTags(card.english);
    this.pinyin = VocabItem.removeAsideTags(this.removeToneMarkup(card.pinyin));
    this.sound = VocabItem.removeAsideTags(card.sound);
    this.overrideTTS = card.overrideTTS?.trim();
    this.heisigKeywords = card.heisigKeywords?.trim();
    this.image = card.image?.trim();
    this.skill = card.skill?.trim();
    this.lesson = card.lesson?.trim();
    this.notes = this.removeAutoNotes(card.notes);
    this.importedFromAnki = true;
    this.cleanup();
    this.lastUpdateFromAnki = new Date();
    this.updateLastChange();
    return this;
  }

  removeAutoNotes(notes: string): string {
    return notes
      .replace(
        /<!--\s*begin\s*(?<tag>\w+)\s*-->([\s\S]*?)<!--\s*end\s*\k<tag>\s*-->/g,
        ''
      )
      .trim();
  }

  removeToneMarkup(pinyin: string): string {
    // Remove all HTML comments
    let result = pinyin.replace(/<!--[\s\S]*?-->/g, '');

    // Remove all spans with classes that start with "tone" and keep their content
    result = result.replace(/<span class="tone\d+">(.*?)<\/span>/g, '$1');

    // Trim any extra whitespace
    result = result.trim();

    return result;
  }

  getVariantsAside(property: 'hanzi' | 'english' | 'pinyin'): string {
    if (this.otherVariants[property].length === 0) {
      return '';
    }
    const allVariants: VocabItem[] = [
      this,
      ...this.otherVariants[property].map(
        (uuid) => this.services.vocabListService.getVocabItem({ uuid })!
      ),
    ];
    const orderedVariants = allVariants.sort((a, b) => {
      const diffAnkiIndex =
        ((a.ankiIndex as number) + 1 || Number.MAX_SAFE_INTEGER) -
        ((b.ankiIndex as number) + 1 || Number.MAX_SAFE_INTEGER);
      const diffCreationDate =
        a.itemCreationDate.getTime() - b.itemCreationDate.getTime();
      const diffUuid = a.uuid.localeCompare(b.uuid);
      return diffAnkiIndex || diffCreationDate || diffUuid;
    });
    const variantIndex = orderedVariants.indexOf(this);
    return `\n<aside>(${variantIndex + 1}/${orderedVariants.length})</aside>`;
  }

  toSerializable(): VocabItem {
    return {
      ...this,
      itemCreationDate: this.itemCreationDate.toISOString(),
      lastChange: this.lastChange?.toISOString(),
      lastUpdateFromAnki: this.lastUpdateFromAnki?.toISOString(),
      services: undefined,
    };
  }

  clone(): VocabItem {
    return new VocabItem(this, this.services);
  }

  equals(other: VocabItem): boolean {
    return (
      JSON.stringify(this.toSerializable()) ===
      JSON.stringify(other.toSerializable())
    );
  }
}
