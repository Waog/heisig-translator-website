import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
})
export class ToggleButtonComponent {
  @Input() options: string[] = [];
  @Input() selectedOption: string = '';
  @Output() selectedOptionChange = new EventEmitter<string>();

  toggleOption(): void {
    const currentIndex = this.options.indexOf(this.selectedOption);
    this.selectedOption =
      this.options[(currentIndex + 1) % this.options.length];
    this.selectedOptionChange.emit(this.selectedOption);
  }
}
