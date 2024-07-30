import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { pinyin } from 'pinyin-pro';
import { mapping } from '../mapping';

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

  ngOnInit(): void {
    this.pinyin = pinyin(this.hanzi);
    this.heisig = mapping[this.hanzi] || this.hanzi;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hanzi']) {
      this.pinyin = pinyin(this.hanzi);
      this.heisig = mapping[this.hanzi] || this.hanzi;
    }
  }
}
