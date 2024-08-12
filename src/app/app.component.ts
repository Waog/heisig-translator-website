import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { ConsoleComponent } from './console/console.component';
import { LocalStorageComponent } from './local-storage/local-storage.component';
import { NavigationComponent } from './navigation/navigation.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavigationComponent,
    LocalStorageComponent,
    ConsoleComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  /**
   * Workaround from https://github.com/angular/angular/issues/12664#issuecomment-407285928
   * to preserve query params on page load
   */
  ngOnInit() {
    let routeParams: string;
    this.router.events.subscribe((routeEvent) => {
      if (!(routeEvent instanceof NavigationEnd)) {
        return;
      }

      const params = routeEvent.url.split('?')[1];

      if (params) {
        routeParams = params;
        return;
      }

      window.history.replaceState(
        {},
        '',
        `${location.pathname}${routeParams ? `?${routeParams}` : ''}`
      );
    });
  }
}
