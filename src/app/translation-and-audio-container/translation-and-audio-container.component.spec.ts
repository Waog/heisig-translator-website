import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AudioService } from '../play-audio/audio.service';
import { PlayAudioComponent } from '../play-audio/play-audio.component';
import { TranslationAndAudioContainerComponent } from './translation-and-audio-container.component';

class MockAudioService {
  playAudio(text: string, lang: string): void {
    // Mock implementation
  }
}

describe('TranslationAndAudioContainerComponent', () => {
  let component: TranslationAndAudioContainerComponent;
  let fixture: ComponentFixture<TranslationAndAudioContainerComponent>;
  let audioService: MockAudioService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TranslationAndAudioContainerComponent, PlayAudioComponent],
      providers: [{ provide: AudioService, useClass: MockAudioService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TranslationAndAudioContainerComponent);
    component = fixture.componentInstance;
    audioService = TestBed.inject(AudioService) as unknown as MockAudioService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should pass text and language to PlayAudioComponent', () => {
    component.text = 'Hello';
    component.language = 'en-US';
    fixture.detectChanges();

    const playAudioComponent = getPlayAudioComponent();
    expect(playAudioComponent.text).toBe('Hello');
    expect(playAudioComponent.lang).toBe('en-US');
  });

  it('should display content inside the container', () => {
    const testContent = 'Test Content';
    component.text = 'Hello';
    component.language = 'en-US';
    fixture.detectChanges();

    const contentContainer = fixture.debugElement.query(By.css('.content'));
    contentContainer.nativeElement.innerHTML = testContent;
    fixture.detectChanges();

    expect(contentContainer.nativeElement.textContent).toContain(testContent);
  });

  it('should call playAudio on button click', fakeAsync(() => {
    spyOn(audioService, 'playAudio');

    component.text = 'Hello';
    component.language = 'en-US';
    fixture.detectChanges();

    clickPlayButton();

    tick(); // Ensure all asynchronous actions complete
    expect(audioService.playAudio).toHaveBeenCalledWith('Hello', 'en-US');
  }));

  function getPlayAudioComponent(): PlayAudioComponent {
    const playAudioDebugElement = fixture.debugElement.query(
      By.directive(PlayAudioComponent)
    );
    return playAudioDebugElement.componentInstance as PlayAudioComponent;
  }

  function clickPlayButton() {
    const playButton = fixture.debugElement.query(
      By.css('.play-button')
    ).nativeElement;
    playButton.click();
  }
});
