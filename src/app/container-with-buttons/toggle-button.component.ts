import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-button.component.html',
  styleUrls: ['./toggle-button.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleButtonComponent),
      multi: true,
    },
  ],
})
export class ToggleButtonComponent implements ControlValueAccessor {
  @Input() options: string[] = [];
  @Input() selectedOption: string = '';
  @Output() optionSelected = new EventEmitter<string>();

  private onChange = (value: string) => {};
  private onTouched = () => {};

  toggleOption(): void {
    const currentIndex = this.options.indexOf(this.selectedOption);
    this.selectedOption =
      this.options[(currentIndex + 1) % this.options.length];
    this.optionSelected.emit(this.selectedOption);
    this.onChange(this.selectedOption);
    this.onTouched();
  }

  // ControlValueAccessor interface methods
  writeValue(value: string): void {
    if (value) {
      this.selectedOption = value;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Optionally handle the disabled state
  }
}
