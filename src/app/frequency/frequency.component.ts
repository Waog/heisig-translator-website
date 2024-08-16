import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { FrequencyService } from '../shared/services/frequency.service';

@Component({
  selector: 'app-frequency',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './frequency.component.html',
  styleUrls: ['./frequency.component.scss'],
})
export class FrequencyComponent implements OnInit, OnChanges {
  @Input() hanziWord!: string;
  frequencyCategory: number | null = null;

  constructor(private frequencyService: FrequencyService) {}

  ngOnInit(): void {
    this.calculateFrequencyCategory();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanziWord']) {
      this.calculateFrequencyCategory();
    }
  }

  private async calculateFrequencyCategory(): Promise<void> {
    this.frequencyCategory = await this.frequencyService.getFrequencyCategory(
      this.hanziWord
    );
  }
}
