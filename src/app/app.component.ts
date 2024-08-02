import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { DecompositionComponent } from './decomposition/decomposition.component';
import { InputTextComponent } from './input-text/input-text.component';
import { SentenceTranslationComponent } from './sentence-translation/sentence-translation.component';
import { DictionaryService } from './shared/services/dictionary.service';
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
    HttpClientModule,
    DecompositionComponent,
    SentenceTranslationComponent,
    InputTextComponent,
    WordDetailsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TranslationService, PinyinService, DictionaryService],
})
export class AppComponent {
  userInput: string = '';
  selectedWord: string = '';

  onUserInputChange(newInput: string): void {
    this.userInput = newInput;
    this.selectedWord = ''; // Reset selected word when input changes
  }

  onWordSelected(word: string): void {
    this.selectedWord = word;
  }
}
