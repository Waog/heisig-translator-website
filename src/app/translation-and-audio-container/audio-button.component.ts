import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AudioService } from '../shared/services/audio.service';

@Component({
  selector: 'app-audio-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-button.component.html',
  styleUrls: ['./audio-button.component.scss'],
  providers: [AudioService],
})
export class AudioButtonComponent {
  @Input() text: string = '';
  @Input() language: string = '';
  @Input() label: string = '';

  constructor(private audioService: AudioService) {}

  playAudio(): void {
    this.audioService.playAudio(this.text, this.language);
  }
}
