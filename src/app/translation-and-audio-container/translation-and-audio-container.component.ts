import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AudioService } from '../shared/services/audio.service';

@Component({
  selector: 'app-translation-and-audio-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './translation-and-audio-container.component.html',
  styleUrls: ['./translation-and-audio-container.component.scss'],
  providers: [AudioService],
})
export class TranslationAndAudioContainerComponent {
  @Input() text: string = '';
  @Input() language: string = '';
  @Input() text2: string = '';
  @Input() language2: string = '';
  @Input() text3: string = '';
  @Input() language3: string = '';
  @Input() label1: string = '';
  @Input() label2: string = '';
  @Input() label3: string = '';

  constructor(private audioService: AudioService) {}

  playAudio(text: string, language: string): void {
    this.audioService.playAudio(text, language);
  }
}
