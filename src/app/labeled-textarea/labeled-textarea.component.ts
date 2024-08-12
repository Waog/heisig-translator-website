import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-labeled-textarea',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './labeled-textarea.component.html',
  styleUrls: ['./labeled-textarea.component.scss'],
})
export class LabeledTextareaComponent {
  @Input() label!: string;
  @Input() text!: string | undefined;
  @Output() textChange = new EventEmitter<string>();

  onInputChange(): void {
    this.textChange.emit(this.text);
  }
}
