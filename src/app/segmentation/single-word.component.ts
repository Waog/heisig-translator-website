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
import { HeisigService } from '../shared/services/heisig.service';
import { OnlineTranslationService } from '../shared/services/online-translation.service';
import {
  Language,
  TranslationService,
} from '../shared/services/translation.service';
import { SingleCharacterComponent } from './single-character.component';

@Component({
  selector: 'app-single-word',
  standalone: true,
  imports: [CommonModule, SingleCharacterComponent],
  templateUrl: './single-word.component.html',
  styleUrls: ['./single-word.component.scss'],
  providers: [OnlineTranslationService],
})
export class SingleWordComponent implements OnChanges, OnInit {
  @Input() hanziWord: string = '';
  @Input() isSelected: boolean = false;
  @Output() wordClicked: EventEmitter<string> = new EventEmitter<string>();
  hanziCharacters: string[] = [];
  public translation: string = '';
  isApiTranslation: boolean = false;

  constructor(
    private translationService: TranslationService,
    private heisigService: HeisigService
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

  containsChineseCharacters(text: string): boolean {
    const chineseCharacterRegex = /[\u4e00-\u9fff]/;
    return chineseCharacterRegex.test(text);
  }

  onWordClick(event: Event): void {
    event.stopPropagation();
    this.wordClicked.emit(this.hanziWord);
  }
}
