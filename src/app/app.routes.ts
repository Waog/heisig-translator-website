import { Routes } from '@angular/router';
import { AnkiComponent } from './anki/anki.component';
import { TranslatorComponent } from './translator/translator.component';
import { VocabularyComponent } from './vocabulary/vocabulary.component';

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
    path: 'vocabulary',
    component: VocabularyComponent,
  },
  {
    path: 'anki',
    component: AnkiComponent,
  },
];
