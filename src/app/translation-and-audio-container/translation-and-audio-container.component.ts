import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AudioButtonComponent } from './audio-button.component';

interface ButtonConfig {
  text: string;
  language: string;
  label: string;
}

@Component({
  selector: 'app-translation-and-audio-container',
  standalone: true,
  imports: [CommonModule, AudioButtonComponent],
  templateUrl: './translation-and-audio-container.component.html',
  styleUrls: ['./translation-and-audio-container.component.scss'],
})
export class TranslationAndAudioContainerComponent {
  @Input() buttonConfigs: ButtonConfig[] = [];
}
