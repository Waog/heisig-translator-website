import { Injectable } from '@angular/core';
import { HttpPromiseService } from './http-promise.service';

interface FrequencyData {
  Word: string;
  Length: number;
  Pinyin: string;
  PinyinInput: string;
  WCount: number;
  Wmillion: number;
  log10W: number;
  WCD: number;
  WCDPercentage: number;
  log10CD: number;
  DominantPoS: string;
  DominantPoSFreq: number;
  AllPoS: string;
  AllPoSFreq: number | null;
  EngTran: string;
}

@Injectable({
  providedIn: 'root',
})
export class FrequencyService {
  private frequencyData: FrequencyData[] = [];
  private loadPromise: Promise<void> | null = null;

  constructor(private httpPromiseService: HttpPromiseService) {
    this.loadFrequencyData();
  }

  private loadFrequencyData(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.httpPromiseService
      .get<FrequencyData[]>('assets/subtlexch.json')
      .then((data) => {
        this.frequencyData = data;
      })
      .catch((error) => {
        console.error('Failed to load frequency data:', error);
      });

    return this.loadPromise;
  }

  public async getFrequencyCategory(hanziWord: string): Promise<number> {
    await this.loadFrequencyData();

    const entryIndex = this.frequencyData.findIndex(
      (item) => item.Word === hanziWord
    );

    if (entryIndex === -1) {
      return 0;
    }

    return this.calculateCategory(entryIndex + 1);
  }

  private calculateCategory(rank: number): number {
    if (rank <= 1000) return 1; // Tier 1: Critical Vocabulary
    if (rank <= 5000) return 2; // Tier 2: High-Frequency Vocabulary
    if (rank <= 20000) return 3; // Tier 3: Medium-Frequency Vocabulary
    if (rank <= 50000) return 4; // Tier 4: Low-Frequency Vocabulary
    return 5; // Tier 5: Rare Vocabulary
  }
}
