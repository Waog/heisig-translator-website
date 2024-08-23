import { Routes } from '@angular/router';
import { AnkiExportComponent } from './anki-export/anki-export.component';
import { AnkiImportComponent } from './anki-import/anki-import.component';
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
    children: [
      { path: 'import', component: AnkiImportComponent },
      { path: 'export', component: AnkiExportComponent },
      { path: '', redirectTo: 'import', pathMatch: 'full' }, // Default to import
    ],
  },
];
