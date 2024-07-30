import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
})
export class InputTextComponent implements OnInit {
  @Output() userInputChange = new EventEmitter<string>();
  userInput: string = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.userInput = params['input'] || '';
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
      this.userInput = text;
      this.onUserInputChange();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }
}
