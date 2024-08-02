import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DictionaryService } from '../shared/services/dictionary.service';
import { HeisigService } from '../shared/services/heisig.service';
import { PinyinService } from '../shared/services/pinyin.service';
import { TranslationService } from '../shared/services/translation.service';
import { WordDetailsComponent } from './word-details.component';
import { WordDetailsService } from './word-details.service';

describe('WordDetailsComponent', () => {
  let component: WordDetailsComponent;
  let fixture: ComponentFixture<WordDetailsComponent>;
  let wordDetailsServiceSpy: jasmine.SpyObj<WordDetailsService>;
  let heisigServiceSpy: jasmine.SpyObj<HeisigService>;
  let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;
  let pinyinServiceSpy: jasmine.SpyObj<PinyinService>;

  beforeEach(async () => {
    const wordDetailsSpy = jasmine.createSpyObj('WordDetailsService', [
      'getPinyin',
      'getPinyinWithNumbers',
      'getHeisigDetails',
      'getSimpleTranslation',
      'getAllTranslations',
      'getDisplayPinyin',
    ]);
    const heisigSpy = jasmine.createSpyObj('HeisigService', ['getHeisigEn']);
    const dictionarySpy = jasmine.createSpyObj('DictionaryService', [
      'isLoaded',
      'translate',
      'getAllTranslations',
    ]);
    const translationSpy = jasmine.createSpyObj('TranslationService', [
      'getTranslation',
      'getAllTranslations',
    ]);
    const pinyinSpy = jasmine.createSpyObj('PinyinService', [
      'convertToPinyin',
      'convertToPinyinWithNumbers',
    ]);

    await TestBed.configureTestingModule({
      declarations: [WordDetailsComponent],
      providers: [
        { provide: WordDetailsService, useValue: wordDetailsSpy },
        { provide: HeisigService, useValue: heisigSpy },
        { provide: DictionaryService, useValue: dictionarySpy },
        { provide: TranslationService, useValue: translationSpy },
        { provide: PinyinService, useValue: pinyinSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WordDetailsComponent);
    component = fixture.componentInstance;
    wordDetailsServiceSpy = TestBed.inject(
      WordDetailsService
    ) as jasmine.SpyObj<WordDetailsService>;
    heisigServiceSpy = TestBed.inject(
      HeisigService
    ) as jasmine.SpyObj<HeisigService>;
    dictionaryServiceSpy = TestBed.inject(
      DictionaryService
    ) as jasmine.SpyObj<DictionaryService>;
    translationServiceSpy = TestBed.inject(
      TranslationService
    ) as jasmine.SpyObj<TranslationService>;
    pinyinServiceSpy = TestBed.inject(
      PinyinService
    ) as jasmine.SpyObj<PinyinService>;
  });

  describe('getPinyin', () => {
    it('should return the pinyin of the word', () => {
      const word = '你好';
      wordDetailsServiceSpy.getPinyin.and.returnValue('ni hao');

      const result = wordDetailsServiceSpy.getPinyin(word);

      expect(result).toBe('ni hao');
      expect(wordDetailsServiceSpy.getPinyin).toHaveBeenCalledWith(word);
    });
  });

  describe('getPinyinWithNumbers', () => {
    it('should return the pinyin with numbers of the word', () => {
      const word = '你好';
      wordDetailsServiceSpy.getPinyinWithNumbers.and.returnValue('ni3 hao3');

      const result = wordDetailsServiceSpy.getPinyinWithNumbers(word);

      expect(result).toBe('ni3 hao3');
      expect(wordDetailsServiceSpy.getPinyinWithNumbers).toHaveBeenCalledWith(
        word
      );
    });
  });

  describe('getHeisigDetails', () => {
    it('should return the Heisig details of the word', () => {
      const word = '你好';
      const heisigDetails = [
        { hanzi: '你', heisig: 'you' },
        { hanzi: '好', heisig: 'good' },
      ];
      wordDetailsServiceSpy.getHeisigDetails.and.returnValue(heisigDetails);

      const result = wordDetailsServiceSpy.getHeisigDetails(word);

      expect(result).toEqual(heisigDetails);
      expect(wordDetailsServiceSpy.getHeisigDetails).toHaveBeenCalledWith(word);
    });
  });

  describe('getSimpleTranslation', () => {
    it('should return the simple translation of the word', (done) => {
      const word = '你好';
      wordDetailsServiceSpy.getSimpleTranslation.and.returnValue(of('hello'));

      wordDetailsServiceSpy
        .getSimpleTranslation(word)
        .subscribe((translation) => {
          expect(translation).toBe('hello');
          done();
        });
    });

    it('should return an empty string if there is an error', (done) => {
      wordDetailsServiceSpy.getSimpleTranslation.and.returnValue(of(''));

      wordDetailsServiceSpy
        .getSimpleTranslation('你好')
        .subscribe((translation) => {
          expect(translation).toBe('');
          done();
        });
    });
  });

  describe('getAllTranslations', () => {
    it('should return all translations of the word', (done) => {
      const word = '你好';
      const mockTranslations = [
        { pinyin: 'ni3', translations: ['you'], usedApi: false },
        { pinyin: 'hao3', translations: ['good'], usedApi: false },
        { pinyin: undefined, translations: ['hello'], usedApi: true },
      ];

      wordDetailsServiceSpy.getAllTranslations.and.returnValue(
        of(mockTranslations)
      );

      wordDetailsServiceSpy
        .getAllTranslations(word)
        .subscribe((translations) => {
          expect(translations).toEqual(mockTranslations);
          done();
        });
    });

    it('should return an empty array if there is an error', (done) => {
      wordDetailsServiceSpy.getAllTranslations.and.returnValue(of([]));

      wordDetailsServiceSpy
        .getAllTranslations('你好')
        .subscribe((translations) => {
          expect(translations).toEqual([]);
          done();
        });
    });
  });

  describe('getDisplayPinyin', () => {
    it('should return true if any pinyin does not match the normalized whole pinyin', (done) => {
      const word = '要';
      const mockTranslations = [
        { pinyin: 'yao1', translations: ['demand'], usedApi: false },
        { pinyin: 'yao4', translations: ['want', 'need'], usedApi: false },
      ];

      wordDetailsServiceSpy.getAllTranslations.and.returnValue(
        of(mockTranslations)
      );
      wordDetailsServiceSpy.getPinyinWithNumbers.and.returnValue('yao4');

      wordDetailsServiceSpy
        .getDisplayPinyin(word)
        .subscribe((displayPinyin) => {
          expect(displayPinyin).toBe(true);
          done();
        });
    });

    it('should return false if all pinyin match the normalized whole pinyin', (done) => {
      const word = '你';
      const mockTranslations = [
        { pinyin: 'ni3', translations: ['you'], usedApi: false },
        { pinyin: 'ni3', translations: ['bla bla'], usedApi: false },
      ];

      wordDetailsServiceSpy.getAllTranslations.and.returnValue(
        of(mockTranslations)
      );
      wordDetailsServiceSpy.getPinyinWithNumbers.and.returnValue('ni3');

      wordDetailsServiceSpy
        .getDisplayPinyin(word)
        .subscribe((displayPinyin) => {
          expect(displayPinyin).toBe(false);
          done();
        });
    });
  });
});
