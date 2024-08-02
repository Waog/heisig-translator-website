import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { DecompositionComponent } from './decomposition.component';
import { SingleCharacterComponent } from './single-character.component';

describe('DecompositionComponent', () => {
  let component: DecompositionComponent;
  let fixture: ComponentFixture<DecompositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        DecompositionComponent,
        TranslationAndAudioContainerComponent,
        SingleCharacterComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DecompositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
