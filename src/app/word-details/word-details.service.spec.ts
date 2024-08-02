import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { heisigMapping } from '../shared/heisig-mapping';
import { DictionaryService } from '../shared/services/dictionary.service';
import { PinyinService } from '../shared/services/pinyin.service';
import { TranslationService } from '../shared/services/translation.service';
import { WordDetailsService } from './word-details.service';

describe('WordDetailsService', () => {
  let service: WordDetailsService;
  let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;
  let pinyinServiceSpy: jasmine.SpyObj<PinyinService>;

  beforeEach(() => {
    const dictionarySpy = jasmine.createSpyObj('DictionaryService', [
      'isLoaded',
      'translate',
      'getAllTranslations',
    ]);
    const translationSpy = jasmine.createSpyObj('TranslationService', [
      'translate',
    ]);
    const pinyinSpy = jasmine.createSpyObj('PinyinService', [
      'convertToPinyin',
      'convertToPinyinWithNumbers',
    ]);

    TestBed.configureTestingModule({
      providers: [
        WordDetailsService,
        { provide: DictionaryService, useValue: dictionarySpy },
        { provide: TranslationService, useValue: translationSpy },
        { provide: PinyinService, useValue: pinyinSpy },
      ],
    });
    service = TestBed.inject(WordDetailsService);
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
      heisigMapping['你'] = 'you';
      heisigMapping['好'] = 'good';

      const result = service.getHeisigDetails(word);

      expect(result).toEqual([
        { hanzi: '你', heisig: 'you' },
        { hanzi: '好', heisig: 'good' },
      ]);
    });
  });

  describe('getSimpleTranslation', () => {
    it('should return the simple translation of the word', (done) => {
      const word = '你好';
      dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
      dictionaryServiceSpy.translate.and.returnValue('hello');

      service.getSimpleTranslation(word).subscribe((translation) => {
        expect(translation).toBe('hello');
        done();
      });
    });

    it('should return an empty string if the dictionary is not loaded', (done) => {
      dictionaryServiceSpy.isLoaded.and.returnValue(of(false));

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
        { pinyin: 'ni3', english: ['you'] },
        { pinyin: 'hao3', english: ['good'] },
      ];
      dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
      dictionaryServiceSpy.getAllTranslations.and.returnValue(
        mockTranslations as any
      );

      service.getAllTranslations(word).subscribe((translations) => {
        expect(translations).toEqual(mockTranslations);
        done();
      });
    });

    it('should return an empty array if the dictionary is not loaded', (done) => {
      dictionaryServiceSpy.isLoaded.and.returnValue(of(false));

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
        { pinyin: 'yao1', english: ['demand'] },
        { pinyin: 'yao4', english: ['want', 'need'] },
      ];
      dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
      dictionaryServiceSpy.getAllTranslations.and.returnValue(
        mockTranslations as any
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
        { pinyin: 'ni3', english: ['you'] },
        { pinyin: 'ni3', english: ['bla bla'] },
      ];
      dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
      dictionaryServiceSpy.getAllTranslations.and.returnValue(
        mockTranslations as any
      );
      pinyinServiceSpy.convertToPinyinWithNumbers.and.returnValue('ni3');

      service.getDisplayPinyin(word).subscribe((displayPinyin) => {
        expect(displayPinyin).toBe(false);
        done();
      });
    });
  });

  describe('getOnlineTranslation', () => {
    it('should return the online translation of the word', (done) => {
      const word = '你好';
      const response = { responseData: { translatedText: 'hello' } };
      translationServiceSpy.translate.and.returnValue(of(response));

      service.getOnlineTranslation(word).subscribe((translation) => {
        expect(translation).toBe('hello');
        done();
      });
    });

    it('should return an empty string if there is an error', (done) => {
      const word = '你好';
      translationServiceSpy.translate.and.returnValue(
        new Observable((observer) => {
          observer.error('Error');
        })
      );

      service.getOnlineTranslation(word).subscribe((translation) => {
        expect(translation).toBe('');
        done();
      });
    });
  });
});
