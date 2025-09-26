import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Redirige la racine vers /login par défaut
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  // Auth (standalone)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/components/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/components/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // Espace Admin (lazy)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () =>
      import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // Espace Utilisateur (lazy)
  {
    path: 'app',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/app/app.routes').then((m) => m.APP_ROUTES),
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];
