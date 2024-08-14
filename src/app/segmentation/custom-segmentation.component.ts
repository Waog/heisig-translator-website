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

@Component({
  selector: 'app-custom-segmentation',
  standalone: true,
  imports: [LabeledTextInputComponent, CommonModule, FormsModule],
  templateUrl: './custom-segmentation.component.html',
  styleUrl: './custom-segmentation.component.scss',
})
export class CustomSegmentationComponent implements OnChanges {
  @Input() text!: string | undefined;
  @Output() textChange = new EventEmitter<string>();

  showCustomSegmentation = false;
  private isInternalChange = false;

  onInputChange(): void {
    this.isInternalChange = true;
    this.textChange.emit(this.text);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['text'] && !this.isInternalChange) {
      this.showCustomSegmentation = false;
    }
    this.isInternalChange = false;
  }

  onShowCustomSegmentation(): void {
    this.showCustomSegmentation = true;
  }
}
