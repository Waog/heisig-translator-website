import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { pinyin } from 'pinyin-pro';
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
  pinyin: string = '';
  heisig: string = '';
  isChinese: boolean = false;

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
}
