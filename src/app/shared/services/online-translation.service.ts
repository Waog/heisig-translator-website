import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OnlineTranslationService {
  private myMemoryUrl = 'https://api.mymemory.translated.net/get';
  private cache = new Map<string, any>();
  private ongoingRequests = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  translate(text: string, langpair: string): Observable<any> {
    const url = `${this.myMemoryUrl}?q=${encodeURIComponent(
      text
    )}&langpair=${langpair}`;

    // Check if the translation is in the cache
    if (this.cache.has(url)) {
      return of(this.cache.get(url));
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
        this.cache.set(url, response); // Cache the response
        this.ongoingRequests.delete(url); // Remove from ongoing requests
      }),
      shareReplay(1) // Ensure the observable is shared among subscribers
    );

    // Store the ongoing request
    this.ongoingRequests.set(url, request);

    return request;
  }
}
