// src/app/app.component.ts

import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { mapping } from './mapping';
import { PinyinService } from './pinyin.service';
import { TranslationService } from './translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TranslationService, PinyinService], // Ensure the services are provided here
})
export class AppComponent {
  userInput: string = '';
  mapping = mapping;
  translation: string = '';
  germanTranslation: string = '';
  pinyinTranslation: { char: string; pinyin: string }[] = [];
  isLoading: boolean = false;
  debounceInProgress: boolean = false;

  private inputSubject: Subject<string> = new Subject();

  constructor(
    private translationService: TranslationService,
    private pinyinService: PinyinService
  ) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe((input: any) => {
      this.debounceInProgress = false;
      this.translateText(input);
      this.convertToPinyin(input);
    });
  }

  get modifiedInput(): { char: string; translation: string }[] {
    return this.transformInput(this.userInput);
  }

  transformInput(input: string): { char: string; translation: string }[] {
    return Array.from(input).map((char) => ({
      char: char,
      translation: this.mapping[char] || char,
    }));
  }

  resetInput(): void {
    this.userInput = '';
    this.translation = '';
    this.germanTranslation = '';
    this.pinyinTranslation = [];
    this.isLoading = false;
    this.debounceInProgress = false;
  }

  translateText(input: string): void {
    this.isLoading = true;
    this.translationService.translate(input, 'zh|en').subscribe(
      (response: any) => {
        this.isLoading = false;
        if (response.responseData) {
          this.translation = response.responseData.translatedText;
        } else {
          this.translation = 'Translation error';
        }
      },
      (error) => {
        this.isLoading = false;
        this.translation = 'Translation error';
      }
    );

    this.translationService.translate(input, 'zh|de').subscribe(
      (response: any) => {
        if (response.responseData) {
          this.germanTranslation = response.responseData.translatedText;
        } else {
          this.germanTranslation = 'Translation error';
        }
      },
      (error) => {
        this.germanTranslation = 'Translation error';
      }
    );
  }

  convertToPinyin(input: string): void {
    this.pinyinTranslation = this.pinyinService.convertToPinyin(input);
  }

  onUserInputChange(): void {
    this.debounceInProgress = true;
    this.inputSubject.next(this.userInput);
  }

  playAudio(text: string, lang: string): void {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  }
}
