import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';
import { UrlParamService } from './url-param.service';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule, FavoriteButtonComponent],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
})
export class InputTextComponent implements OnInit {
  @Output() userInputChange = new EventEmitter<string>();
  userInput: string = '';

  constructor(private urlParamService: UrlParamService) {}

  ngOnInit(): void {
    this.urlParamService.getFilteredInput().subscribe((input) => {
      this.userInput = input;
      this.onUserInputChange();
    });
  }

  onUserInputChange(): void {
    this.userInputChange.emit(this.userInput);
  }

  resetInput(): void {
    this.userInput = '';
    this.onUserInputChange();
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.userInput = this.urlParamService.cleanInput(text);
      this.onUserInputChange();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }
}
