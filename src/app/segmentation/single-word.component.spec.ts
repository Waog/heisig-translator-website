import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { DictionaryService } from '../shared/services/dictionary.service';
import { HeisigService } from '../shared/services/heisig.service';
import { TranslationService } from '../shared/services/translation.service';
import { SingleWordComponent } from './single-word.component';

describe('SingleWordComponent', () => {
  let component: SingleWordComponent;
  let fixture: ComponentFixture<SingleWordComponent>;
  let heisigServiceSpy: jasmine.SpyObj<HeisigService>;
  let dictionaryServiceSpy: jasmine.SpyObj<DictionaryService>;
  let translationServiceSpy: jasmine.SpyObj<TranslationService>;

  beforeEach(async () => {
    heisigServiceSpy = await configureTestingModule();
    dictionaryServiceSpy = TestBed.inject(
      DictionaryService
    ) as jasmine.SpyObj<DictionaryService>;
    translationServiceSpy = TestBed.inject(
      TranslationService
    ) as jasmine.SpyObj<TranslationService>;
    ({ fixture, component } = createComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use HeisigService for single character translation', () => {
    setHeisigServiceSpyReturnValue('good');
    triggerHanziWordChange('好');

    expect(getElementText('.word-label')).toBe('good');
    expect(component.isApiTranslation).toBeFalse();
  });

  it('should use DictionaryService for local translation if available', () => {
    dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
    dictionaryServiceSpy.translate.and.returnValue('local translation');
    triggerHanziWordChange('词');

    expect(getElementText('.word-label')).toBe('local translation');
    expect(component.isApiTranslation).toBeFalse();
  });

  it('should use TranslationService for API translation if local translation is not available', () => {
    dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
    dictionaryServiceSpy.translate.and.returnValue(null);
    translationServiceSpy.translate.and.returnValue(
      of({ responseData: { translatedText: 'api translation' } })
    );
    triggerHanziWordChange('词');

    expect(getElementText('.word-label')).toBe('api translation');
    expect(component.isApiTranslation).toBeTrue();
  });

  it('should handle translation error gracefully', () => {
    dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
    dictionaryServiceSpy.translate.and.returnValue(null);
    translationServiceSpy.translate.and.returnValue(throwError('error'));
    triggerHanziWordChange('词');

    expect(getElementText('.word-label')).toBe('Translation not found');
    expect(component.isApiTranslation).toBeFalse();
  });

  it('should handle non-Chinese characters correctly', () => {
    triggerHanziWordChange('hello');

    expect(getElementText('.word-label')).toBe('hello');
    expect(component.isApiTranslation).toBeFalse();
  });

  it('should emit wordClicked event on click', () => {
    spyOn(component.wordClicked, 'emit');
    const wordContainer = fixture.debugElement.query(
      By.css('.word-container')
    ).nativeElement;
    wordContainer.click();

    expect(component.wordClicked.emit).toHaveBeenCalledWith(
      component.hanziWord
    );
  });

  async function configureTestingModule() {
    const heisigSpy = jasmine.createSpyObj('HeisigService', ['getHeisigEn']);
    const dictionarySpy = jasmine.createSpyObj('DictionaryService', [
      'isLoaded',
      'translate',
    ]);
    const translationSpy = jasmine.createSpyObj('TranslationService', [
      'translate',
    ]);

    await TestBed.configureTestingModule({
      imports: [SingleWordComponent],
      providers: [
        { provide: HeisigService, useValue: heisigSpy },
        { provide: DictionaryService, useValue: dictionarySpy },
        { provide: TranslationService, useValue: translationSpy },
      ],
    }).compileComponents();

    return TestBed.inject(HeisigService) as jasmine.SpyObj<HeisigService>;
  }

  function createComponent() {
    const fixture = TestBed.createComponent(SingleWordComponent);
    const component = fixture.componentInstance;
    return { fixture, component };
  }

  function setHeisigServiceSpyReturnValue(value: string) {
    heisigServiceSpy.getHeisigEn.and.returnValue(value);
  }

  function triggerHanziWordChange(hanziWord: string) {
    component.hanziWord = hanziWord;
    component.ngOnChanges({
      hanziWord: {
        currentValue: hanziWord,
        previousValue: '',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
  }

  function getElementText(selector: string) {
    return fixture.debugElement
      .query(By.css(selector))
      .nativeElement.textContent.trim();
  }
});
