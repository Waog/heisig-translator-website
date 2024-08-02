import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AudioService } from '../shared/services/audio.service';
import { TranslationAndAudioContainerComponent } from '../translation-and-audio-container/translation-and-audio-container.component';
import { WordDetailsComponent } from './word-details.component';
import { WordDetailsService } from './word-details.service';

describe('WordDetailsComponent', () => {
  let component: WordDetailsComponent;
  let fixture: ComponentFixture<WordDetailsComponent>;
  let wordDetailsServiceSpy: jasmine.SpyObj<WordDetailsService>;
  let audioServiceSpy: jasmine.SpyObj<AudioService>;

  beforeEach(async () => {
    wordDetailsServiceSpy = jasmine.createSpyObj('WordDetailsService', [
      'getPinyin',
      'getHeisigDetails',
      'getSimpleTranslation',
      'getOnlineTranslation',
      'getAllTranslations',
      'getDisplayPinyin',
    ]);
    audioServiceSpy = jasmine.createSpyObj('AudioService', ['playAudio']);

    await TestBed.configureTestingModule({
      imports: [TranslationAndAudioContainerComponent, WordDetailsComponent],
      providers: [
        { provide: WordDetailsService, useValue: wordDetailsServiceSpy },
        { provide: AudioService, useValue: audioServiceSpy },
      ],
    })
      .overrideComponent(WordDetailsComponent, {
        set: {
          providers: [
            { provide: WordDetailsService, useValue: wordDetailsServiceSpy },
            { provide: AudioService, useValue: audioServiceSpy },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(WordDetailsComponent);
    component = fixture.componentInstance;
  });

  beforeEach(() => {
    wordDetailsServiceSpy.getPinyin.and.returnValue('ni hao');
    wordDetailsServiceSpy.getHeisigDetails.and.returnValue([
      { hanzi: '你', heisig: 'you' },
      { hanzi: '好', heisig: 'good' },
    ]);
    wordDetailsServiceSpy.getSimpleTranslation.and.returnValue(of('hello'));
    wordDetailsServiceSpy.getOnlineTranslation.and.returnValue(
      of('online hello')
    );
    wordDetailsServiceSpy.getAllTranslations.and.returnValue(
      of([
        { pinyin: 'ni3hao3', english: ['hello!'] },
        { pinyin: 'ni3hao3', english: ['hiho!'] },
      ])
    );
    wordDetailsServiceSpy.getDisplayPinyin.and.returnValue(of(false));

    component.wordHanzi = '你好';

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct pinyin', () => {
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('ni hao');
  });

  it('should display the simple translation', (done) => {
    component.simpleTranslation$.subscribe((translation) => {
      expect(translation).toBe('hello');
      done();
    });
  });

  it('should display the online translation', (done) => {
    component.onlineTranslation$.subscribe((translation) => {
      expect(translation).toBe('online hello');
      done();
    });
  });

  it('should display Heisig details', () => {
    const compiled = fixture.nativeElement;
    const heisigElements = compiled.querySelectorAll('ul.heisig li');
    expect(heisigElements[0].textContent).toContain('你 - you');
    expect(heisigElements[1].textContent).toContain('好 - good');
  });

  it('should play audio on initialization', () => {
    expect(audioServiceSpy.playAudio).toHaveBeenCalledWith('你好', 'zh-CN');
  });

  it('should play audio when the playAudio method is called', () => {
    const event = new Event('click');
    component.playAudio(event, 'hello', 'en-US');
    expect(audioServiceSpy.playAudio).toHaveBeenCalledWith('hello', 'en-US');
  });
});
