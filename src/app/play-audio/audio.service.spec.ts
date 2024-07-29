// src/app/audio.service.spec.ts

import { TestBed } from '@angular/core/testing';
import { AudioService } from './audio.service';

describe('AudioService', () => {
  let service: AudioService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AudioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should play audio', () => {
    spyOn(window.speechSynthesis, 'speak');
    service.playAudio('Hello', 'en');
    expect(window.speechSynthesis.speak).toHaveBeenCalled();
  });
});
