import { Routes } from '@angular/router';
import { UserHomeComponent } from './components/user-home.component';

export const APP_ROUTES: Routes = [
  { path: '', component: UserHomeComponent },
  {
    path: 'catalog',
    loadComponent: () =>
      import('./components/catalog.component').then(m => m.CatalogComponent),
  },
  {
    path: 'game/:id',
    loadComponent: () =>
      import('./components/game-detail.component').then(m => m.GameDetailComponent),
  },
];
