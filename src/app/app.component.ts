import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { pinyin } from 'pinyin-pro';
import { Subject, debounceTime } from 'rxjs';
import { mapping } from './mapping';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  userInput: string = '';
  mapping = mapping;
  translation: string = '';
  pinyinTranslation: string = '';
  isLoading: boolean = false;
  debounceInProgress: boolean = false;

  private inputSubject: Subject<string> = new Subject();

  constructor(private http: HttpClient) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe((input: any) => {
      this.debounceInProgress = false;
      this.translateWithMyMemory(input);
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
    this.pinyinTranslation = '';
    this.isLoading = false;
    this.debounceInProgress = false;
  }

  translateWithMyMemory(input: string): void {
    this.isLoading = true;
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      input
    )}&langpair=zh|en`;

    this.http.get<any>(url).subscribe(
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
  }

  convertToPinyin(input: string): void {
    this.pinyinTranslation = pinyin(input, { toneType: 'num' });
  }

  onUserInputChange(): void {
    this.debounceInProgress = true;
    this.inputSubject.next(this.userInput);
  }
}
