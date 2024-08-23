import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormFieldTextareaComponent } from '../form-field-textarea/form-field-textarea.component';
import { AnkiCard } from '../shared/services/anki-card';

@Component({
  selector: 'app-anki-card-details',
  standalone: true,
  imports: [CommonModule, FormFieldTextareaComponent],
  templateUrl: './anki-card-details.component.html',
  styleUrls: ['./anki-card-details.component.scss'],
})
export class AnkiCardDetailsComponent {
  @Input() ankiCard!: AnkiCard;
}
