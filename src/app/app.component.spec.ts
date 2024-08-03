import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { SingleCharacterComponent } from './segmentation/single-character.component';
import { SingleWordComponent } from './segmentation/single-word.component';
import { SentenceTranslationComponent } from './sentence-translation/sentence-translation.component';
import { WordDetailsComponent } from './word-details/word-details.component';

describe('Integration: AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpTestingController: HttpTestingController;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent, RouterModule.forRoot([])],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    window.speechSynthesis.speak = jasmine.createSpy('speak');

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    httpTestingController = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  }));

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', async () => {
    expect(component).toBeTruthy();
  });

  it('should wait for the user input to finish', async () => {
    await setUserInput('你');
    mockLocalDictionary([]);
    await wait(500);
    const text1 = getElementText(SentenceTranslationComponent, 0);
    const text2 = getElementText(SentenceTranslationComponent, 1);

    expect(text1).toContain('Waiting until input stops...');
    expect(text2).toContain('Waiting until input stops...');
  });

  it('Golden Path: input 你好 -> click 你好-word -> click 你-heisig', async () => {
    const userInput = '你好Oli!';

    await setUserInput(userInput);

    const dictionary = [
      { simplified: '你好', pinyin: 'ni3 hao3', english: ['hello', 'hi'] },
      {
        simplified: '你',
        pinyin: 'ni3',
        english: ['you (informal)', 'you (bla)'],
      },
    ];
    mockLocalDictionary(dictionary);

    expect(getWordComponentText(0)).toBe('hello');
    expect(getWordComponentText(1)).toBe('Oli');
    expect(getWordComponentText(2)).toBe('!');

    expect(getCharComponentText(0, '.pinyin')).toBe('nǐ');
    expect(getCharComponentText(0, '.hanzi')).toBe('你');
    expect(getCharComponentText(0, '.heisig')).toBe('you');

    expect(getCharComponentText(1, '.pinyin')).toBe('hǎo');
    expect(getCharComponentText(1, '.hanzi')).toBe('好');
    expect(getCharComponentText(1, '.heisig')).toBe('good');

    await wait(1000);

    expect(getSentenceComponentText(0)).toContain('Translating...');
    expect(getSentenceComponentText(1)).toContain('Translating...');

    mockOnlineDictionaryResponse({
      chinese: userInput,
      toLang: 'en',
      translation: 'Hello!',
    });
    mockOnlineDictionaryResponse({
      chinese: userInput,
      toLang: 'de',
      translation: 'Hallo!',
    });

    expect(getSentenceComponentText(0)).toContain('Hello!');
    expect(getSentenceComponentText(1)).toContain('Hallo!');

    clickElement(SingleWordComponent, 0, '.word-container');

    await wait(100);

    mockOnlineDictionaryResponse({
      chinese: '你好',
      toLang: 'en',
      translation: 'Hidiho!',
    });

    expect(getElementText(WordDetailsComponent, 0, 'h1')).toBe(
      'hello - 你好 - nǐ hǎo'
    );

    expect(
      getElementText(WordDetailsComponent, 0, '.translations li', 0)
    ).toContain('Hidiho!');
    expect(
      getElementText(WordDetailsComponent, 0, '.translations li', 1)
    ).toContain('hello');
    expect(
      getElementText(WordDetailsComponent, 0, '.translations li', 2)
    ).toContain('hi');

    expect(getElementText(WordDetailsComponent, 0, '.heisig li', 0)).toContain(
      '你 - you'
    );
    expect(getElementText(WordDetailsComponent, 0, '.heisig li', 1)).toContain(
      '好 - good'
    );

    clickElement(WordDetailsComponent, 0, '.heisig li', 0);

    const charWordsSelectorHan = '.translations-grid .grid-row .hanzi-column';
    const charWordsSelectorEng =
      '.translations-grid .grid-row .translation-column';
    expect(
      getElementText(WordDetailsComponent, 0, charWordsSelectorHan, 0)
    ).toContain('你好');
    expect(
      getElementText(WordDetailsComponent, 0, charWordsSelectorEng, 0)
    ).toContain('hello');

    expect(
      getElementText(WordDetailsComponent, 0, charWordsSelectorHan, 1)
    ).toContain('你');
    expect(
      getElementText(WordDetailsComponent, 0, charWordsSelectorEng, 1)
    ).toContain('you (informal)');
  });

  async function setUserInput(input: string): Promise<void> {
    const inputElement = fixture.debugElement.query(
      By.css('input#userInput')
    ).nativeElement;
    inputElement.value = input;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return new Promise((resolve) => setTimeout(resolve, 0)); // Ensure the input event is processed
  }

  function getSentenceComponentText(index: number): string {
    return getElementText(SentenceTranslationComponent, index);
  }

  function getCharComponentText(index: number, selector: string): string {
    return getElementText(SingleCharacterComponent, index, selector);
  }

  function getWordComponentText(index: number): string {
    return getElementText(SingleWordComponent, index, '.word-label');
  }

  function getElementText(
    componentClass: any,
    index: number = 0,
    childSelector: string | undefined = undefined,
    childIndex: number = 0
  ): string {
    return getNativeElement(
      componentClass,
      index,
      childSelector,
      childIndex
    ).textContent.trim();
  }

  function clickElement(
    componentClass: any,
    index: number = 0,
    childSelector: string | undefined = undefined,
    childIndex: number = 0
  ): void {
    const element = getNativeElement(
      componentClass,
      index,
      childSelector,
      childIndex
    );
    element.click();
    fixture.detectChanges(); // Update UI after the click event
  }

  function getNativeElement(
    componentClass: any,
    index: number = 0,
    childSelector: string | undefined = undefined,
    childIndex: number = 0
  ) {
    let element = fixture.debugElement.queryAll(By.directive(componentClass))[
      index
    ];
    if (childSelector) {
      element = element.queryAll(By.css(childSelector))[childIndex];
    }
    return element.nativeElement;
  }

  function wait(milliseconds: number): Promise<void> {
    return new Promise((resolve) =>
      setTimeout(() => {
        fixture.detectChanges();
        resolve();
      }, milliseconds)
    );
  }

  function mockLocalDictionary(dictionaryJson: any[]): void {
    mockHttpResponse('GET', 'assets/cedict.json', dictionaryJson);
  }

  function mockOnlineDictionaryResponse({
    chinese,
    toLang,
    translation,
  }: {
    chinese: string;
    toLang: string;
    translation: string;
  }): void {
    const mockTranslationDe = {
      responseData: { translatedText: translation },
    };
    const encodedInput = encodeURIComponent(chinese);
    const expectedOnlineTranslationUrlDe = `https://api.mymemory.translated.net/get?q=${encodedInput}&langpair=zh|${toLang}`;
    mockHttpResponse('GET', expectedOnlineTranslationUrlDe, mockTranslationDe);
  }

  /**
   * Mocks an HTTP response for a specific method and URL.
   *
   * @param {string} method - The HTTP method (e.g., 'GET', 'POST').
   * @param {string} url - The URL to mock.
   * @param {any} body - The body of the mock response.
   *
   * Usage example:
   *
   * mockHttpResponse('GET', '/api/translate', { translation: 'Hello' });
   */
  function mockHttpResponse(method: string, url: string, body: any): void {
    const req = httpTestingController.expectOne(url);
    if (req.request.method === method) {
      req.flush(body);
    }
    fixture.detectChanges(); // Update UI after the mock response
  }
});
