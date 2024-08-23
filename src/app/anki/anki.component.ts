import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubNavigationItem } from '../sub-navigation/sub-navigation-item';
import { SubNavigationComponent } from '../sub-navigation/sub-navigation.component';

@Component({
  selector: 'app-anki',
  standalone: true,
  imports: [CommonModule, RouterModule, SubNavigationComponent],
  templateUrl: './anki.component.html',
  styleUrls: ['./anki.component.scss'],
})
export class AnkiComponent {
  subNavItems: SubNavigationItem[] = [
    { label: 'Import', route: '/anki/import' },
    { label: 'Export', route: '/anki/export' },
  ];
}
