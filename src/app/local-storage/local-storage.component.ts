import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-local-storage',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './local-storage.component.html',
  styleUrls: ['./local-storage.component.scss'],
})
export class LocalStorageComponent implements OnInit {
  newInput: string = '';
  localStorageItems: { key: string; value: string }[] = [];

  ngOnInit() {
    this.loadLocalStorageItems();
  }

  saveInput() {
    if (this.newInput) {
      localStorage.setItem(`input-${Date.now()}`, this.newInput);
      this.newInput = '';
      this.loadLocalStorageItems();
    }
  }

  loadLocalStorageItems() {
    this.localStorageItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('input-')) {
        this.localStorageItems.push({
          key,
          value: localStorage.getItem(key) || '',
        });
      }
    }
  }

  deleteItem(key: string) {
    localStorage.removeItem(key);
    this.loadLocalStorageItems();
  }
}
