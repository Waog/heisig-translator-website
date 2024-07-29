import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranslationAndAudioContainerComponent } from './translation-and-audio-container.component';

describe('TranslationAndAudioContainerComponent', () => {
  let component: TranslationAndAudioContainerComponent;
  let fixture: ComponentFixture<TranslationAndAudioContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationAndAudioContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranslationAndAudioContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
