import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { JsonEditorComponent } from '../json-editor/json-editor.component';

@Component({
  selector: 'app-local-storage',
  standalone: true,
  imports: [CommonModule, FormsModule, JsonEditorComponent],
  templateUrl: './local-storage.component.html',
  styleUrls: ['./local-storage.component.scss'],
})
export class LocalStorageComponent implements OnInit {
  newKey: string = '';
  newValue: string = '';
  localStorageItems: {
    key: string;
    value: string;
    isJson: boolean;
    editableKey: string;
    editableValue: string;
    edited: boolean;
  }[] = [];

  ngOnInit() {
    this.loadLocalStorageItems();
  }

  saveItem() {
    if (this.newKey && this.newValue) {
      localStorage.setItem(this.newKey, this.newValue);
      this.newKey = '';
      this.newValue = '';
      this.loadLocalStorageItems();
    }
  }

  loadLocalStorageItems() {
    this.localStorageItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        const value = localStorage.getItem(key) || '';
        const isJson = this.isJsonString(value);
        this.localStorageItems.push({
          key,
          value,
          isJson,
          editableKey: key,
          editableValue: value,
          edited: false,
        });
      }
    }

    // Sort items alphabetically by key
    this.localStorageItems.sort((a, b) => a.key.localeCompare(b.key));
  }

  deleteItem(key: string) {
    localStorage.removeItem(key);
    this.loadLocalStorageItems();
  }

  saveEditedItem(item: {
    key: string;
    editableKey: string;
    editableValue: string;
  }) {
    if (item.key !== item.editableKey) {
      localStorage.removeItem(item.key);
    }
    localStorage.setItem(item.editableKey, item.editableValue);
    this.loadLocalStorageItems();
  }

  isJsonString(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  updateJson(key: string, updatedJson: any) {
    const item = this.localStorageItems.find((item) => item.key === key);
    if (item) {
      item.editableValue = JSON.stringify(updatedJson, null, 2);
      item.edited = true;
    }
  }

  onInputChange(item: {
    key: string;
    value: string;
    editableKey: string;
    editableValue: string;
    edited: boolean;
  }) {
    item.edited =
      item.key !== item.editableKey || item.value !== item.editableValue;
  }
}
