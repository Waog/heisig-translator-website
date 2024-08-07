import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { InputTextComponent } from './input-text/input-text.component';
import { SegmentationComponent } from './segmentation/segmentation.component';
import { SentenceTranslationComponent } from './sentence-translation/sentence-translation.component';
import { DictionaryService } from './shared/services/dictionary.service';
import { OnlineTranslationService } from './shared/services/online-translation.service';
import { PinyinService } from './shared/services/pinyin.service';
import { TranslationService } from './shared/services/translation.service';
import { WordDetailsComponent } from './word-details/word-details.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    SegmentationComponent,
    SentenceTranslationComponent,
    InputTextComponent,
    WordDetailsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    OnlineTranslationService,
    PinyinService,
    DictionaryService,
    TranslationService,
  ],
})
export class AppComponent implements OnInit {
  userInput: string = '';
  selectedWord: string = '';
  newInput: string = '';
  localStorageItems: { key: string; value: string }[] = [];

  ngOnInit() {
    this.loadLocalStorageItems();
  }

  onUserInputChange(newInput: string): void {
    this.userInput = newInput;
    this.selectedWord = ''; // Reset selected word when input changes
  }

  onWordSelected(word: string): void {
    this.selectedWord = word;
  }

  saveInput() {
    if (this.newInput) {
      localStorage.setItem(`input-${Date.now()}`, this.newInput);
      this.newInput = '';
      this.loadLocalStorageItems();
    }
  }

  loadLocalStorageItems() {
    this.localStorageItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('input-')) {
        this.localStorageItems.push({
          key,
          value: localStorage.getItem(key) || '',
        });
      }
    }
  }

  deleteItem(key: string) {
    localStorage.removeItem(key);
    this.loadLocalStorageItems();
  }
}
