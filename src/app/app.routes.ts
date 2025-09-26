import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Accueil -> /auth/login
  { path: '', pathMatch: 'full', redirectTo: 'auth/login' },

  // Auth (lazy routes définies dans features/auth/auth.routes.ts)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
  },

  // Espace Admin (protégé)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  // (plus tard) Espace utilisateur
  // {
  //   path: 'app',
  //   canActivate: [authGuard],
  //   loadChildren: () =>
  //     import('./features/app/app.routes').then(m => m.APP_ROUTES),
  // },

  // Fallback
  { path: '**', redirectTo: 'auth/login' },
];
