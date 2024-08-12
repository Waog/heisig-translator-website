import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import {
  Language,
  TranslationService,
} from '../shared/services/translation.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
})
export class FavoriteButtonComponent implements OnInit, OnChanges {
  @Input() hanziString: string = '';
  isFavorite: boolean = false;

  constructor(private translationService: TranslationService) {}

  ngOnInit(): void {
    this.loadFavoriteStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanziString'] && !changes['hanziString'].firstChange) {
      this.loadFavoriteStatus();
    }
  }

  loadFavoriteStatus(): void {
    const favorites = this.getFavoritesFromLocalStorage();
    this.isFavorite = favorites.some((fav) => fav.hanzi === this.hanziString);
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      this.addFavorite();
    } else {
      this.removeFavorite();
    }
  }

  addFavorite(): void {
    this.translationService
      .getTranslation(this.hanziString, Language.EN)
      .subscribe((translationResult) => {
        if (translationResult.translation !== 'Loading...') {
          const favorites = this.getFavoritesFromLocalStorage();
          favorites.push({
            hanzi: this.hanziString,
            translation: translationResult.translation,
          });
          this.updateFavoritesInLocalStorage(favorites);
        }
      });
  }

  removeFavorite(): void {
    const favorites = this.getFavoritesFromLocalStorage();
    const index = favorites.findIndex((fav) => fav.hanzi === this.hanziString);
    if (index > -1) {
      favorites.splice(index, 1);
      this.updateFavoritesInLocalStorage(favorites);
    }
  }

  getFavoritesFromLocalStorage(): { hanzi: string; translation: string }[] {
    const favorites = localStorage.getItem('favoriteSentencesV1');
    return favorites ? JSON.parse(favorites) : [];
  }

  updateFavoritesInLocalStorage(
    favorites: { hanzi: string; translation: string }[]
  ): void {
    localStorage.setItem('favoriteSentencesV1', JSON.stringify(favorites));
  }
}
