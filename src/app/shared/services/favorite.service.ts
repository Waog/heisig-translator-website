import { Injectable } from '@angular/core';
import { Language, TranslationService } from './translation.service';

export interface SentenceFavorite {
  hanzi: string;
  translation: string;
}

export interface WordFavorite {
  hanzi: string;
  translations: string[];
}

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private readonly sentenceLocalStorageKey = 'favoriteSentencesV1';
  private readonly wordLocalStorageKey = 'favoriteWordsV1';

  constructor(private translationService: TranslationService) {}

  // Sentence Methods
  isSentenceFavorite(hanzi: string): boolean {
    const favorites = this.getSentenceFavoritesFromLocalStorage();
    return favorites.some((fav) => fav.hanzi === hanzi);
  }

  addSentenceFavorite(hanzi: string): void {
    this.translationService
      .getTranslation(hanzi, Language.EN)
      .subscribe((translationResult) => {
        if (translationResult.translation !== 'Loading...') {
          const favorites = this.getSentenceFavoritesFromLocalStorage();
          favorites.push({ hanzi, translation: translationResult.translation });
          this.updateSentenceFavoritesInLocalStorage(favorites);
        }
      });
  }

  removeSentenceFavorite(hanzi: string): void {
    const favorites = this.getSentenceFavoritesFromLocalStorage();
    const index = favorites.findIndex((fav) => fav.hanzi === hanzi);
    if (index > -1) {
      favorites.splice(index, 1);
      this.updateSentenceFavoritesInLocalStorage(favorites);
    }
  }

  getAllSentenceFavorites(): SentenceFavorite[] {
    return this.getSentenceFavoritesFromLocalStorage();
  }

  private getSentenceFavoritesFromLocalStorage(): SentenceFavorite[] {
    const favorites = localStorage.getItem(this.sentenceLocalStorageKey);
    return favorites ? JSON.parse(favorites) : [];
  }

  private updateSentenceFavoritesInLocalStorage(
    favorites: SentenceFavorite[]
  ): void {
    localStorage.setItem(
      this.sentenceLocalStorageKey,
      JSON.stringify(favorites)
    );
  }

  // Word Methods
  isWordFavorite(hanzi: string): boolean {
    const favorites = this.getWordFavoritesFromLocalStorage();
    return favorites.some((fav) => fav.hanzi === hanzi);
  }

  addWordFavorite(hanzi: string): void {
    this.translationService
      .getAllTranslations(hanzi, Language.EN)
      .subscribe((translations) => {
        const allTranslations = translations.flatMap((t) => t.translations);
        const favorites = this.getWordFavoritesFromLocalStorage();
        favorites.push({ hanzi, translations: allTranslations });
        this.updateWordFavoritesInLocalStorage(favorites);
      });
  }

  removeWordFavorite(hanzi: string): void {
    const favorites = this.getWordFavoritesFromLocalStorage();
    const index = favorites.findIndex((fav) => fav.hanzi === hanzi);
    if (index > -1) {
      favorites.splice(index, 1);
      this.updateWordFavoritesInLocalStorage(favorites);
    }
  }

  getAllWordFavorites(): WordFavorite[] {
    return this.getWordFavoritesFromLocalStorage();
  }

  private getWordFavoritesFromLocalStorage(): WordFavorite[] {
    const favorites = localStorage.getItem(this.wordLocalStorageKey);
    return favorites ? JSON.parse(favorites) : [];
  }

  private updateWordFavoritesInLocalStorage(favorites: WordFavorite[]): void {
    localStorage.setItem(this.wordLocalStorageKey, JSON.stringify(favorites));
  }
}
