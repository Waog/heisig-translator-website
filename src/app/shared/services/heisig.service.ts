import { Injectable } from '@angular/core';
import { heisigMapping } from './heisig-mapping';

@Injectable({
  providedIn: 'root',
})
export class HeisigService {
  constructor() {}

  getHeisigEn(hanzi: string): string {
    return heisigMapping[hanzi];
  }

  getHeisigSentenceEn(
    hanziSentence: string,
    replacementForUnknown: string | undefined = undefined
  ): string {
    return hanziSentence
      .split('')
      .map((hanzi) => this.getHeisigEn(hanzi) || replacementForUnknown || hanzi)
      .join(' ');
  }
}
