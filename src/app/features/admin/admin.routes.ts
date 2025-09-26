import { Routes } from '@angular/router';
import { adminGuard } from '../../core/guards/admin.guard';
import { AdminLayoutComponent } from './components/admin-layout.component';
import { AdminUsersPageComponent } from './components/admin-users-page.component';
import { AdminGamesPageComponent } from './components/admin-games-page.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [adminGuard],
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'users', pathMatch: 'full' },
      { path: 'users', component: AdminUsersPageComponent },
      { path: 'games', component: AdminGamesPageComponent },
    ],
  },
];
