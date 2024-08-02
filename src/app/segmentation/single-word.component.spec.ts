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
    heisigServiceSpy = jasmine.createSpyObj('HeisigService', ['getHeisigEn']);
    dictionaryServiceSpy = jasmine.createSpyObj('DictionaryService', [
      'isLoaded',
      'translate',
    ]);
    translationServiceSpy = jasmine.createSpyObj('TranslationService', [
      'getTranslation',
    ]);

    await TestBed.configureTestingModule({
      declarations: [SingleWordComponent],
      providers: [
        { provide: HeisigService, useValue: heisigServiceSpy },
        { provide: DictionaryService, useValue: dictionaryServiceSpy },
        { provide: TranslationService, useValue: translationServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleWordComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should use HeisigService for single character translation', () => {
    heisigServiceSpy.getHeisigEn.and.returnValue('good');
    translationServiceSpy.getTranslation.and.returnValue(
      of({ translation: 'good', usedApi: false })
    );
    triggerHanziWordChange('好');

    expect(getElementText('.word-label')).toBe('good');
    expect(component.isApiTranslation).toBeFalse();
  });

  it('should use DictionaryService for local translation if available', () => {
    dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
    dictionaryServiceSpy.translate.and.returnValue('local translation');
    translationServiceSpy.getTranslation.and.returnValue(
      of({ translation: 'local translation', usedApi: false })
    );
    triggerHanziWordChange('词');

    expect(getElementText('.word-label')).toBe('local translation');
    expect(component.isApiTranslation).toBeFalse();
  });

  it('should use TranslationService for API translation if local translation is not available', () => {
    dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
    dictionaryServiceSpy.translate.and.returnValue(undefined);
    translationServiceSpy.getTranslation.and.returnValue(
      of({ translation: 'api translation', usedApi: true })
    );
    triggerHanziWordChange('词');

    expect(getElementText('.word-label')).toBe('api translation');
    expect(component.isApiTranslation).toBeTrue();
    expect(isElementItalic('.word-label')).toBeTrue();
  });

  it('should handle translation error gracefully', () => {
    dictionaryServiceSpy.isLoaded.and.returnValue(of(true));
    dictionaryServiceSpy.translate.and.returnValue(undefined);
    translationServiceSpy.getTranslation.and.returnValue(throwError('error'));
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

  function getElementText(selector: string): string {
    return fixture.debugElement
      .query(By.css(selector))
      .nativeElement.textContent.trim();
  }

  function isElementItalic(selector: string): boolean {
    const element = fixture.debugElement.query(By.css(selector)).nativeElement;
    const fontStyle = window.getComputedStyle(element).fontStyle;
    return fontStyle === 'italic';
  }
});
