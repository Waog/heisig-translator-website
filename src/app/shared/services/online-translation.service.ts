import { Injectable } from '@angular/core';
import { DebouncedLocalStorageService } from './debounced-local-storage.service';
import { HttpPromiseService } from './http-promise.service';

@Injectable({
  providedIn: 'root',
})
export class OnlineTranslationService {
  private myMemoryUrl = 'https://api.mymemory.translated.net/get';
  private cacheEN = new Map<string, string>();
  private cacheDE = new Map<string, string>();
  private ongoingRequests = new Map<string, Promise<any>>();

  constructor(
    private httpPromiseService: HttpPromiseService,
    private localStorage: DebouncedLocalStorageService
  ) {
    this.loadCacheFromLocalStorage();
  }

  async translate(text: string, langpair: string): Promise<any> {
    this.loadCacheFromLocalStorage(); // Load cache before each request

    const url = `${this.myMemoryUrl}?q=${encodeURIComponent(
      text
    )}&langpair=${langpair}`;
    const cache = this.getCacheByLangpair(langpair);

    // Check if the translation is in the cache
    if (cache && cache.has(text)) {
      return { responseData: { translatedText: cache.get(text) } };
    }

    // Check if there is an ongoing request for the same URL
    if (this.ongoingRequests.has(url)) {
      return this.ongoingRequests.get(url)!;
    }

    // If not in cache or ongoing request, make the HTTP request
    const requestPromise = this.httpPromiseService
      .get<any>(url)
      .then((response) => {
        cache?.set(text, response.responseData.translatedText); // Cache the response
        this.saveCacheToLocalStorage(); // Save the cache to localStorage
        this.ongoingRequests.delete(url); // Remove from ongoing requests
        return response;
      });

    // Store the ongoing request
    this.ongoingRequests.set(url, requestPromise);

    return requestPromise;
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
    const cacheENString = this.localStorage.getItem('onlineTranslationCacheEN');
    const cacheDEString = this.localStorage.getItem('onlineTranslationCacheDE');
    if (cacheENString) {
      const cacheENObject = JSON.parse(cacheENString);
      this.cacheEN.clear();
      for (const [key, value] of Object.entries(cacheENObject)) {
        this.cacheEN.set(key, value as string);
      }
    }
    if (cacheDEString) {
      const cacheDEObject = JSON.parse(cacheDEString);
      this.cacheDE.clear();
      for (const [key, value] of Object.entries(cacheDEObject)) {
        this.cacheDE.set(key, value as string);
      }
    }
  }

  private saveCacheToLocalStorage(): void {
    const cacheENObject = Object.fromEntries(this.cacheEN);
    this.localStorage.setItem(
      'onlineTranslationCacheEN',
      JSON.stringify(cacheENObject)
    );
    const cacheDEObject = Object.fromEntries(this.cacheDE);
    this.localStorage.setItem(
      'onlineTranslationCacheDE',
      JSON.stringify(cacheDEObject)
    );
  }
}
