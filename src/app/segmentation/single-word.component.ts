import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { smoothenHeisig } from '../shared/helper';
import { AudioService } from '../shared/services/audio.service';
import { HeisigService } from '../shared/services/heisig.service';
import {
  Language,
  TranslationService,
} from '../shared/services/translation.service';
import { SingleCharacterComponent } from './single-character.component';
import { ToggleOptions } from './toggle-options.enum';

@Component({
  selector: 'app-single-word',
  standalone: true,
  imports: [CommonModule, SingleCharacterComponent],
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.scss'],
  providers: [AudioService],
})
export class SingleWordComponent implements OnChanges, OnInit {
  @Input() hanziWord: string = '';
  @Input() isSelected: boolean = false;
  @Input() toggleOption: ToggleOptions = ToggleOptions.Chinese;
  @Output() wordClicked: EventEmitter<string> = new EventEmitter<string>();
  hanziCharacters: string[] = [];
  public translation: string = '';
  isApiTranslation: boolean = false;

  constructor(
    private translationService: TranslationService,
    private heisigService: HeisigService,
    private audioService: AudioService
  ) {}

  ngOnInit(): void {
    this.heisigService.isLoaded().subscribe((loaded) => {
      if (loaded) {
        this.translateWord();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanziWord']) {
      this.hanziCharacters = Array.from(this.hanziWord);
      this.translateWord();
    }
  }

  translateWord(): void {
    this.translationService
      .getTranslation(this.hanziWord, Language.EN)
      .subscribe((translationResult) => {
        this.translation = smoothenHeisig(translationResult.translation);
        this.isApiTranslation = translationResult.usedApi;
      });
  }

  onWordClick(event: Event): void {
    event.stopPropagation();
    this.wordClicked.emit(this.hanziWord);

    switch (this.toggleOption) {
      case ToggleOptions.Off:
        break;
      case ToggleOptions.Word:
        this.audioService.playAudio(this.translation, 'en-US');
        break;
      case ToggleOptions.Chinese:
        this.audioService.playAudio(this.hanziWord, 'zh-CN');
        break;
      case ToggleOptions.Heisig:
        const heisigSentence = smoothenHeisig(
          this.heisigService.getHeisigSentenceEn(this.hanziWord)
        );
        this.audioService.playAudio(heisigSentence, 'en-US');
        break;
      default:
        break;
    }
  }
}