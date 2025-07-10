import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadChildren: () => import('./features/features.route').then(m => m.routes) },
  { path: '**', redirectTo: '' }
];
