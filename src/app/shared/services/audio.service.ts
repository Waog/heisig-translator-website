import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {}

  playAudio(text: string, lang: string): void {
    // Cancel any ongoing speech
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
    }

    // Create and speak a new utterance
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.lang = lang;
    speechSynthesis.speak(this.currentUtterance);
  }
}
