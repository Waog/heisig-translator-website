import { Injectable } from '@angular/core';
import { ExampleSentencesService } from './example-sentences.service';
import { HeisigService } from './heisig.service';
import { PinyinService } from './pinyin.service';
import { SegmentationService } from './segmentation.service';
import { TranslationService } from './translation.service';
import { VocabListService } from './vocab-list.service';

@Injectable({
  providedIn: 'root',
})
export class VocabServiceCollectionService {
  public vocabListService!: VocabListService;

  constructor(
    public translationService: TranslationService,
    public pinyinService: PinyinService,
    public heisigService: HeisigService,
    public segmentationService: SegmentationService,
    public exampleSentencesService: ExampleSentencesService
  ) {}
}
