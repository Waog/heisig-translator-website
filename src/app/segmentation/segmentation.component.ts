import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioButtonComponent } from '../container-with-buttons/audio-button.component';
import { ContainerWithButtonsComponent } from '../container-with-buttons/container-with-buttons.component';
import { ToggleButtonComponent } from '../container-with-buttons/toggle-button.component';
import { SingleWordComponent } from './single-word.component';
import { ToggleOptions } from './toggle-options.enum'; // Import the enum

// @ts-ignore
import { Segment, useDefault } from 'segmentit';
import { smoothenHeisig } from '../shared/helper';
import { HeisigService } from '../shared/services/heisig.service';

@Component({
  selector: 'app-segmentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContainerWithButtonsComponent,
    SingleWordComponent,
    AudioButtonComponent,
    ToggleButtonComponent,
  ],
  templateUrl: './segmentation.component.html',
  styleUrls: ['./segmentation.component.scss'],
})
export class SegmentationComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() userInput: string = '';
  @Input() selectedWord: string = '';
  @Output() wordSelected: EventEmitter<string> = new EventEmitter<string>();
  hanziWords: string[] = [];
  wordsTTS: string = '';
  heisigTTS: string = '';
  selectedToggleOption: ToggleOptions = ToggleOptions.Off;

  private static readonly STORAGE_KEY = 'playWordAudioOption';

  public ToggleOptions = ToggleOptions;

  @ViewChildren(SingleWordComponent)
  singleWordComponents!: QueryList<SingleWordComponent>;

  constructor(private heisigService: HeisigService) {}

  ngOnInit(): void {
    const savedOption = localStorage.getItem(SegmentationComponent.STORAGE_KEY);
    if (
      savedOption &&
      Object.values(ToggleOptions).includes(savedOption as ToggleOptions)
    ) {
      this.selectedToggleOption = savedOption as ToggleOptions;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userInput']) {
      if (this.userInput.length > 0) {
        const segmentit = useDefault(new Segment());
        const result = segmentit.doSegment(this.userInput);
        this.hanziWords = result.map((segment: { w: string }) => segment.w);
      } else {
        this.hanziWords = [];
      }
    }
  }

  ngAfterViewInit() {
    this.singleWordComponents.changes.subscribe(() => {
      setTimeout(() => this.updateTTS(), 1000);
    });

    setTimeout(() => this.updateTTS(), 1000);
  }

  onWordClick(word: string): void {
    this.wordSelected.emit(word);
  }

  updateTTS(): void {
    this.wordsTTS = smoothenHeisig(
      this.singleWordComponents
        .map((component) => component.translation)
        .join(' ')
    );
    this.heisigTTS = smoothenHeisig(
      this.heisigService.getHeisigSentenceEn(this.userInput)
    );
    if (this.wordsTTS.match(/Loading.*.../)) {
      setTimeout(() => this.updateTTS(), 1000);
    }
  }

  onToggleOptionChange(option: string): void {
    if (Object.values(ToggleOptions).includes(option as ToggleOptions)) {
      this.selectedToggleOption = option as ToggleOptions;
      localStorage.setItem(SegmentationComponent.STORAGE_KEY, option);
    }
  }
}