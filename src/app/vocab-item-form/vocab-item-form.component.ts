import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
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
  ],
  templateUrl: './vocab-item-form.component.html',
  styleUrls: ['./vocab-item-form.component.scss'],
})
export class VocabItemFormComponent implements OnInit {
  @Input() vocabItem!: VocabItem;
  @Output() delete = new EventEmitter<void>(); // EventEmitter for delete action
  modifiedItem!: VocabItem;
  isModified: boolean = false;
  isExpanded: boolean = false;

  constructor(
    private vocabListService: VocabListService,
    private vocabServiceCollectionService: VocabServiceCollectionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.modifiedItem = new VocabItem(
      { ...this.vocabItem },
      this.vocabServiceCollectionService
    );
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

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  emitDelete(): void {
    this.delete.emit(); // Emit the delete event when the button is clicked
  }

  addArrayItem(
    arrayName: 'fromInputSentence' | 'allTranslations' | 'examples'
  ): void {
    this.modifiedItem[arrayName].push('');
    this.onInputChange();
  }

  removeArrayItem(
    arrayName: 'fromInputSentence' | 'allTranslations' | 'examples',
    index: number
  ): void {
    this.modifiedItem[arrayName].splice(index, 1);
    this.onInputChange();
  }

  private isEqual(item1: VocabItem, item2: VocabItem): boolean {
    return item1.matches(item2) && item2.matches(item1);
  }

  navigateToTranslator(): void {
    this.router.navigate(['/translator'], {
      queryParams: { input: this.vocabItem.hanzi },
    });
  }
}
