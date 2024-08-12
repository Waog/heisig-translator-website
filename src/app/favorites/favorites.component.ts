import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  favoriteSentences: { hanzi: string; translation: string }[] = [];

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    const favorites = localStorage.getItem('favoriteSentencesV1');
    this.favoriteSentences = favorites ? JSON.parse(favorites) : [];
  }

  deleteFavorite(hanzi: string): void {
    this.favoriteSentences = this.favoriteSentences.filter(
      (sentence) => sentence.hanzi !== hanzi
    );
    this.updateFavoritesInLocalStorage();
  }

  updateFavoritesInLocalStorage(): void {
    localStorage.setItem(
      'favoriteSentencesV1',
      JSON.stringify(this.favoriteSentences)
    );
  }
}
