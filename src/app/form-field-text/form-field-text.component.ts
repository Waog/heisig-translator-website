import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabeledTextInputComponent } from '../labeled-text-input/labeled-text-input.component';
import { LabeledTextareaComponent } from '../labeled-textarea/labeled-textarea.component';

@Component({
  selector: 'app-form-field-text',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LabeledTextareaComponent,
    LabeledTextInputComponent,
  ],
  templateUrl: './form-field-text.component.html',
  styleUrls: ['./form-field-text.component.scss'],
})
export class FormFieldTextComponent implements OnChanges {
  @Input() label!: string;
  @Input() text!: string | undefined;
  @Input() type = 'text';
  @Output() textChange = new EventEmitter<string>();

  currentText: string = '';
  editMode: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.currentText = this.text || '';
  }

  activateEditMode(): void {
    this.editMode = true;
  }

  save(): void {
    this.text = this.currentText;
    this.editMode = false;
    this.textChange.emit(this.text);
  }

  discard(): void {
    this.currentText = this.text || '';
    this.editMode = false;
  }
}