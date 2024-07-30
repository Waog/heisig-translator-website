import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AudioService } from './audio.service';

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

  constructor(private audioService: AudioService) {}

  playAudio(): void {
    this.audioService.playAudio(this.text, this.language);
  }
}
