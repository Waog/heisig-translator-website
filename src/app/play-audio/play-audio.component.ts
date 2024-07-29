import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AudioService } from './audio.service';

@Component({
  selector: 'app-play-audio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './play-audio.component.html',
  styleUrls: ['./play-audio.component.scss'],
})
export class PlayAudioComponent {
  @Input() text: string = '';
  @Input() lang: string = '';

  constructor(private audioService: AudioService) {}

  playAudio(): void {
    this.audioService.playAudio(this.text, this.lang);
  }
}
