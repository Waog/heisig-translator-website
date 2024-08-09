import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-container-with-buttons',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './container-with-buttons.component.html',
  styleUrls: ['./container-with-buttons.component.scss'],
})
export class ContainerWithButtonsComponent {}
