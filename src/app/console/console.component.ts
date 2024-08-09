import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-console',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './console.component.html',
  styleUrls: ['./console.component.scss'],
})
export class ConsoleComponent {
  consoleOutputs: string[] = []; // To store console logs
  showConsole: boolean = false; // Toggle to show/hide console, hidden by default

  constructor() {
    this.overrideConsole();
  }

  toggleConsoleVisibility(): void {
    this.showConsole = !this.showConsole;
  }

  private overrideConsole(): void {
    const originalLog = console.log;
    const originalError = console.error;

    console.log = (...args: any[]) => {
      this.logToConsole('LOG:', ...args);
      originalLog.apply(console, args);
    };

    console.error = (...args: any[]) => {
      this.logToConsole('ERROR:', ...args);
      originalError.apply(console, args);
    };
  }

  private logToConsole(...args: any[]): void {
    const message = args.join(' ');
    this.consoleOutputs.push(message);
  }
}
