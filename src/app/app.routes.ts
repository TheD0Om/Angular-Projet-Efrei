import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register.component').then(m => m.RegisterComponent),
  },

  // Espace Utilisateur (protégé)
  {
    path: 'app',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/app/app.routes').then(m => m.APP_ROUTES),
  },

  // Espace Admin (protégé + admin)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  { path: '**', redirectTo: 'login' },
];
