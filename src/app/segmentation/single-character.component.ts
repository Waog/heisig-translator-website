import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { pinyin } from 'pinyin-pro';
import { GuessModeToggleOptions } from '../shared/guess-mode-toggle-options.enum';
import { HeisigService } from '../shared/services/heisig.service';

@Component({
  selector: 'app-single-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './single-character.component.html',
  styleUrls: ['./single-character.component.scss'],
})
export class SingleCharacterComponent implements OnChanges, OnInit {
  @Input() hanzi: string = '';
  @Input() guessMode: GuessModeToggleOptions = GuessModeToggleOptions.Show;
  pinyin: string = '';
  heisig: string = '';
  isChinese: boolean = false;
  isRevealed: boolean = false;
  public GuessModeToggleOptions = GuessModeToggleOptions;

  constructor(private heisigService: HeisigService) {}

  ngOnInit(): void {
    this.heisigService.isLoaded().subscribe((loaded) => {
      if (loaded) {
        this.updateCharacter();
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanzi']) {
      this.updateCharacter();
    }

    if (changes['guessMode']) {
      this.isRevealed = false; // Reset reveal state when guessMode changes
    }
  }

  updateCharacter(): void {
    this.pinyin = pinyin(this.hanzi);
    this.heisig = this.heisigService.getHeisigEn(this.hanzi) || this.hanzi;
    this.isChinese = this.isChineseCharacter(this.hanzi);
  }

  isChineseCharacter(char: string): boolean {
    const chineseCharacterRegex = /[\u4e00-\u9fff]/;
    return chineseCharacterRegex.test(char);
  }

  onClick(event: Event): void {
    if (!this.isRevealed && this.guessMode === GuessModeToggleOptions.Hide) {
      this.isRevealed = true; // Reveal the character
      event.stopPropagation(); // Stop the event from propagating
    }
  }
}
