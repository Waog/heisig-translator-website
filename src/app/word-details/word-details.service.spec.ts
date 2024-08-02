import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DictionaryService } from '../shared/services/dictionary.service';
import { HeisigService } from '../shared/services/heisig.service';
import { PinyinService } from '../shared/services/pinyin.service';
import { TranslationService } from '../shared/services/translation.service';
import { WordDetailsService } from './word-details.service';

describe('WordDetailsService', () => {
  let service: WordDetailsService;
  let heisigServiceSpy: jasmine.SpyObj<HeisigService>;
  let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;
  let pinyinServiceSpy: jasmine.SpyObj<PinyinService>;

  beforeEach(() => {
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

    TestBed.configureTestingModule({
      providers: [
        WordDetailsService,
        { provide: HeisigService, useValue: heisigSpy },
        { provide: DictionaryService, useValue: dictionarySpy },
        { provide: TranslationService, useValue: translationSpy },
        { provide: PinyinService, useValue: pinyinSpy },
      ],
    });

    service = TestBed.inject(WordDetailsService);
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
      pinyinServiceSpy.convertToPinyin.and.returnValue([
        { hanzi: '你', pinyin: 'ni' },
        { hanzi: '好', pinyin: 'hao' },
      ]);

      const result = service.getPinyin(word);

      expect(result).toBe('ni hao');
      expect(pinyinServiceSpy.convertToPinyin).toHaveBeenCalledWith(word);
    });
  });

  describe('getPinyinWithNumbers', () => {
    it('should return the pinyin with numbers of the word', () => {
      const word = '你好';
      pinyinServiceSpy.convertToPinyinWithNumbers.and.returnValue('ni3 hao3');

      const result = service.getPinyinWithNumbers(word);

      expect(result).toBe('ni3 hao3');
      expect(pinyinServiceSpy.convertToPinyinWithNumbers).toHaveBeenCalledWith(
        word
      );
    });
  });

  describe('getHeisigDetails', () => {
    it('should return the Heisig details of the word', () => {
      const word = '你好';
      const mapping: { [key: string]: string } = { 你: 'you', 好: 'good' };
      heisigServiceSpy.getHeisigEn.and.callFake((char: string) => {
        return mapping[char] || '??';
      });

      const result = service.getHeisigDetails(word);

      expect(result).toEqual([
        { hanzi: '你', heisig: 'you' },
        { hanzi: '好', heisig: 'good' },
      ]);
      expect(heisigServiceSpy.getHeisigEn.calls.count()).toBe(2);
    });
  });

  describe('getSimpleTranslation', () => {
    it('should return the simple translation of the word', (done) => {
      const word = '你好';
      translationServiceSpy.getTranslation.and.returnValue(
        of({ translation: 'hello', usedApi: false })
      );

      service.getSimpleTranslation(word).subscribe((translation) => {
        expect(translation).toBe('hello');
        done();
      });
    });

    it('should return an empty string if there is an error', (done) => {
      translationServiceSpy.getTranslation.and.returnValue(throwError('error'));

      service.getSimpleTranslation('你好').subscribe((translation) => {
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
      ];
      const mockOnlineTranslation = {
        pinyin: undefined,
        translations: ['hello'],
        usedApi: true,
      };

      translationServiceSpy.getAllTranslations.and.returnValue(
        of([mockOnlineTranslation, ...mockTranslations])
      );

      service.getAllTranslations(word).subscribe((translations) => {
        expect(translations).toEqual([
          mockOnlineTranslation,
          ...mockTranslations,
        ]);
        done();
      });
    });

    it('should return an empty array if there is an error', (done) => {
      translationServiceSpy.getAllTranslations.and.returnValue(
        throwError('error')
      );

      service.getAllTranslations('你好').subscribe((translations) => {
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

      translationServiceSpy.getAllTranslations.and.returnValue(
        of(mockTranslations)
      );
      pinyinServiceSpy.convertToPinyinWithNumbers.and.returnValue('yao4');

      service.getDisplayPinyin(word).subscribe((displayPinyin) => {
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

      translationServiceSpy.getAllTranslations.and.returnValue(
        of(mockTranslations)
      );
      pinyinServiceSpy.convertToPinyinWithNumbers.and.returnValue('ni3');

      service.getDisplayPinyin(word).subscribe((displayPinyin) => {
        expect(displayPinyin).toBe(false);
        done();
      });
    });
  });
});
