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
import { FormFieldNumberComponent } from '../form-field-number/form-field-number.component';
import { FormFieldObjectComponent } from '../form-field-object/form-field-object.component';
import { FormFieldTextComponent } from '../form-field-text/form-field-text.component';
import { FormFieldTextareaComponent } from '../form-field-textarea/form-field-textarea.component';
import { LabeledTextInputComponent } from '../labeled-text-input/labeled-text-input.component';
import { LabeledTextareaComponent } from '../labeled-textarea/labeled-textarea.component';
import { VocabItem } from '../shared/services/vocab-item';
import { VocabListService } from '../shared/services/vocab-list.service';
import { VocabServiceCollectionService } from '../shared/services/vocab-service-collection.service';

@Component({
  selector: 'app-vocab-item-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LabeledTextInputComponent,
    LabeledTextareaComponent,
    FormFieldTextareaComponent,
    FormFieldTextComponent,
    FormFieldObjectComponent,
    FormFieldNumberComponent,
  ],
  templateUrl: './vocab-item-form.component.html',
  styleUrls: ['./vocab-item-form.component.scss'],
})
export class VocabItemFormComponent implements OnChanges {
  @Input() vocabItem!: VocabItem;
  @Output() delete = new EventEmitter<void>();
  modifiedItem!: VocabItem;
  isModified: boolean = false;

  constructor(
    private vocabListService: VocabListService,
    private vocabServiceCollectionService: VocabServiceCollectionService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vocabItem'] && this.vocabItem) {
      this.modifiedItem = new VocabItem(
        { ...this.vocabItem },
        this.vocabServiceCollectionService
      );
    }
  }

  onInputChange(): void {
    this.isModified = !this.isEqual(this.vocabItem, this.modifiedItem);
  }

  async autoFill(): Promise<void> {
    await this.modifiedItem.autoFillEmptyFields();
    this.onInputChange();
  }

  save(): void {
    if (this.isModified) {
      this.vocabListService.updateVocabItem(this.vocabItem, this.modifiedItem);
      this.vocabItem.update(this.modifiedItem);
      this.isModified = false;
    }
  }

  emitDelete(): void {
    this.delete.emit();
  }

  addArrayItem(
    arrayName: 'segmentation' | 'fromInputSentence' | 'allTranslations'
  ): void {
    this.modifiedItem[arrayName].push('');
    this.onInputChange();
  }

  removeArrayItem(
    arrayName: 'segmentation' | 'fromInputSentence' | 'allTranslations',
    index: number
  ): void {
    this.modifiedItem[arrayName].splice(index, 1);
    this.onInputChange();
  }

  private isEqual(item1: VocabItem, item2: VocabItem): boolean {
    return item1.matches(item2) && item2.matches(item1);
  }
}
