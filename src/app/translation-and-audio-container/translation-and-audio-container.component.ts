import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AudioService } from '../shared/services/audio.service';

interface ButtonConfig {
  text: string;
  language: string;
  label: string;
}

@Component({
  selector: 'app-translation-and-audio-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './translation-and-audio-container.component.html',
  styleUrls: ['./translation-and-audio-container.component.scss'],
  providers: [AudioService],
})
export class TranslationAndAudioContainerComponent {
  @Input() buttonConfigs: ButtonConfig[] = [];

  constructor(private audioService: AudioService) {}

  playAudio(text: string, language: string): void {
    this.audioService.playAudio(text, language);
  }
}
