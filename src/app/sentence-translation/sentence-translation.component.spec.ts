import { CommonModule } from '@angular/common';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { OnlineTranslationService } from '../shared/services/online-translation.service';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SentenceTranslationComponent } from './sentence-translation.component';

describe('SentenceTranslationComponent', () => {
  let component: SentenceTranslationComponent;
  let fixture: ComponentFixture<SentenceTranslationComponent>;
  let translationService: OnlineTranslationService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        HttpClientTestingModule,
        SentenceTranslationComponent,
        TranslationAndAudioContainerComponent,
      ],
      providers: [OnlineTranslationService],
    }).compileComponents();

    fixture = TestBed.createComponent(SentenceTranslationComponent);
    component = fixture.componentInstance;
    translationService = TestBed.inject(OnlineTranslationService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display waiting message during debounce', fakeAsync(() => {
    initializeComponent('你好！');

    fixture.detectChanges();
    let debounceText = findElementByText('p', 'Waiting until input stops...');
    expect(debounceText).toBeTruthy();

    tick(1000);
    fixture.detectChanges();

    debounceText = findElementByText('p', 'Waiting until input stops...');
    expect(debounceText).toBeFalsy();

    const req = verifyTranslationRequest('你好！', 'zh|en');
    req.flush({ responseData: { translatedText: 'Hello!' } });
  }));

  it('should display translating message during loading', fakeAsync(() => {
    initializeComponent('你好！');

    tick(1000);
    fixture.detectChanges();

    const req = verifyTranslationRequest('你好！', 'zh|en');
    fixture.detectChanges();

    let loadingText = findElementByText('p', 'Translating...');
    expect(loadingText).toBeTruthy();

    req.flush({ responseData: { translatedText: 'Hello!' } });
    tick();
    fixture.detectChanges();

    loadingText = findElementByText('p', 'Translating...');
    expect(loadingText).toBeFalsy();
  }));

  it('should display translation when translation is complete', fakeAsync(() => {
    initializeComponent('你好！');

    tick(1000);
    fixture.detectChanges();

    const req = verifyTranslationRequest('你好！', 'zh|en');
    req.flush({ responseData: { translatedText: 'Hello!' } });
    tick();
    fixture.detectChanges();

    const translationText = findElementByText('p', 'Hello!');
    expect(translationText).toBeTruthy();
  }));

  it('should display translation error message on error', fakeAsync(() => {
    initializeComponent('你好！');

    tick(1000);
    fixture.detectChanges();

    const req = verifyTranslationRequest('你好！', 'zh|en');
    req.error(new ErrorEvent('Network error'));
    tick();
    fixture.detectChanges();

    const errorText = findElementByText('p', 'Translation error');
    expect(errorText).toBeTruthy();
  }));

  function initializeComponent(inputText: string) {
    component.userInput = inputText;
    component.ngOnChanges({
      userInput: {
        currentValue: inputText,
        previousValue: '',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
  }

  function verifyTranslationRequest(inputText: string, langpair: string) {
    const req = httpMock.expectOne(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        inputText
      )}&langpair=${langpair}`
    );
    expect(req.request.method).toBe('GET');
    return req;
  }

  function findElementByText(tag: string, text: string) {
    return fixture.debugElement
      .queryAll(By.css(tag))
      .find((el) => el.nativeElement.textContent === text);
  }
});
