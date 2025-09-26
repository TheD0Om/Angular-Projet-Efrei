import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <section class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-2xl font-semibold">Admin • BoardHub</h1>

      <nav class="mt-6 border-b border-gray-200">
        <ul class="flex gap-6 text-sm">
          <li><a routerLink="users" class="py-2 inline-block hover:text-blue-600">Utilisateurs</a></li>
          <li><a routerLink="games" class="py-2 inline-block hover:text-blue-600">Jeux</a></li>
        </ul>
      </nav>

      <div class="mt-6">
        <router-outlet></router-outlet>
      </div>
    </section>
  `,
})
export class AdminLayoutComponent {}
