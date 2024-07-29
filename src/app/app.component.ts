// app.component.ts
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
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

  private inputSubject: Subject<string> = new Subject();

  constructor(private http: HttpClient) {
    this.inputSubject.pipe(debounceTime(1000)).subscribe((input: any) => {
      this.translateWithMyMemory(input);
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
  }

  translateWithMyMemory(input: string): void {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
      input
    )}&langpair=zh|en`;

    this.http.get<any>(url).subscribe(
      (response: any) => {
        if (response.responseData) {
          this.translation = response.responseData.translatedText;
        } else {
          this.translation = 'Translation error';
        }
      },
      (error) => {
        this.translation = 'Translation error';
      }
    );
  }

  onUserInputChange(): void {
    this.inputSubject.next(this.userInput);
  }
}
