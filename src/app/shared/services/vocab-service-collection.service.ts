import { Injectable } from '@angular/core';
import { HeisigService } from './heisig.service';
import { PinyinService } from './pinyin.service';
import { SegmentationService } from './segmentation.service';
import { TranslationService } from './translation.service';

@Injectable({
  providedIn: 'root',
})
export class VocabServiceCollectionService {
  constructor(
    public translationService: TranslationService,
    public pinyinService: PinyinService,
    public heisigService: HeisigService,
    public segmentationService: SegmentationService
  ) {}
}
