import { Injectable } from '@angular/core';
import { saveAs } from 'file-saver';
import { AnkiCard } from './anki-card';

@Injectable({
  providedIn: 'root',
})
export class AnkiExportService {
  constructor() {}

  exportDeck(cards: AnkiCard[]): void {
    const deckName = 'Chinese';
    const notetype = 'Chinese comprehensive';
    const separator = ';';
    const allowHTML = true;

    // Header for the file to specify the deck, notetype, separator, and HTML allowance
    let content = `#deck:${deckName}\n`;
    content += `#notetype:${notetype}\n`;
    content += `#separator:${separator}\n`;

    // If you want to enable HTML formatting
    if (allowHTML) {
      content += `#html:true\n`;
    }

    // Add tags and column headers
    content += `#tags:from-waog-heisig needs-review\n`;
    content += `#columns:Hanzi;English;Pinyin;Sound;override TTS;Heisig English Keywords;Image;Skill;Lesson;Notes\n`;

    // Add user-provided data
    cards.forEach((card) => {
      const row = [
        this.escapeField(card.hanzi),
        this.escapeField(card.english),
        this.escapeField(card.pinyin),
        this.escapeField(card.sound),
        this.escapeField(card.overrideTTS),
        this.escapeField(card.heisigKeywords),
        this.escapeField(card.image),
        this.escapeField(card.skill),
        this.escapeField(card.lesson),
        this.escapeField(card.notes),
      ];
      content += row.join(separator) + '\n';
    });

    // Convert content to a Blob and trigger the download
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'user-deck.txt');
  }

  private escapeField(field: string): string {
    if (field.includes(';') || field.includes('"') || field.includes('\n')) {
      // Escape double quotes by replacing them with two double quotes
      field = field.replace(/"/g, '""');
      // Wrap the field in double quotes
      return `"${field}"`;
    }
    return field;
  }
}
