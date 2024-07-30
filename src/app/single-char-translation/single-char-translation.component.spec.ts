import { CommonModule } from '@angular/common';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SingleCharTranslationComponent } from './single-char-translation.component';
import { SingleCharacterComponent } from './single-character.component';

describe('SingleCharTranslationComponent', () => {
  let component: SingleCharTranslationComponent;
  let fixture: ComponentFixture<SingleCharTranslationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SingleCharTranslationComponent,
        TranslationAndAudioContainerComponent,
        SingleCharacterComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SingleCharTranslationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update hanziSentence on input change', fakeAsync(() => {
    component.userInput = '你好';
    component.ngOnChanges({
      userInput: {
        currentValue: '你好',
        previousValue: '',
        firstChange: false,
        isFirstChange: () => false,
      },
    });
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const hanziElements = fixture.debugElement.queryAll(By.css('.hanzi'));
    expect(hanziElements.length).toBe(2);
    expect(hanziElements[0].nativeElement.textContent).toBe('你');
    expect(hanziElements[1].nativeElement.textContent).toBe('好');
  }));
});
