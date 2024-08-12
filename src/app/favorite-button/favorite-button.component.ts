import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FavoriteService } from '../shared/services/favorite.service';

@Component({
  selector: 'app-favorite-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorite-button.component.html',
  styleUrls: ['./favorite-button.component.scss'],
})
export class FavoriteButtonComponent implements OnInit, OnChanges {
  @Input() hanziString: string = '';
  @Input() type: 'word' | 'sentence' = 'sentence';
  @Input() context?: string;

  isFavorite: boolean = false;

  constructor(private favoriteService: FavoriteService) {}

  ngOnInit(): void {
    this.loadFavoriteStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['hanziString'] && !changes['hanziString'].firstChange) ||
      changes['type']
    ) {
      this.loadFavoriteStatus();
    }
  }

  loadFavoriteStatus(): void {
    if (this.type === 'sentence') {
      this.isFavorite = this.favoriteService.isSentenceFavorite(
        this.hanziString
      );
    } else {
      this.isFavorite = this.favoriteService.isWordFavorite(this.hanziString);
    }
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
    if (this.isFavorite) {
      if (this.type === 'sentence') {
        this.favoriteService.addSentenceFavorite(this.hanziString);
      } else {
        this.favoriteService.addWordFavorite(this.hanziString, this.context);
      }
    } else {
      if (this.type === 'sentence') {
        this.favoriteService.removeSentenceFavorite(this.hanziString);
      } else {
        this.favoriteService.removeWordFavorite(this.hanziString);
      }
    }
  }
}
