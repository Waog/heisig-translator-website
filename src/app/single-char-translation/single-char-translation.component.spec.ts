import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { PinyinService } from './pinyin.service';
import { SingleCharTranslationComponent } from './single-char-translation.component';

describe('SingleCharTranslationComponent', () => {
  let component: SingleCharTranslationComponent;
  let fixture: ComponentFixture<SingleCharTranslationComponent>;
  let pinyinService: PinyinService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SingleCharTranslationComponent,
        TranslationAndAudioContainerComponent,
      ],
      providers: [PinyinService],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleCharTranslationComponent);
    component = fixture.componentInstance;
    pinyinService = TestBed.inject(PinyinService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update pinyin translation on input change', fakeAsync(() => {
    initializeComponent('你好');

    const pinyinText = findElementByText('.pinyin', 'nǐ');
    const hanziText = findElementByText('.hanzi', '你');
    const heisigText = findElementByText('.heisig', 'you');

    expect(pinyinText).toBeTruthy();
    expect(hanziText).toBeTruthy();
    expect(heisigText).toBeTruthy();

    const secondPinyinText = findElementByText('.pinyin', 'hǎo');
    const secondHanziText = findElementByText('.hanzi', '好');
    const secondHeisigText = findElementByText('.heisig', 'good');

    expect(secondPinyinText).toBeTruthy();
    expect(secondHanziText).toBeTruthy();
    expect(secondHeisigText).toBeTruthy();
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
    tick();
    fixture.detectChanges();
  }

  function findElementByText(selector: string, text: string) {
    return fixture.debugElement
      .queryAll(By.css(selector))
      .find((el) => el.nativeElement.textContent === text);
  }
});
