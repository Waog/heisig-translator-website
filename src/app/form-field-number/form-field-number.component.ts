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
import { FormFieldTextComponent } from '../form-field-text/form-field-text.component';

@Component({
  selector: 'app-form-field-number',
  standalone: true,
  imports: [CommonModule, FormsModule, FormFieldTextComponent],
  templateUrl: './form-field-number.component.html',
  styleUrls: ['./form-field-number.component.scss'],
})
export class FormFieldNumberComponent implements OnChanges {
  @Input() label!: string;
  @Input() number!: number | undefined;
  @Input() rows = undefined;
  @Output() numberChange = new EventEmitter<number>();

  numberString: string = '';
  editMode: boolean = false;

  ngOnChanges(changes: SimpleChanges): void {
    this.numberString = `${this.number}`;
  }

  save(): void {
    try {
      this.number = JSON.parse(this.numberString);
      this.editMode = false;
      this.numberChange.emit(this.number);
    } catch (e) {
      alert('Invalid Number!\nContinue editing or Reload to cancel!');
    }
  }
}
