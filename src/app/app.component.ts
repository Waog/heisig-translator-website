import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterOutlet } from '@angular/router';
import { AudioService } from './play-audio/audio.service';
import { PlayAudioComponent } from './play-audio/play-audio.component';
import { SentenceTranslationComponent } from './sentence-translation/sentence-translation.component';
import { TranslationService } from './sentence-translation/translation.service';
import { PinyinService } from './single-char-translation/pinyin.service';
import { SingleCharTranslationComponent } from './single-char-translation/single-char-translation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    FormsModule,
    CommonModule,
    HttpClientModule,
    SingleCharTranslationComponent,
    PlayAudioComponent,
    SentenceTranslationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [TranslationService, PinyinService, AudioService],
})
export class AppComponent {
  userInput: string = '';

  resetInput(): void {
    this.userInput = '';
  }
}
