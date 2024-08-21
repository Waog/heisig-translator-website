import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';
import { InputUrlParamService } from './input-url-param.service';

@Component({
  selector: 'app-input-text',
  standalone: true,
  imports: [CommonModule, FormsModule, FavoriteButtonComponent],
  templateUrl: './input-text.component.html',
  styleUrls: ['./input-text.component.scss'],
})
export class InputTextComponent implements OnInit, OnDestroy {
  @Input() customSegmentation: string = '';
  @Output() userInputChange = new EventEmitter<string>();
  userInput: string = '';
  subscription!: Subscription;

  constructor(private urlParamService: InputUrlParamService) {}

  ngOnInit(): void {
    this.subscription = this.urlParamService
      .getFilteredInput()
      .subscribe((input) => {
        this.userInput = input.trim();
        this.onUserInputChange();
      });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onUserInputChange(): void {
    this.userInputChange.emit(this.userInput.trim());
  }

  resetInput(): void {
    this.userInput = '';
    this.onUserInputChange();
  }

  async pasteFromClipboard(): Promise<void> {
    try {
      const text = await navigator.clipboard.readText();
      this.userInput = this.urlParamService.cleanInput(text);
      this.onUserInputChange();
    } catch (err) {
      console.error('Failed to read clipboard contents: ', err);
    }
  }
}
