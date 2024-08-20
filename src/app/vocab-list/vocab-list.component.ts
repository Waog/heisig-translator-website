import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { VocabItem } from '../shared/services/vocab-item';

@Component({
  selector: 'app-vocab-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vocab-list.component.html',
  styleUrls: ['./vocab-list.component.scss'],
})
export class VocabListComponent {
  @Input() vocabItems: VocabItem[] = [];
  @Output() delete = new EventEmitter<VocabItem>();
  @Output() edit = new EventEmitter<number>();

  constructor(private router: Router) {}

  deleteVocabItem(item: VocabItem): void {
    this.delete.emit(item);
  }

  navigateToTranslator(vocabItem: VocabItem): void {
    this.router.navigate(['/translator'], {
      queryParams: { input: vocabItem.hanzi },
    });
  }

  editVocabItem(index: number): void {
    this.edit.emit(index);
  }
}
