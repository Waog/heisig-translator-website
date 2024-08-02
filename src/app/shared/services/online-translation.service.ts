import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OnlineTranslationService {
  private myMemoryUrl = 'https://api.mymemory.translated.net/get';

  constructor(private http: HttpClient) {}

  translate(text: string, langpair: string): Observable<any> {
    const url = `${this.myMemoryUrl}?q=${encodeURIComponent(
      text
    )}&langpair=${langpair}`;
    return this.http.get<any>(url);
  }
}
