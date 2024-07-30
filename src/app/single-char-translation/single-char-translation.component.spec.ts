import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
