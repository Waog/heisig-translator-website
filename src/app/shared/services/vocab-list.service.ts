import { Injectable } from '@angular/core';
import { VocabItem, VocabItemInitializer } from './vocab-item';
import { VocabServiceCollectionService } from './vocab-service-collection.service';

@Injectable({
  providedIn: 'root',
})
export class VocabListService {
  private storageKey = 'vocabList_v1';
  private vocabItems: VocabItem[] = [];

  constructor(
    private vocabServiceCollectionService: VocabServiceCollectionService
  ) {
    this.loadVocabItems();
  }

  private loadVocabItems(): void {
    const storedItems = localStorage.getItem(this.storageKey);
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      this.vocabItems = parsedItems.map(
        (item: VocabItemInitializer & { lastChange?: string }) =>
          new VocabItem(
            {
              ...item,
              lastChange: item.lastChange
                ? new Date(item.lastChange)
                : undefined,
            },
            this.vocabServiceCollectionService
          )
      );
    }
  }

  saveVocabItems(): void {
    const itemsToStore = this.vocabItems.map((item) => ({
      ...item.toSerializable(),
      lastChange: item.lastChange?.toISOString(),
    }));
    localStorage.setItem(this.storageKey, JSON.stringify(itemsToStore));
  }

  async createAndFillVocabItem(
    partialInformation: VocabItemInitializer
  ): Promise<VocabItem> {
    const vocabItem = new VocabItem(
      partialInformation,
      this.vocabServiceCollectionService
    );
    await vocabItem.autoFillEmptyFields();

    this.vocabItems.push(vocabItem);
    this.saveVocabItems();
    return vocabItem;
  }

  addVocabItem(vocabItem: VocabItem): void {
    this.vocabItems.push(vocabItem);
    this.saveVocabItems();
  }

  updateVocabItem(originalItem: VocabItem, updatedItem: VocabItem): void {
    const index = this.vocabItems.indexOf(originalItem);
    if (index !== -1) {
      this.vocabItems[index].update(updatedItem);
      this.saveVocabItems();
    }
  }

  getAllVocabItems(): VocabItem[] {
    return this.vocabItems;
  }

  isVocabItem(item: Partial<VocabItem>): boolean {
    return this.vocabItems.some((vocabItem) => vocabItem.matches(item));
  }

  getVocabItem(item: Partial<VocabItem>): VocabItem | undefined {
    return this.vocabItems.find((vocabItem) => vocabItem.matches(item));
  }

  getVocabItems(filterItem: Partial<VocabItem>): VocabItem[] {
    return this.vocabItems.filter((vocabItem) => vocabItem.matches(filterItem));
  }

  removeVocabItem(item: Partial<VocabItem>): void {
    this.vocabItems = this.vocabItems.filter(
      (vocabItem) => !vocabItem.matches(item)
    );
    this.saveVocabItems();
  }

  removeFromInputSentence(
    item: Partial<VocabItem>,
    fromSentence: string
  ): VocabItem | undefined {
    const vocabItem = this.vocabItems.find((vocabItem) =>
      vocabItem.matches(item)
    );
    if (vocabItem) {
      vocabItem.fromInputSentence = vocabItem.fromInputSentence.filter(
        (sentence) => sentence !== fromSentence
      );
      this.saveVocabItems();
      return vocabItem;
    }
    return undefined;
  }
}
