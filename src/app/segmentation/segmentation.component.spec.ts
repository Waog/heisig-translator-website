import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { SegmentationComponent } from './segmentation.component';
import { SingleCharacterComponent } from './single-character.component';

describe('SegmentationComponent', () => {
  let component: SegmentationComponent;
  let fixture: ComponentFixture<SegmentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        SegmentationComponent,
        TranslationAndAudioContainerComponent,
        SingleCharacterComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SegmentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
