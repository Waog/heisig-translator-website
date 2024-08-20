import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-labeled-text-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labeled-text-input.component.html',
  styleUrls: ['./labeled-text-input.component.scss'],
})
export class LabeledTextInputComponent {
  @Input() label!: string;
  @Input() text!: string | undefined;
  @Input() disabled = false;
  @Input() type = 'text';
  @Output() textChange = new EventEmitter<string>();

  onInputChange(): void {
    this.textChange.emit(this.text);
  }
}
