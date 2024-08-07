import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OnlineTranslationService {
  private myMemoryUrl = 'https://api.mymemory.translated.net/get';
  private cacheEN = new Map<string, string>();
  private cacheDE = new Map<string, string>();
  private ongoingRequests = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {
    this.loadCacheFromLocalStorage();
  }

  translate(text: string, langpair: string): Observable<any> {
    const url = `${this.myMemoryUrl}?q=${encodeURIComponent(
      text
    )}&langpair=${langpair}`;

    const cache = this.getCacheByLangpair(langpair);

    // Check if the translation is in the cache
    if (cache && cache.has(text)) {
      return of({ responseData: { translatedText: cache.get(text) } });
    }

    // Check if there is an ongoing request for the same URL
    if (this.ongoingRequests.has(url)) {
      return this.ongoingRequests.get(url)!;
    }

    // If not in cache or ongoing request, make the HTTP request
    // TODO: restore actual HTTP request
    // const request = this.http.get<any>(url).pipe(
    const request = of({ responseData: { translatedText: 'MOCK' } }).pipe(
      tap((response) => {
        cache?.set(text, response.responseData.translatedText); // Cache the response
        this.saveCacheToLocalStorage(); // Save the cache to localStorage
        this.ongoingRequests.delete(url); // Remove from ongoing requests
      }),
      shareReplay(1) // Ensure the observable is shared among subscribers
    );

    // Store the ongoing request
    this.ongoingRequests.set(url, request);

    return request;
  }

  private getCacheByLangpair(langpair: string): Map<string, string> | null {
    if (langpair.endsWith('en')) {
      return this.cacheEN;
    } else if (langpair.endsWith('de')) {
      return this.cacheDE;
    }
    return null;
  }

  private loadCacheFromLocalStorage(): void {
    const cacheENString = localStorage.getItem('onlineTranslationCacheEN');
    const cacheDEString = localStorage.getItem('onlineTranslationCacheDE');
    if (cacheENString) {
      const cacheENObject = JSON.parse(cacheENString);
      for (const [key, value] of Object.entries(cacheENObject)) {
        this.cacheEN.set(key, value as string);
      }
    }
    if (cacheDEString) {
      const cacheDEObject = JSON.parse(cacheDEString);
      for (const [key, value] of Object.entries(cacheDEObject)) {
        this.cacheDE.set(key, value as string);
      }
    }
  }

  private saveCacheToLocalStorage(): void {
    const cacheENObject = Object.fromEntries(this.cacheEN);
    localStorage.setItem(
      'onlineTranslationCacheEN',
      JSON.stringify(cacheENObject)
    );
    const cacheDEObject = Object.fromEntries(this.cacheDE);
    localStorage.setItem(
      'onlineTranslationCacheDE',
      JSON.stringify(cacheDEObject)
    );
  }
}
