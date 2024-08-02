import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AudioService } from '../shared/services/audio.service';
import { TranslationAndAudioContainerComponent } from './translation-and-audio-container.component';

describe('TranslationAndAudioContainerComponent', () => {
  let component: TranslationAndAudioContainerComponent;
  let fixture: ComponentFixture<TranslationAndAudioContainerComponent>;
  let audioService: AudioService;

  beforeEach(async () => {
    await configureTestingModule();
    createComponent();
    spyOn(window.speechSynthesis, 'speak'); // Mocking speechSynthesis
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call speechSynthesis.speak with correct text and language', async () => {
    setComponentInputs('Hello', 'en-US');
    clickContainerElement();
    await fixture.whenStable(); // Ensure all asynchronous operations complete

    expect(window.speechSynthesis.speak).toHaveBeenCalled();
    const utterance = (
      window.speechSynthesis.speak as jasmine.Spy
    ).calls.mostRecent().args[0] as SpeechSynthesisUtterance;
    expect(utterance.text).toBe('Hello');
    expect(utterance.lang).toBe('en-US');
  });

  it('should display content inside the container', () => {
    setComponentInputs('Hello', 'en-US');
    setContent('Test Content');
    expectContentToContain('Test Content');
  });

  // Helper methods
  async function configureTestingModule() {
    await TestBed.configureTestingModule({
      imports: [TranslationAndAudioContainerComponent], // Importing standalone component
      providers: [AudioService], // Use the original service
    }).compileComponents();
  }

  function createComponent() {
    fixture = TestBed.createComponent(TranslationAndAudioContainerComponent);
    component = fixture.componentInstance;
    audioService = TestBed.inject(AudioService);
    fixture.detectChanges();
  }

  function setComponentInputs(text: string, language: string) {
    component.text = text;
    component.language = language;
    fixture.detectChanges();
  }

  function clickContainerElement() {
    const containerElement = fixture.debugElement.query(
      By.css('.translation-audio-container')
    ).nativeElement;
    containerElement.click();
  }

  function setContent(content: string) {
    const contentContainer = fixture.debugElement.query(
      By.css('.content')
    ).nativeElement;
    contentContainer.innerHTML = content;
    fixture.detectChanges();
  }

  function expectContentToContain(content: string) {
    const contentContainer = fixture.debugElement.query(
      By.css('.content')
    ).nativeElement;
    expect(contentContainer.textContent).toContain(content);
  }
});
