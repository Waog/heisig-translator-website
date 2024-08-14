import { CommonModule } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { routes } from './app.routes';
import { NavigationComponent } from './navigation/navigation.component';
import { SingleCharacterComponent } from './segmentation/single-character.component';
import { SingleWordComponent } from './segmentation/single-word.component';
import { SentenceTranslationComponent } from './sentence-translation/sentence-translation.component';
import { TranslatorComponent } from './translator/translator.component';
import { VocabularyComponent } from './vocabulary/vocabulary.component';
import { DictionaryOccurrencesComponent } from './word-details/dictionary-occurrences.component';
import { HeisigDetailsComponent } from './word-details/heisig-details.component';
import { WordDetailsComponent } from './word-details/word-details.component';

describe('Integration: AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;
  let httpTestingController: HttpTestingController;
  let router: Router;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule.withRoutes(routes), // Use the predefined routes
        AppComponent,
        NavigationComponent,
      ],
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
    router = TestBed.inject(Router);
    router.initialNavigation();
    fixture.detectChanges();
  }));

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should create the app', async () => {
    mockHeisig([]);
    mockLocalDictionary([]);
    mockTatoebaData([]);
    expect(component).toBeTruthy();
  });

  it('should navigate to /translator on load', waitForAsync(() => {
    router.navigate(['/translator']).then(() => {
      fixture.detectChanges();
      expect(router.url).toBe('/translator');

      const translatorComponent = fixture.debugElement.query(
        By.directive(TranslatorComponent)
      );
      expect(translatorComponent).not.toBeNull();

      mockLocalDictionary([]);
      mockHeisig([]);
      mockTatoebaData([]);
    });
  }));

  it('should navigate to /vocabulary on clicking vocabulary link', waitForAsync(() => {
    router.navigate(['/vocabulary']).then(() => {
      fixture.detectChanges();
      expect(router.url).toBe('/vocabulary');

      const vocabularyComponent = fixture.debugElement.query(
        By.directive(VocabularyComponent)
      );
      expect(vocabularyComponent).not.toBeNull();

      mockLocalDictionary([]);
      mockHeisig([]);
      mockTatoebaData([]);
    });
  }));

  it('should wait for the user input to finish', async () => {
    await router.navigate(['/translator']);
    fixture.detectChanges();

    await setUserInput('你');
    mockLocalDictionary([]);
    mockHeisig([]);
    mockFrequencyData([]);
    mockTatoebaData([]);
    await wait(500);
    const text1 = getElementText(SentenceTranslationComponent, 0);
    const text2 = getElementText(SentenceTranslationComponent, 1);

    expect(text1).toContain('Waiting until input stops...');
    expect(text2).toContain('Waiting until input stops...');
  });

  it('Golden Path: input 你好 -> click 你好-word -> click 你-heisig', async () => {
    await router.navigate(['/translator']);
    fixture.detectChanges();

    const userInput = '你好Oli!';

    await setUserInput(userInput);

    const heisigJson = [
      {
        Keyword: 'you',
        KeyworddeDEGoogleTranslate: 'Du',
        Hanzi: '你',
        HeisigNumber: 799,
        Story:
          "Mr. T knows you better than you. That's why you listen to everything he tells you.",
        StorydeDEGoogleTranslate:
          'Herr T. kennt Sie besser als Sie. Deshalb hörst du dir alles an, was er dir sagt.',
        StrokeCount: 7,
        Pinyin: 'nǐ',
        ComponentsFlatHanzi: '欠\n人\np.<img src="rsh-drop.jpg">\n尔\n小',
        ComponentsFlatPinyin: 'qiàn\nrén\n\něr\nxiǎo',
        ComponentsFlatKeywords:
          'lack (v.)\nperson\np.A drop of\nyou (literary)\nsmall',
        ComponentsFlatKeywordsdeDE:
          'Mangel (v.)\nPerson\np.Ein Tropfen\ndu (literarisch)\nklein',
      },
      {
        Keyword: 'good',
        KeyworddeDEGoogleTranslate: 'Gut',
        Hanzi: '好',
        HeisigNumber: 103,
        Story: 'A good mother is a woman who always takes care of her child.',
        StorydeDEGoogleTranslate:
          'Eine gute Mutter ist eine Frau, die sich immer um ihr Kind kümmert.',
        StrokeCount: 6,
        Pinyin: 'hǎo',
        ComponentsFlatHanzi: '子\n女',
        ComponentsFlatPinyin: 'zǐ\nnǚ',
        ComponentsFlatKeywords: 'child\nwoman',
        ComponentsFlatKeywordsdeDE: 'Kind\nFrau',
      },
    ];
    mockHeisig(heisigJson);

    const dictionary = [
      { simplified: '你好', pinyin: 'ni3 hao3', english: ['hello', 'hi'] },
      {
        simplified: '你',
        pinyin: 'ni3',
        english: ['you (informal)', 'you (bla)'],
      },
    ];
    mockLocalDictionary(dictionary);

    mockTatoebaData([]);

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

    mockFrequencyData([]);

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

    expect(getElementText(HeisigDetailsComponent, 0)).toContain('你 – you');
    expect(getElementText(HeisigDetailsComponent, 1)).toContain('好 – good');

    clickElement(HeisigDetailsComponent, 0, '.toggle-heisig-details-button');

    clickElement(HeisigDetailsComponent, 0, '.toggle-occurrences-button');

    expect(
      getElementText(DictionaryOccurrencesComponent, 0, '.hanzi-column', 0)
    ).toContain('你');
    expect(
      getElementText(
        DictionaryOccurrencesComponent,
        0,
        '.translation-column',
        0
      )
    ).toContain('you (informal)');

    expect(
      getElementText(DictionaryOccurrencesComponent, 0, '.hanzi-column', 1)
    ).toContain('你好');
    expect(
      getElementText(
        DictionaryOccurrencesComponent,
        0,
        '.translation-column',
        1
      )
    ).toContain('hello');
  });

  it('should use cached translations from localStorage', async () => {
    await router.navigate(['/translator']);
    fixture.detectChanges();

    localStorage.setItem('onlineTranslationCacheDE', '{"你好":"Hallo"}');
    localStorage.setItem('onlineTranslationCacheEN', '{"你好":"Hello"}');

    const userInput = '你好';

    await setUserInput(userInput);

    mockHeisig([]);
    mockFrequencyData([]);
    mockTatoebaData([]);

    const dictionary = [
      { simplified: '你好', pinyin: 'ni3 hao3', english: ['hello', 'hi'] },
    ];
    mockLocalDictionary(dictionary);

    await wait(1000);

    expect(getSentenceComponentText(0)).toContain('Hello');
    expect(getSentenceComponentText(1)).toContain('Hallo');

    httpTestingController.expectNone((req) =>
      req.url.includes('translated.net')
    );
  });

  async function setUserInput(input: string): Promise<void> {
    const inputElement = fixture.debugElement.query(
      By.css('input#userInput')
    ).nativeElement;
    inputElement.value = input;
    inputElement.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return new Promise((resolve) => setTimeout(resolve, 0));
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
    fixture.detectChanges();
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

  function mockHeisig(heisigJson: any[]): void {
    mockHttpResponse('GET', 'assets/heisig.json', heisigJson);
  }

  function mockFrequencyData(frequencyJson: any[]): void {
    mockHttpResponse('GET', 'assets/subtlexch.json', frequencyJson);
  }

  function mockTatoebaData(tatoebaJson: any[]): void {
    mockHttpResponse('GET', 'assets/tatoeba.json', tatoebaJson);
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

  function mockHttpResponse(method: string, url: string, body: any): void {
    const req = httpTestingController.expectOne(url);
    if (req.request.method === method) {
      req.flush(body);
    }
    fixture.detectChanges();
  }
});
