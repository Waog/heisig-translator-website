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
import { FormFieldTextareaComponent } from '../form-field-textarea/form-field-textarea.component';

@Component({
  selector: 'app-form-field-object',
  standalone: true,
  imports: [CommonModule, FormsModule, FormFieldTextareaComponent],
  templateUrl: './form-field-object.component.html',
  styleUrls: ['./form-field-object.component.scss'],
})
export class FormFieldObjectComponent implements OnChanges {
  @Input() label!: string;
  @Input() object!: Object | undefined;
  @Input() rows = undefined;
  @Output() objectChange = new EventEmitter<Object>();

  objString: string = '';
  editMode: boolean = false;
  lines: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    this.objString = JSON.stringify(this.object, null, 2) || '';
    this.lines = this.objString.split('\n').length;
  }

  save(): void {
    try {
      this.object = JSON.parse(this.objString);
      this.editMode = false;
      this.objectChange.emit(this.object);
    } catch (e) {
      alert('Invalid JSON!\nContinue editing or Reload to cancel!');
    }
  }
}
