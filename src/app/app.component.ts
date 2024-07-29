import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { mapping } from './mapping';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  userInput: string = '';
  mapping = mapping;

  get modifiedInput(): string {
    return this.transformInput(this.userInput);
  }

  transformInput(input: string): string {
    let result = input;
    for (const key in this.mapping) {
      if (this.mapping.hasOwnProperty(key)) {
        const regex = new RegExp(key, 'g');
        result = result.replace(regex, this.mapping[key] + `, `);
      }
    }
    return result;
  }
}
