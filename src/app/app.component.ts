import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { mapping } from './mapping';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  userInput: string = '';
  mapping = mapping;

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
  }
}
