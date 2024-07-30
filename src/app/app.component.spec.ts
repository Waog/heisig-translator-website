import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { InputTextComponent } from './input-text/input-text.component';
import { SentenceTranslationComponent } from './sentence-translation/sentence-translation.component';
import { TranslationService } from './sentence-translation/translation.service';
import { PinyinService } from './single-char-translation/pinyin.service';
import { SingleCharTranslationComponent } from './single-char-translation/single-char-translation.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        HttpClientTestingModule,
        RouterModule.forRoot([]),
      ],
      providers: [
        TranslationService,
        PinyinService,
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should update userInput when input changes', () => {
    const inputTextComponent = fixture.debugElement.query(
      By.directive(InputTextComponent)
    );
    inputTextComponent.componentInstance.userInputChange.emit('Hello');

    expect(component.userInput).toBe('Hello');
  });

  it('should pass userInput to sentence translation components', () => {
    component.userInput = 'Hello';
    fixture.detectChanges();

    const sentenceTranslationComponents = fixture.debugElement.queryAll(
      By.directive(SentenceTranslationComponent)
    );
    expect(sentenceTranslationComponents[0].componentInstance.userInput).toBe(
      'Hello'
    );
    expect(sentenceTranslationComponents[1].componentInstance.userInput).toBe(
      'Hello'
    );
  });

  it('should pass userInput to single char translation component', () => {
    component.userInput = 'Hello';
    fixture.detectChanges();

    const singleCharTranslationComponent = fixture.debugElement.query(
      By.directive(SingleCharTranslationComponent)
    );
    expect(singleCharTranslationComponent.componentInstance.userInput).toBe(
      'Hello'
    );
  });
});
