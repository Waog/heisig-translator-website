import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  FavoriteService,
  SentenceFavorite,
  WordFavorite,
} from '../shared/services/favorite.service';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
})
export class FavoritesComponent implements OnInit {
  favoriteSentences: SentenceFavorite[] = [];
  favoriteWords: WordFavorite[] = [];

  constructor(
    private favoriteService: FavoriteService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.favoriteSentences = this.favoriteService.getAllSentenceFavorites();
    this.favoriteWords = this.favoriteService.getAllWordFavorites();
  }

  deleteSentenceFavorite(hanzi: string): void {
    this.favoriteService.removeSentenceFavorite(hanzi);
    this.loadFavorites();
  }

  deleteWordFavorite(hanzi: string): void {
    this.favoriteService.removeWordFavorite(hanzi);
    this.loadFavorites();
  }

  navigateToTranslator(hanzi: string): void {
    this.router.navigate(['/translator'], { queryParams: { input: hanzi } });
  }
}
