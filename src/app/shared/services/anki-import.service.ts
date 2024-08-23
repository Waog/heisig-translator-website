import { Injectable } from '@angular/core';
import * as Papa from 'papaparse';
import { AnkiCard } from './anki-card';

@Injectable({
  providedIn: 'root',
})
export class AnkiImportService {
  private readonly expectedHeaders = [
    '#separator:tab',
    '#html:true',
    '#guid column:1',
    '#notetype column:2',
    '#deck column:3',
    '#tags column:14',
  ];

  constructor() {}

  importDeck(fileContent: string): AnkiCard[] {
    if (!this.hasValidHeaders(fileContent)) {
      this.showInvalidHeadersAlert();
      return [];
    }

    const parsedData = this.parseFileData(fileContent);

    return this.extractAnkiCards(parsedData);
  }

  // High-Level Methods

  private hasValidHeaders(fileContent: string): boolean {
    const fileLines = this.getFileLines(fileContent);
    return this.expectedHeaders.every(
      (header, index) => fileLines[index] === header
    );
  }

  private parseFileData(fileContent: string): string[][] {
    return Papa.parse(fileContent, {
      delimiter: '\t',
      header: false,
      skipEmptyLines: true,
      comments: '#',
    }).data as string[][];
  }

  private extractAnkiCards(parsedData: string[][]): AnkiCard[] {
    return parsedData
      .filter((row) => this.isChineseComprehensive(row))
      .map((row, index) => this.createAnkiCard(row, index));
  }

  // Helper Methods

  private getFileLines(fileContent: string): string[] {
    return fileContent.split('\n').map((line) => line.trim());
  }

  private isChineseComprehensive(row: string[]): boolean {
    return row[1] === 'Chinese comprehensive';
  }

  private createAnkiCard(row: string[], index: number): AnkiCard {
    return {
      guid: this.getField(row[0]),
      index,
      hanzi: this.getField(row[3]),
      english: this.getField(row[4]),
      pinyin: this.getField(row[5]),
      sound: this.getField(row[6]),
      overrideTTS: this.getField(row[7]),
      heisigKeywords: this.getField(row[8]),
      image: this.getField(row[9]),
      skill: this.getField(row[10]),
      lesson: this.getField(row[11]),
      notes: this.getField(row[12]),
    };
  }

  private getField(field: string): string {
    return field || '';
  }

  private showInvalidHeadersAlert(): void {
    alert('The file does not have the correct headers for import.');
  }
}
