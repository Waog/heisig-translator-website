import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AudioService } from './audio.service';
import { PlayAudioComponent } from './play-audio.component';

describe('PlayAudioComponent', () => {
  let component: PlayAudioComponent;
  let fixture: ComponentFixture<PlayAudioComponent>;
  let audioService: AudioService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayAudioComponent],
      providers: [AudioService],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayAudioComponent);
    component = fixture.componentInstance;
    audioService = TestBed.inject(AudioService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call playAudio on button click', () => {
    spyOn(audioService, 'playAudio');

    component.text = 'Hello';
    component.lang = 'en-US';
    fixture.detectChanges();

    clickButton('.play-button');

    expect(audioService.playAudio).toHaveBeenCalledWith('Hello', 'en-US');
  });

  function clickButton(selector: string) {
    const buttonElement = fixture.debugElement.query(
      By.css(selector)
    ).nativeElement;
    buttonElement.click();
  }
});
