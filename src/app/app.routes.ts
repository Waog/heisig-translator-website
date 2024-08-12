import { Routes } from '@angular/router';
import { FavoritesComponent } from './favorites/favorites.component';
import { TranslatorComponent } from './translator/translator.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'translator',
    pathMatch: 'full',
  },
  {
    path: 'translator',
    component: TranslatorComponent,
  },
  {
    path: 'favorites',
    component: FavoritesComponent,
  },
];
