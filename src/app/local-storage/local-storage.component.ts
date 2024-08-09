import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-local-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './local-storage.component.html',
  styleUrls: ['./local-storage.component.scss'],
})
export class LocalStorageComponent implements OnInit, OnDestroy {
  newKey: string = '';
  newValue: string = '';
  showLocalStorage: boolean = false; // Toggle for showing/hiding the entire form
  localStorageItems: {
    key: string;
    value: any;
    isJson: boolean;
    editableKey: string;
    editableValue: string;
    edited: boolean;
    editorVisible: boolean;
  }[] = [];

  ngOnInit() {
    this.loadLocalStorageItems();
    window.addEventListener('storage', this.handleStorageChange);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.handleStorageChange);
  }

  saveItem() {
    if (this.newKey && this.newValue) {
      const parsedValue = this.parseJson(this.newValue);
      localStorage.setItem(this.newKey, parsedValue);
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
          value: isJson ? JSON.parse(value) : value,
          isJson,
          editableKey: key,
          editableValue: isJson
            ? JSON.stringify(JSON.parse(value), null, 2)
            : value,
          edited: false,
          editorVisible: false,
        });
      }
    }

    // Sort items alphabetically by key
    this.localStorageItems.sort((a, b) => a.key.localeCompare(b.key));
  }

  refreshLocalStorage() {
    this.loadLocalStorageItems();
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
    const parsedValue = this.parseJson(item.editableValue);
    if (item.key !== item.editableKey) {
      localStorage.removeItem(item.key);
    }
    localStorage.setItem(item.editableKey, parsedValue);
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

  parseJson(value: string): string {
    try {
      return JSON.stringify(JSON.parse(value));
    } catch {
      return value;
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

  toggleEditorVisibility(item: any): void {
    item.editorVisible = !item.editorVisible;
  }

  toggleLocalStorageVisibility(): void {
    this.showLocalStorage = !this.showLocalStorage;
  }

  handleStorageChange = (event: StorageEvent) => {
    if (event.storageArea === localStorage) {
      this.loadLocalStorageItems();
    }
  };
}
