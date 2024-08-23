import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DebouncedLocalStorageService {
  private writeSubjects: { [key: string]: BehaviorSubject<string | null> } = {};
  private inMemoryCache: { [key: string]: string | null } = {};

  constructor() {
    window.addEventListener('beforeunload', () => {
      this.flushAllPendingWrites();
    });
  }

  setItem(key: string, value: string): void {
    this.inMemoryCache[key] = value; // Update the in-memory cache immediately

    if (!this.writeSubjects[key]) {
      this.writeSubjects[key] = new BehaviorSubject<string | null>(null);

      this.writeSubjects[key]
        .pipe(
          debounceTime(2000), // Wait for 2000ms before actually writing
          switchMap((val) => {
            if (val !== null) {
              return this.performWrite(key, val);
            }
            return []; // no action if value is null
          })
        )
        .subscribe();
    }

    this.writeSubjects[key].next(value);
  }

  getItem(key: string): string | null {
    // Return the in-memory cached value if available, otherwise read from localStorage
    return this.inMemoryCache[key] !== undefined
      ? this.inMemoryCache[key]
      : localStorage.getItem(key);
  }

  private performWrite(key: string, value: string) {
    return new Promise<void>((resolve) => {
      localStorage.setItem(key, value);
      resolve();
    });
  }

  private flushAllPendingWrites(): void {
    Object.keys(this.writeSubjects).forEach((key) => {
      const latestValue = this.inMemoryCache[key];
      if (latestValue !== undefined && latestValue !== null) {
        localStorage.setItem(key, latestValue);
      }
    });
  }
}
