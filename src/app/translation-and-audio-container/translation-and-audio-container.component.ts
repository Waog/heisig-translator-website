import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { PlayAudioComponent } from '../play-audio/play-audio.component';

@Component({
  selector: 'app-translation-and-audio-container',
  standalone: true,
  imports: [CommonModule, PlayAudioComponent],
  templateUrl: './translation-and-audio-container.component.html',
  styleUrls: ['./translation-and-audio-container.component.scss'],
})
export class TranslationAndAudioContainerComponent {
  @Input() text: string = '';
  @Input() language: string = '';
}
