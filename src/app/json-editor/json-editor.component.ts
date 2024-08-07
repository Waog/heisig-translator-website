import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './json-editor.component.html',
  styleUrls: ['./json-editor.component.scss'],
})
export class JsonEditorComponent implements OnInit {
  @Input() jsonObject: any;
  @Output() jsonObjectChange = new EventEmitter<any>();

  ngOnInit() {
    if (typeof this.jsonObject === 'string') {
      this.jsonObject = JSON.parse(this.jsonObject);
    }
  }

  onInputChange() {
    this.jsonObjectChange.emit(this.jsonObject);
  }
}
