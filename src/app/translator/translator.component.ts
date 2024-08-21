import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InputTextComponent } from '../input-text/input-text.component';
import { SegmentationComponent } from '../segmentation/segmentation.component';
import { SentenceTranslationComponent } from '../sentence-translation/sentence-translation.component';
import { WordDetailsComponent } from '../word-details/word-details.component';

@Component({
  selector: 'app-translator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InputTextComponent,
    SentenceTranslationComponent,
    SegmentationComponent,
    WordDetailsComponent,
  ],
  templateUrl: './translator.component.html',
  styleUrls: ['./translator.component.scss'],
})
export class TranslatorComponent {
  userInput: string = '';
  selectedWord: string = '';
  @Input() customSegmentation: string = '';

  onUserInputChange(newInput: string): void {
    this.userInput = newInput;
    this.customSegmentation = '';
    this.selectedWord = '';
  }

  onWordSelected(word: string): void {
    this.selectedWord = word;
  }
}
