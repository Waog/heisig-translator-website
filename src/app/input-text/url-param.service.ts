import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UrlParamService {
  constructor(private route: ActivatedRoute) {}

  getFilteredInput(): Observable<string> {
    return this.route.queryParams.pipe(
      map((params) => {
        let input = params['input'] || '';
        return this.cleanInput(input);
      })
    );
  }

  cleanInput(input: string): string {
    // Entfernt URLs und trimmt Leerzeichen
    const pattern = /^"([^"]+)"\s+https?:\/\/[^\s]+/;
    const match = input.match(pattern);
    if (match) {
      return match[1]; // Rückgabe des tatsächlichen Eingabetexts zwischen den Anführungszeichen
    }
    return input.trim(); // Rückgabe des gesamten Textes, wenn kein Muster übereinstimmt
  }
}
