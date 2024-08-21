import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { VocabItem, VocabItemInitializer } from './vocab-item';
import { VocabServiceCollectionService } from './vocab-service-collection.service';

@Injectable({
  providedIn: 'root',
})
export class VocabListService {
  private storageKey = 'vocabList_v1';
  private vocabItems: VocabItem[] = [];
  private vocabItemsChange$: BehaviorSubject<void> = new BehaviorSubject<void>(
    undefined
  );
  public readonly onChange$: Observable<void> =
    this.vocabItemsChange$.asObservable();

  constructor(
    private vocabServiceCollectionService: VocabServiceCollectionService
  ) {
    // NOTE: the list service must be assigned here, to avoid circular dependency injection.
    this.vocabServiceCollectionService.vocabListService = this;
    this.loadVocabItems();
  }

  private loadVocabItems(): void {
    const storedItems = localStorage.getItem(this.storageKey);
    if (storedItems) {
      const parsedItems = JSON.parse(storedItems);
      this.vocabItems = this.cleanLegacy(parsedItems).map(
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
      this.vocabItemsChange$.next();
    }
  }

  private cleanLegacy(legacyVocabItems: any[]): any[] {
    for (const item of legacyVocabItems) {
      if ('isSentence' in item) delete item.isSentence;
      if ('isWord' in item) delete item.isWord;
      if ('fromInputSentence' in item) delete item.fromInputSentence;
    }
    return legacyVocabItems;
  }

  saveVocabItems(): void {
    const itemsToStore = this.vocabItems.map((item) => item.toSerializable());
    localStorage.setItem(this.storageKey, JSON.stringify(itemsToStore));
    this.vocabItemsChange$.next();
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
}
