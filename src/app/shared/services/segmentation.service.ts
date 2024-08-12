import { Injectable } from '@angular/core';

// @ts-ignore
import { Segment, useDefault } from 'segmentit';

@Injectable({
  providedIn: 'root',
})
export class SegmentationService {
  private segmentit: any;

  constructor() {
    this.segmentit = useDefault(new Segment());
  }

  toHanziWords(hanziSentence: string): string[] {
    const result = this.segmentit.doSegment(hanziSentence);
    return result.map((segment: { w: string }) => segment.w);
  }
}
