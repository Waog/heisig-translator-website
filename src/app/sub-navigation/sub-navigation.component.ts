import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SubNavigationItem } from './sub-navigation-item';

@Component({
  selector: 'app-sub-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sub-navigation.component.html',
  styleUrls: ['./sub-navigation.component.scss'],
})
export class SubNavigationComponent {
  @Input() items: SubNavigationItem[] = [];
}
