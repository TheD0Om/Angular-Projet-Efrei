import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Redirige la racine vers /login si rien n’est précisé
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Auth (standalone, chargement direct des composants)
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

  // Espace Admin (lazy routes protégées)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard], // accès réservé aux admins connectés
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
  },

  // Espace Utilisateur (lazy routes protégées)
  {
    path: 'app',
    canActivate: [authGuard], // accès réservé à tout utilisateur connecté
    loadChildren: () =>
      import('./features/app/app.routes').then(m => m.APP_ROUTES),
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
