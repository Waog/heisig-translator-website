import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FrequencyService {
  private frequencyDataSubject: BehaviorSubject<any[]> = new BehaviorSubject<
    any[]
  >([]);
  private frequencyData$: Observable<any[]> =
    this.frequencyDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFrequencyData();
  }

  private loadFrequencyData(): void {
    this.http.get<any[]>('assets/subtlexch.json').subscribe(
      (data) => {
        this.frequencyDataSubject.next(data);
      },
      (error) => {
        console.error('Failed to load frequency data:', error);
      }
    );
  }

  public getFrequencyCategory(hanziWord: string): Observable<number> {
    return this.frequencyData$.pipe(
      filter((data) => data.length > 0), // Ensure data is loaded
      map((data) => {
        const entryIndex = data.findIndex((item) => item.Word === hanziWord);

        if (entryIndex === -1) {
          return 0; // Word not found in the frequency data
        }

        return this.calculateCategory(entryIndex + 1); // Rank is 1-based
      })
    );
  }

  private calculateCategory(rank: number): number {
    if (rank <= 1000) return 1; // Tier 1: Critical Vocabulary
    if (rank <= 5000) return 2; // Tier 2: High-Frequency Vocabulary
    if (rank <= 20000) return 3; // Tier 3: Medium-Frequency Vocabulary
    if (rank <= 50000) return 4; // Tier 4: Low-Frequency Vocabulary
    return 5; // Tier 5: Rare Vocabulary
  }
}
