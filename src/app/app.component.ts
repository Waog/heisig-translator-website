import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { InputTextComponent } from './input-text/input-text.component';
import { LocalStorageComponent } from './local-storage/local-storage.component';
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
    LocalStorageComponent,
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
export class AppComponent {
  userInput: string = '';
  selectedWord: string = '';
  intentUri: string = '';
  consoleOutputs: string[] = []; // To store console logs

  constructor() {
    // Overriding the console log and error functions
    this.overrideConsole();
  }

  onUserInputChange(newInput: string): void {
    this.userInput = newInput;
    this.selectedWord = ''; // Reset selected word when input changes
  }

  onWordSelected(word: string): void {
    this.selectedWord = word;
  }

  onIntentUriChange(newUri: string): void {
    this.intentUri = newUri;
  }

  // Method 1: Open with window.location.href
  openWithWindowHref(): void {
    this.logToConsole(
      `Trying to open with window.location.href: ${this.intentUri}`
    );
    if (this.intentUri) {
      window.location.href = this.intentUri;
    }
  }

  // Method 2: Open with window.open
  openWithWindowOpen(): void {
    this.logToConsole(`Trying to open with window.open: ${this.intentUri}`);
    if (this.intentUri) {
      window.open(this.intentUri, '_blank');
    }
  }

  // Method 3: Using an anchor element programmatically
  openWithAnchorClick(): void {
    this.logToConsole(`Trying to open with anchor click: ${this.intentUri}`);
    if (this.intentUri) {
      const anchor = document.createElement('a');
      anchor.href = this.intentUri;
      anchor.target = '_blank';
      anchor.click();
    }
  }

  // Function to override console.log and console.error
  private overrideConsole(): void {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      this.logToConsole('LOG:', ...args);
      originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.logToConsole('ERROR:', ...args);
      originalError.apply(console, args);
    };
  }

  // Function to log messages to the consoleOutputs array
  private logToConsole(...args: any[]): void {
    const message = args.join(' ');
    this.consoleOutputs.push(message);
  }
}
