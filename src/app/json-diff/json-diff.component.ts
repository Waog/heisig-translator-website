import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { diffJson } from 'diff';

interface DiffLine {
  text: string;
  class: string;
}

@Component({
  selector: 'app-json-diff',
  template: `
    <div class="diff-container">
      <button class="toggle-button" (click)="toggleHideUnchanged()">
        {{ hideUnchanged ? 'Show All' : 'Hide Unchanged' }}
      </button>
      <div *ngIf="diff">
        <pre *ngFor="let line of diff" [ngClass]="line.class">{{
          toHiddenText(line)
        }}</pre>
      </div>
    </div>
  `,
  styles: [
    `
      .diff-container {
        position: relative;
      }
      .toggle-button {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #616161;
        color: #e0e0e0;
        border: none;
        padding: 0.5em 1em;
        cursor: pointer;
        border-radius: 3px;
        font-family: 'Courier New', Courier, monospace;
      }
      .toggle-button:hover {
        background-color: #757575;
      }
      pre {
        color: #e0e0e0;
        padding: 0.2em;
        border-radius: 3px;
        white-space: pre-wrap;
        word-wrap: break-word;
        margin: 0;
        font-family: 'Courier New', Courier, monospace;
      }
      .added {
        background-color: hsl(120 100% 20% / 1);
        color: white;
      }
      .removed {
        background-color: hsl(0 100% 20% / 1);
        color: white;
      }
      .unchanged {
        background-color: #424242;
        color: #e0e0e0;
      }
    `,
  ],
  standalone: true,
  imports: [CommonModule],
})
export class JsonDiffComponent implements OnChanges {
  @Input() oldObject: any;
  @Input() newObject: any;

  diff: DiffLine[] | null = null;
  hideUnchanged: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['oldObject'] || changes['newObject']) {
      this.calculateDiff();
    }
  }

  toggleHideUnchanged(): void {
    this.hideUnchanged = !this.hideUnchanged;
  }

  toHiddenText(diffLine: DiffLine): string {
    if (this.hideUnchanged && diffLine.class === 'unchanged') {
      return `...`;
    } else {
      return diffLine.text;
    }
  }

  private calculateDiff(): void {
    if (this.oldObject && this.newObject) {
      const diffResult = diffJson(this.oldObject, this.newObject);
      this.diff = this.formatDiff(diffResult);
    } else {
      this.diff = null;
    }
  }

  private formatDiff(diffResult: any[]): DiffLine[] {
    return diffResult.map((line) => ({
      text: line.value,
      class: line.added ? 'added' : line.removed ? 'removed' : 'unchanged',
    }));
  }
}
