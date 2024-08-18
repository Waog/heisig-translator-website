import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FavoriteButtonComponent } from '../favorite-button/favorite-button.component';
import { SearchFilterUrlParamService } from './search-filter-url-param.service';

@Component({
  selector: 'app-search-filter-input',
  standalone: true,
  imports: [CommonModule, FormsModule, FavoriteButtonComponent],
  templateUrl: './search-filter-input.component.html',
  styleUrls: ['./search-filter-input.component.scss'],
})
export class SearchFilterInputComponent implements OnInit {
  @Output() textChange = new EventEmitter<string>();
  text: string = '';
  @ViewChild('inputField') inputField!: ElementRef;

  constructor(
    private urlParamService: SearchFilterUrlParamService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.text = await this.urlParamService.getSearchFilterText();
    this.textChange.emit(this.text);
  }

  onSubmit(): void {
    this.inputField.nativeElement.blur();
    this.navigateToUrl();
    this.textChange.emit(this.text);
  }

  resetInput(): void {
    this.text = '';
    this.inputField.nativeElement.focus();
    this.navigateToUrl();
    this.textChange.emit(this.text);
  }

  navigateToUrl(): void {
    this.router.navigate(['/vocabulary'], {
      queryParams: { searchFilter: this.text },
    });
  }
}
