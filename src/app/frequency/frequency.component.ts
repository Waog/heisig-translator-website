import { CommonModule } from '@angular/common'; // Import CommonModule
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Observable } from 'rxjs';
import { FrequencyService } from '../shared/services/frequency.service';

@Component({
  selector: 'app-frequency',
  standalone: true,
  imports: [CommonModule], // Add CommonModule to the imports
  templateUrl: './frequency.component.html',
  styleUrls: ['./frequency.component.scss'],
})
export class FrequencyComponent implements OnInit, OnChanges {
  @Input() hanziWord!: string;
  frequencyCategory$!: Observable<number>;

  constructor(private frequencyService: FrequencyService) {}

  ngOnInit(): void {
    this.calculateFrequencyCategory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanziWord']) {
      this.calculateFrequencyCategory();
    }
  }

  private calculateFrequencyCategory(): void {
    this.frequencyCategory$ = this.frequencyService.getFrequencyCategory(
      this.hanziWord
    );
  }
}
