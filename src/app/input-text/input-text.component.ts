import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
})
export class InputTextComponent {
  @Output() userInputChange = new EventEmitter<string>();

  userInput: string = '';

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
      this.userInput = text;
      this.onUserInputChange();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }
}
